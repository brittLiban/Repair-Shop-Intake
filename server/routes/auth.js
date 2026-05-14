const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'grc-dev-secret-change-in-production';

const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

const publicUser = (u) => ({
  id: u.id,
  email: u.email,
  name: u.name,
  role: u.role,
});

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('name').trim().notEmpty().withMessage('Name required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, password, phone, studentId } = req.body;
    const db = getDb();

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const hash = bcrypt.hashSync(password, 10);
    const { lastInsertRowid } = db
      .prepare('INSERT INTO users (email, name, password, phone, student_id) VALUES (?, ?, ?, ?, ?)')
      .run(email, name, hash, phone || null, studentId || null);

    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(lastInsertRowid);
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const db = getDb();

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.json({ token: signToken(user), user: publicUser(user) });
  }
);

module.exports = router;
