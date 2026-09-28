const express = require('express');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const router = express.Router();
const DB_PATH = path.join(__dirname, '..', '..', 'eternal.db');

function getDb() {
  return new DatabaseSync(DB_PATH);
}

router.get('/', function(req, res) {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 500);
  const offset = parseInt(req.query.offset, 10) || 0;
  const db = getDb();
  const rows = db.prepare('SELECT * FROM vaults ORDER BY vault_no LIMIT ? OFFSET ?').all(limit, offset);
  const total = db.prepare('SELECT COUNT(*) AS c FROM vaults').get().c;
  db.close();
  res.json({ total: total, limit: limit, offset: offset, vaults: rows });
});

router.get('/stats', function(req, res) {
  const db = getDb();
  const byCategory = db.prepare('SELECT category, COUNT(*) AS count FROM vaults GROUP BY category ORDER BY count DESC').all();
  const total = db.prepare('SELECT COUNT(*) AS c FROM vaults').get().c;
  db.close();
  res.json({ total: total, categories: byCategory });
});

router.get('/search/:term', function(req, res) {
  const term = '%' + req.params.term + '%';
  const db = getDb();
  const rows = db.prepare(
    'SELECT * FROM vaults WHERE vault_name LIKE ? OR tech_crown LIKE ? ORDER BY vault_no LIMIT 100'
  ).all(term, term);
  db.close();
  res.json({ query: req.params.term, results: rows });
});
router.get('/:no', function(req, res) {
  const no = parseInt(req.params.no, 10);
  if (isNaN(no)) {
    return res.status(400).json({ error: 'vault_no must be a number' });
  }
  const db = getDb();
  const row = db.prepare('SELECT * FROM vaults WHERE vault_no = ?').get(no);
  db.close();
  if (!row) {
    return res.status(404).json({ error: 'Vault not found' });
  }
  res.json(row);
});

module.exports = router;

