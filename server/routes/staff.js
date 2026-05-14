const router = require('express').Router();
const { body, query, validationResult } = require('express-validator');
const { getDb } = require('../db');
const { requireStaff } = require('../middleware/auth');

const VALID_STATUSES = ['new', 'diagnosed', 'in-repair', 'awaiting-parts', 'ready', 'closed'];

// GET /api/staff/tickets
router.get(
  '/tickets',
  requireStaff,
  [
    query('status').optional().isIn(VALID_STATUSES),
    query('search').optional().isString().trim(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, search } = req.query;
    const db = getDb();

    const conditions = [];
    const params = [];

    if (status) {
      conditions.push('t.status = ?');
      params.push(status);
    }
    if (search) {
      conditions.push('(t.ticket_number LIKE ? OR u.name LIKE ? OR t.device LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const tickets = db
      .prepare(
        `SELECT t.id, t.ticket_number, t.status, t.device, t.serial,
                t.technician, t.priority, t.created_at, t.updated_at,
                u.name AS client_name, u.email AS client_email, u.phone AS client_phone
         FROM tickets t
         LEFT JOIN users u ON u.id = t.user_id
         ${where}
         ORDER BY t.created_at DESC`
      )
      .all(...params);

    res.json(tickets);
  }
);

// GET /api/staff/tickets/:id — full ticket detail
router.get('/tickets/:id', requireStaff, (req, res) => {
  const db = getDb();

  const ticket = db
    .prepare(
      `SELECT t.*, u.name AS client_name, u.email AS client_email,
              u.phone AS client_phone, u.student_id
       FROM tickets t
       LEFT JOIN users u ON u.id = t.user_id
       WHERE t.id = ?`
    )
    .get(req.params.id);

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const updates = db
    .prepare(
      `SELECT author, message, created_at
       FROM ticket_updates WHERE ticket_id = ? ORDER BY created_at DESC`
    )
    .all(ticket.id);

  const forms = db
    .prepare(
      `SELECT form_type, form_data, created_at
       FROM form_submissions WHERE ticket_id = ? ORDER BY created_at ASC`
    )
    .all(ticket.id)
    .map((f) => ({ ...f, form_data: JSON.parse(f.form_data) }));

  res.json({ ...ticket, updates, forms });
});

// PATCH /api/staff/tickets/:id — update status, tech, priority, add a note
router.patch(
  '/tickets/:id',
  requireStaff,
  [
    body('status').optional().isIn(VALID_STATUSES),
    body('technician').optional().isString().trim(),
    body('priority').optional().isIn(['high', 'med', 'low']),
    body('note').optional().isString().trim(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, technician, priority, note } = req.body;
    const db = getDb();

    const ticket = db.prepare('SELECT id FROM tickets WHERE id = ?').get(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    db.transaction(() => {
      const setClauses = [];
      const params = [];

      if (status !== undefined) { setClauses.push('status = ?'); params.push(status); }
      if (technician !== undefined) { setClauses.push('technician = ?'); params.push(technician); }
      if (priority !== undefined) { setClauses.push('priority = ?'); params.push(priority); }

      if (setClauses.length > 0) {
        setClauses.push("updated_at = datetime('now')");
        params.push(req.params.id);
        db.prepare(`UPDATE tickets SET ${setClauses.join(', ')} WHERE id = ?`).run(...params);
      }

      if (note) {
        db.prepare(
          'INSERT INTO ticket_updates (ticket_id, author, message) VALUES (?, ?, ?)'
        ).run(req.params.id, req.user.name, note);
      }
    })();

    res.json({ ok: true });
  }
);

// POST /api/staff/tickets/:id/forms — equipment ledger or pickup receipt
router.post(
  '/tickets/:id/forms',
  requireStaff,
  [
    body('formType').isIn(['equipment', 'pickup']).withMessage('formType must be equipment or pickup'),
    body('formData').isObject().withMessage('formData must be an object'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { formType, formData } = req.body;
    const db = getDb();

    const ticket = db.prepare('SELECT id FROM tickets WHERE id = ?').get(req.params.id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    db.transaction(() => {
      db.prepare(
        'INSERT INTO form_submissions (ticket_id, form_type, form_data) VALUES (?, ?, ?)'
      ).run(req.params.id, formType, JSON.stringify(formData));

      if (formType === 'pickup') {
        db.prepare(
          "UPDATE tickets SET status = 'closed', updated_at = datetime('now') WHERE id = ?"
        ).run(req.params.id);
        db.prepare(
          'INSERT INTO ticket_updates (ticket_id, author, message) VALUES (?, ?, ?)'
        ).run(req.params.id, req.user.name, 'Pickup receipt signed. Ticket closed.');
      }

      if (formType === 'equipment') {
        db.prepare(
          'INSERT INTO ticket_updates (ticket_id, author, message) VALUES (?, ?, ?)'
        ).run(req.params.id, req.user.name, 'Equipment ledger completed at drop-off.');
      }
    })();

    res.json({ ok: true });
  }
);

module.exports = router;
