const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'grc-dev-secret-change-in-production';

function requireAuth(req, res, next) {
  const token = req.cookies?.grc_token;
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

function requireStaff(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'staff') {
      return res.status(403).json({ error: 'Staff access required' });
    }
    next();
  });
}

module.exports = { requireAuth, requireStaff };
