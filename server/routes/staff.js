const router = require('express').Router();
const { body, query, validationResult } = require('express-validator');
const { getDb } = require('../db');
const { requireStaff } = require('../middleware/auth');

const VALID_STATUSES = ['new', 'diagnosed', 'in-repair', 'awaiting-parts', 'ready', 'closed'];

const STATUS_LABELS = {
  new:             'New',
  diagnosed:       'Diagnosed',
  'in-repair':     'In repair',
  'awaiting-parts':'Awaiting parts',
  ready:           'Ready for pickup',
  closed:          'Closed',
};

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
      conditions.push('status = ?');
      params.push(status);
    }
    if (search) {
      conditions.push('(ticket_number LIKE ? OR client_name LIKE ? OR device LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const tickets = db
      .prepare(
        `SELECT id, ticket_number, status, device, serial,
                technician, priority, parts_needed, created_at, updated_at,
                client_name, client_email, client_phone
         FROM tickets
         ${where}
         ORDER BY created_at DESC`
      )
      .all(...params);

    res.json(tickets);
  }
);

// GET /api/staff/tickets/:id — full ticket detail with changelog
router.get('/tickets/:id', requireStaff, (req, res) => {
  const db = getDb();

  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const changelog = db
    .prepare(
      `SELECT author, message, kind, created_at
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

  res.json({ ...ticket, changelog, forms });
});

// PATCH /api/staff/tickets/:id
router.patch(
  '/tickets/:id',
  requireStaff,
  [
    body('status').optional().isIn(VALID_STATUSES),
    body('technician').optional().isString().trim().escape(),
    body('priority').optional().isIn(['high', 'med', 'low']),
    body('parts_needed').optional().isString().trim(),
    body('note').optional().isString().trim(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, technician, priority, parts_needed, note } = req.body;
    const db = getDb();

    const ticket = db
      .prepare('SELECT * FROM tickets WHERE id = ?')
      .get(req.params.id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    db.transaction(() => {
      const setClauses = [];
      const setParams = [];

      // Build UPDATE and collect human-readable change descriptions
      const changeLines = [];

      if (status !== undefined && status !== ticket.status) {
        setClauses.push('status = ?');
        setParams.push(status);
        changeLines.push(
          `Status: ${STATUS_LABELS[ticket.status] || ticket.status} → ${STATUS_LABELS[status]}`
        );
      }
      if (technician !== undefined && technician !== ticket.technician) {
        setClauses.push('technician = ?');
        setParams.push(technician);
        changeLines.push(
          `Assigned to: ${technician || 'Unassigned'}` +
          (ticket.technician ? ` (was: ${ticket.technician})` : '')
        );
      }
      if (priority !== undefined && priority !== ticket.priority) {
        setClauses.push('priority = ?');
        setParams.push(priority);
        changeLines.push(`Priority: ${ticket.priority} → ${priority}`);
      }
      if (parts_needed !== undefined && parts_needed !== ticket.parts_needed) {
        setClauses.push('parts_needed = ?');
        setParams.push(parts_needed);
        changeLines.push('Parts needed updated');
      }

      if (setClauses.length > 0) {
        setClauses.push("updated_at = datetime('now')");
        setParams.push(req.params.id);
        db.prepare(`UPDATE tickets SET ${setClauses.join(', ')} WHERE id = ?`).run(...setParams);

        // Auto-log the field changes as a single changelog entry
        db.prepare(
          "INSERT INTO ticket_updates (ticket_id, author, kind, message) VALUES (?, ?, 'change', ?)"
        ).run(req.params.id, req.user.name, changeLines.join('\n'));
      }

      // Manual note is a separate entry so it's visually distinct
      if (note) {
        db.prepare(
          "INSERT INTO ticket_updates (ticket_id, author, kind, message) VALUES (?, ?, 'note', ?)"
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
    body('formType').isIn(['equipment', 'pickup']),
    body('formData').isObject(),
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

      if (formType === 'equipment') {
        db.prepare(
          "INSERT INTO ticket_updates (ticket_id, author, kind, message) VALUES (?, ?, 'event', ?)"
        ).run(req.params.id, req.user.name, 'Equipment ledger completed. Device received.');
      }

      if (formType === 'pickup') {
        db.prepare(
          "UPDATE tickets SET status = 'closed', updated_at = datetime('now') WHERE id = ?"
        ).run(req.params.id);
        db.prepare(
          "INSERT INTO ticket_updates (ticket_id, author, kind, message) VALUES (?, ?, 'event', ?)"
        ).run(req.params.id, req.user.name, 'Pickup receipt signed. Device returned to customer. Ticket closed.');
      }
    })();

    res.json({ ok: true });
  }
);

module.exports = router;
