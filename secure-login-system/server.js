const express = require('express');
const session = require('express-session');
const path    = require('path');
const crypto  = require('crypto');

const authRoutes    = require('./routes/auth');
const dashRoutes    = require('./routes/dashboard');
const { requireAuth } = require('./middleware/auth');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
  secret: crypto.randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: false, maxAge: 1000 * 60 * 30 },
  name: 'sls.sid'
}));

app.use((req, res, next) => {
  res.locals.flash = req.session.flash || {};
  delete req.session.flash;
  next();
});

app.use('/auth', authRoutes);
app.use('/dashboard', requireAuth, dashRoutes);

app.get('/', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.redirect('/auth/login');
});

app.use((req, res) => res.status(404).render('error', { message: '404 — Page not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`\n✅ Secure Login System running at http://localhost:${PORT}\n`));
