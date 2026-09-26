// SQLite shim - accepts Postgres $1,$2 placeholders and NOW(), returns {rows:[...]}
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'eternal.db');
const db = new DatabaseSync(dbPath);

db.exec([
  "CREATE TABLE IF NOT EXISTS rails (",
  "  id INTEGER PRIMARY KEY AUTOINCREMENT,",
  "  name TEXT NOT NULL,",
  "  description TEXT,",
  "  status TEXT NOT NULL DEFAULT 'INACTIVE',",
  "  created_at TEXT DEFAULT (datetime('now')),",
  "  updated_at TEXT DEFAULT (datetime('now'))",
  ");",
  "CREATE TABLE IF NOT EXISTS whitelist (",
  "  id INTEGER PRIMARY KEY AUTOINCREMENT,",
  "  caller TEXT NOT NULL,",
  "  rail TEXT NOT NULL,",
  "  created_at TEXT DEFAULT (datetime('now'))",
  ");",
  "CREATE TABLE IF NOT EXISTS ticker_log (",
  "  id INTEGER PRIMARY KEY AUTOINCREMENT,",
  "  rail_id INTEGER NOT NULL,",
  "  pair TEXT NOT NULL,",
  "  bid TEXT,",
  "  ask TEXT,",
  "  last_trade TEXT,",
  "  rolling_24h_volume TEXT,",
  "  timestamp_ms INTEGER,",
  "  fetched_at TEXT DEFAULT (datetime('now'))",
  ");"
].join('\n'));

function convert(sql, params) {
  const ordered = [];
  let converted = sql.replace(/NOW\s*\(\s*\)/gi, "datetime('now')");
  converted = converted.replace(/\$(\d+)/g, function(_, n) {
    ordered.push(params[parseInt(n, 10) - 1]);
    return '?';
  });
  return { sql: converted, params: ordered };
}

async function query(text, params) {
  params = params || [];
  const c = convert(text, params);
  const stmt = db.prepare(c.sql);
  const upper = text.trim().toUpperCase();
  const returnsRows = upper.indexOf('SELECT') === 0 || upper.indexOf('RETURNING') !== -1;
  if (returnsRows) {
    return { rows: stmt.all.apply(stmt, c.params) };
  }
  const info = stmt.run.apply(stmt, c.params);
  return { rows: [], changes: info.changes, lastInsertRowid: info.lastInsertRowid };
}

module.exports = { query: query, db: db };
