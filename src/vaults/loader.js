const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const DB_PATH = path.join(__dirname, '..', '..', 'eternal.db');
const CSV_PATH = path.join(__dirname, 'vault_tech_mapping.csv');

function categorize(vaultNo) {
  if (vaultNo <= 50) return 'Foundation';
  if (vaultNo <= 100) return 'Sovereignty';
  if (vaultNo <= 150) return 'Cosmic';
  if (vaultNo <= 250) return 'Archive';
  if (vaultNo <= 350) return 'Virtue';
  if (vaultNo <= 500) return 'Legacy';
  if (vaultNo <= 650) return 'Elemental';
  return 'Ascension';
}

function loadVaults() {
  const db = new DatabaseSync(DB_PATH);

  db.exec(`
    CREATE TABLE IF NOT EXISTS vaults (
      vault_no INTEGER PRIMARY KEY,
      vault_name TEXT NOT NULL,
      tech_crown TEXT NOT NULL,
      category TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  if (!fs.existsSync(CSV_PATH)) {
    console.error('CSV not found at ' + CSV_PATH);
    process.exit(1);
  }

  const raw = fs.readFileSync(CSV_PATH, 'utf8').trim().split('\n');
  const rows = raw.slice(1).map(function(line) {
    const parts = line.split(',');
    return {
      no: parseInt(parts[0], 10),
      name: parts[1],
      crown: parts.slice(2).join(',').trim()
    };
  }).filter(function(r) { return !isNaN(r.no); });

  const insert = db.prepare(
    'INSERT OR REPLACE INTO vaults (vault_no, vault_name, tech_crown, category) VALUES (?, ?, ?, ?)'
  );

  db.exec('BEGIN');
  for (const row of rows) {
    insert.run(row.no, row.name, row.crown, categorize(row.no));
  }
  db.exec('COMMIT');

  const count = db.prepare('SELECT COUNT(*) AS c FROM vaults').get();
  console.log('Loaded ' + count.c + ' vaults into ' + DB_PATH);
  db.close();
}

loadVaults();

