const express = require('express');
const bcrypt  = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const user = db.findById(req.session.userId);
  res.render('dashboard', { user });
});

// Change password
router.post('/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Must contain uppercase')
      .matches(/[0-9]/).withMessage('Must contain a number')
      .matches(/[^a-zA-Z0-9]/).withMessage('Must contain a special character'),
    body('confirmNewPassword').custom((val, { req }) => {
      if (val !== req.body.newPassword) throw new Error('Passwords do not match');
      return true;
    }),
  ],
  async (req, res) => {
    const user   = db.findById(req.session.userId);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      req.session.flash = { error: errors.array()[0].msg };
      return res.redirect('/dashboard');
    }

    const match = await bcrypt.compare(req.body.currentPassword, user.passwordHash);
    if (!match) {
      req.session.flash = { error: 'Current password is incorrect.' };
      return res.redirect('/dashboard');
    }

    const hash = await bcrypt.hash(req.body.newPassword, 12);
    db.updateUser(user.id, { passwordHash: hash });
    req.session.flash = { success: 'Password changed successfully!' };
    res.redirect('/dashboard');
  }
);

module.exports = router;
