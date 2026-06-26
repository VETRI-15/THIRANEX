const express   = require('express');
const bcrypt    = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const speakeasy = require('speakeasy');
const qrcode    = require('qrcode');
const db        = require('../db');
const { requireNoAuth, requireAuth } = require('../middleware/auth');

const router = express.Router();

// ── Rate limiter: max 10 login attempts per 15 min per IP ──
const loginLimiter = rateLimit({
  windowMs : 15 * 60 * 1000,
  max      : 10,
  message  : 'Too many login attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders  : false,
});

// ════════════════════════════════════════════════
//  REGISTER
// ════════════════════════════════════════════════
router.get('/register', requireNoAuth, (req, res) => {
  res.render('register', { errors: [], old: {} });
});

router.post('/register',
  requireNoAuth,
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 20 }).withMessage('Username must be 3–20 characters')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
    body('email')
      .trim().normalizeEmail()
      .isEmail().withMessage('Enter a valid email address'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number')
      .matches(/[^a-zA-Z0-9]/).withMessage('Password must contain at least one special character'),
    body('confirmPassword')
      .custom((val, { req }) => {
        if (val !== req.body.password) throw new Error('Passwords do not match');
        return true;
      }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('register', {
        errors: errors.array(),
        old   : { username: req.body.username, email: req.body.email },
      });
    }

    const { username, email, password } = req.body;

    // Check duplicates
    if (db.findByEmail(email)) {
      return res.render('register', {
        errors: [{ msg: 'An account with this email already exists.' }],
        old   : { username, email },
      });
    }
    if (db.findByUsername(username)) {
      return res.render('register', {
        errors: [{ msg: 'Username already taken.' }],
        old   : { username, email },
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    db.createUser({ username, email, passwordHash });

    req.session.flash = { success: 'Account created! Please log in.' };
    res.redirect('/auth/login');
  }
);

// ════════════════════════════════════════════════
//  LOGIN
// ════════════════════════════════════════════════
router.get('/login', requireNoAuth, (req, res) => {
  res.render('login', { errors: [], old: {} });
});

router.post('/login',
  requireNoAuth,
  loginLimiter,
  [
    body('email').trim().normalizeEmail().isEmail().withMessage('Enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('login', {
        errors: errors.array(),
        old   : { email: req.body.email },
      });
    }

    const { email, password } = req.body;
    const user = db.findByEmail(email);

    // Account lockout check
    if (user && user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const mins = Math.ceil((new Date(user.lockedUntil) - new Date()) / 60000);
      return res.render('login', {
        errors: [{ msg: `Account locked. Try again in ${mins} minute(s).` }],
        old   : { email },
      });
    }

    const valid = user && await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      if (user) {
        const attempts = (user.loginAttempts || 0) + 1;
        const updates  = { loginAttempts: attempts };
        if (attempts >= 5) {
          updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
          updates.loginAttempts = 0;
        }
        db.updateUser(user.id, updates);
      }
      return res.render('login', {
        errors: [{ msg: 'Invalid email or password.' }],
        old   : { email },
      });
    }

    // Reset attempts on successful password
    db.updateUser(user.id, { loginAttempts: 0, lockedUntil: null });

    // ── 2FA check ──
    if (user.twoFAEnabled) {
      req.session.pending2FA = user.id;
      return res.redirect('/auth/2fa-verify');
    }

    req.session.userId   = user.id;
    req.session.username = user.username;
    res.redirect('/dashboard');
  }
);

// ════════════════════════════════════════════════
//  TWO-FACTOR AUTH — VERIFY
// ════════════════════════════════════════════════
router.get('/2fa-verify', (req, res) => {
  if (!req.session.pending2FA) return res.redirect('/auth/login');
  res.render('2fa-verify', { error: null });
});

router.post('/2fa-verify', (req, res) => {
  if (!req.session.pending2FA) return res.redirect('/auth/login');
  const user  = db.findById(req.session.pending2FA);
  const token = (req.body.token || '').replace(/\s/g, '');

  const valid = speakeasy.totp.verify({
    secret  : user.twoFASecret,
    encoding: 'base32',
    token,
    window  : 1,
  });

  if (!valid) {
    return res.render('2fa-verify', { error: 'Invalid or expired code. Try again.' });
  }

  delete req.session.pending2FA;
  req.session.userId   = user.id;
  req.session.username = user.username;
  res.redirect('/dashboard');
});

// ════════════════════════════════════════════════
//  TWO-FACTOR AUTH — SETUP
// ════════════════════════════════════════════════
router.get('/2fa-setup', requireAuth, async (req, res) => {
  const user   = db.findById(req.session.userId);
  const secret = speakeasy.generateSecret({ name: `SecureLogin (${user.email})` });
  req.session.temp2FASecret = secret.base32;

  const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url);
  res.render('2fa-setup', { qrDataUrl, secret: secret.base32, error: null });
});

router.post('/2fa-setup', requireAuth, (req, res) => {
  const secret = req.session.temp2FASecret;
  const token  = (req.body.token || '').replace(/\s/g, '');

  const valid = speakeasy.totp.verify({
    secret, encoding: 'base32', token, window: 1,
  });

  if (!valid) {
    return res.render('2fa-setup', {
      qrDataUrl: req.body.qrDataUrl,
      secret,
      error: 'Code incorrect. Please scan again and retry.',
    });
  }

  db.updateUser(req.session.userId, { twoFAEnabled: true, twoFASecret: secret });
  delete req.session.temp2FASecret;
  req.session.flash = { success: '2FA enabled successfully!' };
  res.redirect('/dashboard');
});

// Disable 2FA
router.post('/2fa-disable', requireAuth, (req, res) => {
  db.updateUser(req.session.userId, { twoFAEnabled: false, twoFASecret: null });
  req.session.flash = { success: '2FA has been disabled.' };
  res.redirect('/dashboard');
});

// ════════════════════════════════════════════════
//  LOGOUT
// ════════════════════════════════════════════════
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sls.sid');
    res.redirect('/auth/login');
  });
});

module.exports = router;
