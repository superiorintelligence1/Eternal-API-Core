CREATE TABLE IF NOT EXISTS vaults (
  vault_no INTEGER PRIMARY KEY,
  vault_name TEXT NOT NULL,
  tech_crown TEXT NOT NULL,
  category TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_vaults_name ON vaults(vault_name);
CREATE INDEX IF NOT EXISTS idx_vaults_crown ON vaults(tech_crown);
CREATE INDEX IF NOT EXISTS idx_vaults_category ON vaults(category);

