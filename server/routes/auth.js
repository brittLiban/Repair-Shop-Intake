const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'grc-dev-secret-change-in-production';
const isProd = process.env.NODE_ENV === 'production';

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'strict',
  secure: isProd,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name, role: u.role });

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const { email, password } = req.body;
    const db = getDb();

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.cookie('grc_token', signToken(user), COOKIE_OPTS);
    res.json({ user: publicUser(user) });
  }
);

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('grc_token', { httpOnly: true, sameSite: 'strict', secure: isProd });
  res.json({ ok: true });
});

// GET /api/auth/me — verify cookie and return current user
router.get('/me', (req, res) => {
  const token = req.cookies?.grc_token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'staff') return res.status(403).json({ error: 'Staff access required' });
    res.json({ user: publicUser(payload) });
  } catch {
    res.status(401).json({ error: 'Invalid or expired session.' });
  }
});

module.exports = router;
