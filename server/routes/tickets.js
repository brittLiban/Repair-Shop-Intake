const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db');

function generateTicketNumber() {
  const d = new Date();
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `GRC-${yy}${mm}${dd}-${rand}`;
}

// POST /api/tickets/intake — public, no auth required
router.post(
  '/intake',
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

    // Pull client contact info from the work order form so the staff queue
    // can display it without needing a user account
    const clientName  = (workOrderData.name  || '').trim();
    const clientEmail = (workOrderData.email || '').trim();
    const clientPhone = (workOrderData.phone || '').trim();
    const device      = (issueData.device    || '').trim();
    const serial      = (issueData.serial    || '').trim();

    const insertTicket = db.prepare(
      `INSERT INTO tickets
         (ticket_number, client_name, client_email, client_phone, device, serial)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    const insertForm = db.prepare(
      'INSERT INTO form_submissions (ticket_id, form_type, form_data) VALUES (?, ?, ?)'
    );
    const insertUpdate = db.prepare(
      'INSERT INTO ticket_updates (ticket_id, author, message) VALUES (?, ?, ?)'
    );

    const ticketId = db.transaction(() => {
      const { lastInsertRowid } = insertTicket.run(
        ticketNumber, clientName, clientEmail, clientPhone, device, serial
      );
      insertForm.run(lastInsertRowid, 'issue',     JSON.stringify(issueData));
      insertForm.run(lastInsertRowid, 'policies',  JSON.stringify(policiesData));
      insertForm.run(lastInsertRowid, 'workorder', JSON.stringify(workOrderData));
      insertUpdate.run(lastInsertRowid, 'System', 'Intake forms submitted. Waiting for equipment drop-off.');
      return lastInsertRowid;
    })();

    res.status(201).json({ ticketNumber, ticketId });
  }
);

// GET /api/tickets/status/:ticketNumber — public lookup by ticket number
router.get('/status/:ticketNumber', (req, res) => {
  const db = getDb();
  const ticket = db
    .prepare(
      `SELECT ticket_number, device, serial, status, priority, created_at, updated_at
       FROM tickets WHERE ticket_number = ?`
    )
    .get(req.params.ticketNumber.toUpperCase());

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found. Check the number and try again.' });
  }

  const updates = db
    .prepare(
      `SELECT author, kind, message, created_at
       FROM ticket_updates
       WHERE ticket_id = (SELECT id FROM tickets WHERE ticket_number = ?)
         AND kind IN ('note', 'event')
       ORDER BY created_at ASC`
    )
    .all(req.params.ticketNumber.toUpperCase());

  res.json({ ...ticket, updates });
});

// POST /api/tickets/find-by-email — public lookup by email (forgot ticket number)
router.post(
  '/find-by-email',
  [body('email').isEmail().normalizeEmail()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const db = getDb();
    const tickets = db
      .prepare(
        `SELECT ticket_number, device, status, created_at
         FROM tickets WHERE client_email = ? COLLATE NOCASE
         ORDER BY created_at DESC`
      )
      .all(req.body.email);

    res.json({ tickets });
  }
);

// POST /api/tickets/find-by-name-phone — public lookup by name + phone
router.post(
  '/find-by-name-phone',
  [
    body('name').isString().trim().notEmpty(),
    body('phone').isString().trim().notEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Please enter both your name and phone number.' });
    }

    const db = getDb();
    // Strip non-digits for a loose phone match
    const { name, phone } = req.body;
    const digitsOnly = phone.replace(/\D/g, '');

    const tickets = db
      .prepare(
        `SELECT ticket_number, device, status, created_at
         FROM tickets
         WHERE client_name LIKE ? COLLATE NOCASE
           AND REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(client_phone,'-',''),'(',''),')',''),' ',''),'.','') LIKE ?
         ORDER BY created_at DESC`
      )
      .all(`%${name}%`, `%${digitsOnly}%`);

    res.json({ tickets });
  }
);

module.exports = router;
