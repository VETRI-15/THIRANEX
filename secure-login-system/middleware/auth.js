function requireAuth(req, res, next) {
  if (!req.session.userId) {
    req.session.flash = { error: 'Please log in to continue.' };
    return res.redirect('/auth/login');
  }
  next();
}

function requireNoAuth(req, res, next) {
  if (req.session.userId) return res.redirect('/dashboard');
  next();
}

module.exports = { requireAuth, requireNoAuth };
