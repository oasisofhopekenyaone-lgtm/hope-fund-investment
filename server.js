const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Database = require('better-sqlite3');

const app = express();
const port = process.env.PORT || 3000;
const adminPassword = process.env.ADMIN_PASSWORD;
if (!adminPassword || adminPassword.length < 16) {
  console.error('ADMIN_PASSWORD must be set to at least 16 characters.');
  process.exit(1);
}
const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'hope-fund.sqlite');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS deposits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount INTEGER NOT NULL CHECK(amount > 0),
    receipt TEXT NOT NULL UNIQUE,
    account_ref TEXT NOT NULL,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TEXT
  );
  CREATE TABLE IF NOT EXISTS daraja_callbacks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payload TEXT NOT NULL,
    received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

app.use(express.json({ limit: '20kb' }));
app.use(express.static(__dirname, { index: 'index.html' }));

function requireAdmin(req, res, next) {
  const supplied = req.get('x-admin-password') || '';
  const a = Buffer.from(supplied);
  const b = Buffer.from(adminPassword);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/api/deposit/submit', (req, res) => {
  const amount = Number(req.body.amount);
  const receipt = String(req.body.receipt || '').trim().toUpperCase();
  const accountRef = String(req.body.account_ref || '').trim();
  const phone = String(req.body.phone || '').trim();
  const cleanPhone = phone.replace(/[\s-]/g, '');
  if (!Number.isSafeInteger(amount) || amount < 1 || amount > 100000000 ||
      !/^[A-Z0-9]{6,12}$/.test(receipt) || accountRef !== '47715' ||
      (phone && !/^\+?\d{9,15}$/.test(cleanPhone))) {
    return res.status(400).json({ error: 'Please check the amount, receipt, account reference, and phone.' });
  }
  try {
    db.prepare('INSERT INTO deposits (amount, receipt, account_ref, phone) VALUES (?, ?, ?, ?)')
      .run(amount, receipt, accountRef, cleanPhone || null);
    res.status(201).json({ message: 'Receipt submitted. It is pending administrator verification.' });
  } catch (err) {
    if (String(err.code).includes('SQLITE_CONSTRAINT')) {
      return res.status(409).json({ error: 'This receipt has already been submitted.' });
    }
    res.status(500).json({ error: 'Unable to save submission.' });
  }
});

app.get('/api/admin/deposits', requireAdmin, (_req, res) => {
  res.json(db.prepare('SELECT * FROM deposits ORDER BY id DESC').all());
});

app.post('/api/admin/deposits/:id/:action', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const action = req.params.action;
  if (!Number.isSafeInteger(id) || id < 1 || !['verify', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'Invalid action.' });
  }
  const status = action === 'verify' ? 'VERIFIED' : 'REJECTED';
  const result = db.prepare('UPDATE deposits SET status = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ? AND status = ?')
    .run(status, id, 'PENDING');
  if (!result.changes) return res.status(404).json({ error: 'Pending deposit not found.' });
  res.json({ message: `Deposit ${status.toLowerCase()}.` });
});

// Safaricom callback payloads are stored for review only; no balance is credited.
app.post('/api/daraja/c2b/confirmation', (req, res) => {
  db.prepare('INSERT INTO daraja_callbacks (payload) VALUES (?)').run(JSON.stringify(req.body || {}));
  res.json({ ResultCode: 0, ResultDesc: 'Accepted for review' });
});

app.listen(port, '0.0.0.0', () => console.log(`Hope Fund server listening on ${port}`));
