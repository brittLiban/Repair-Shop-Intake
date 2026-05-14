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

module.exports = router;
