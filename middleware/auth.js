const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  req.flash('error', 'Please log in to continue');
  res.redirect('/auth/login');
};

const isAdmin = (req, res, next) => {
  if (req.session && req.session.userId && req.session.userRole === 'admin') {
    return next();
  }
  req.flash('error', 'Access denied. Admins only.');
  res.redirect('/');
};

const isSeller = (req, res, next) => {
  if (
    req.session &&
    req.session.userId &&
    (req.session.userRole === 'seller' || req.session.userRole === 'admin')
  ) {
    return next();
  }
  req.flash('error', 'Access denied. Sellers only.');
  res.redirect('/');
};

const isNotAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return next();
  }
  res.redirect('/');
};

module.exports = { isAuthenticated, isAdmin, isSeller, isNotAuthenticated };
