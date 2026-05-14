const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db');
const { requireAuth } = require('../middleware/auth');

function generateTicketNumber() {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `GRC-${yy}${mm}${dd}-${rand}`;
}

// POST /api/tickets/intake — submit all 3 client-facing forms at once
router.post(
  '/intake',
  requireAuth,
  [
    body('issueData').isObject().withMessage('Issue form data required'),
    body('policiesData').isObject().withMessage('Policies form data required'),
    body('workOrderData').isObject().withMessage('Work order form data required'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { issueData, policiesData, workOrderData } = req.body;
    const db = getDb();

    const ticketNumber = generateTicketNumber();
    const device = workOrderData.device || issueData.device || '';
    const serial = workOrderData.serial || '';

    const insertTicket = db.prepare(
      'INSERT INTO tickets (ticket_number, user_id, device, serial) VALUES (?, ?, ?, ?)'
    );
    const insertForm = db.prepare(
      'INSERT INTO form_submissions (ticket_id, form_type, form_data) VALUES (?, ?, ?)'
    );
    const insertUpdate = db.prepare(
      'INSERT INTO ticket_updates (ticket_id, author, message) VALUES (?, ?, ?)'
    );

    const ticketId = db.transaction(() => {
      const { lastInsertRowid } = insertTicket.run(ticketNumber, req.user.id, device, serial);
      insertForm.run(lastInsertRowid, 'issue', JSON.stringify(issueData));
      insertForm.run(lastInsertRowid, 'policies', JSON.stringify(policiesData));
      insertForm.run(lastInsertRowid, 'workorder', JSON.stringify(workOrderData));
      insertUpdate.run(lastInsertRowid, 'System', 'Intake forms submitted. Waiting for equipment drop-off.');
      return lastInsertRowid;
    })();

    res.status(201).json({ ticketNumber, ticketId });
  }
);

// GET /api/tickets — list my tickets
router.get('/', requireAuth, (req, res) => {
  const db = getDb();

  const tickets = db
    .prepare(
      `SELECT id, ticket_number, status, device, serial, technician, priority, created_at, updated_at
       FROM tickets WHERE user_id = ? ORDER BY created_at DESC`
    )
    .all(req.user.id);

  const withUpdates = tickets.map((t) => ({
    ...t,
    updates: db
      .prepare(
        `SELECT author, message, created_at
         FROM ticket_updates WHERE ticket_id = ?
         ORDER BY created_at DESC LIMIT 5`
      )
      .all(t.id),
  }));

  res.json(withUpdates);
});

// GET /api/tickets/:id — single ticket (customer sees own only)
router.get('/:id', requireAuth, (req, res) => {
  const db = getDb();

  const ticket = db
    .prepare('SELECT * FROM tickets WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }

  const updates = db
    .prepare(
      `SELECT author, message, created_at
       FROM ticket_updates WHERE ticket_id = ? ORDER BY created_at DESC`
    )
    .all(ticket.id);

  res.json({ ...ticket, updates });
});

module.exports = router;
