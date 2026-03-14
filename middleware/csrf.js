const crypto = require('crypto');

/**
 * Synchronizer Token Pattern CSRF protection middleware.
 * - Generates a random token per session on GET requests.
 * - Validates the token on state-changing requests (POST/PUT/DELETE/PATCH).
 */
const csrfProtection = (req, res, next) => {
  // Ensure a CSRF token exists in the session
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }

  // Expose token to all views
  res.locals.csrfToken = req.session.csrfToken;

  const method = req.method.toUpperCase();
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const bodyToken = req.body && req.body._csrf;
    const headerToken = req.headers['x-csrf-token'];
    const submitted = bodyToken || headerToken;

    if (!submitted || submitted !== req.session.csrfToken) {
      res.status(403).render('404', { title: 'Forbidden - Invalid CSRF token' });
      return;
    }
  }

  next();
};

module.exports = csrfProtection;
