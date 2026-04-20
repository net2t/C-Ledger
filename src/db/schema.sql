-- ============================================================
-- Database Schema for C-Ledger (TM-Centric Case Management)
-- ============================================================

-- Cases table: Primary entity for trademark cases
CREATE TABLE IF NOT EXISTS cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tm_number TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  case_type TEXT CHECK(case_type IN ('X', 'Y', 'B', '')),
  phase TEXT DEFAULT 'Submitted' CHECK(phase IN ('Submitted', 'Acknowledged', 'Published', 'Completed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  remarks TEXT
);

-- Payments table: Ledger entries linked to cases
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL,
  date DATE NOT NULL,
  folder_no TEXT,
  stage TEXT,
  class TEXT,
  details TEXT,
  due_amount REAL DEFAULT 0,
  received_amount REAL DEFAULT 0,
  balance_amount REAL DEFAULT 0,
  type TEXT DEFAULT 'normal' CHECK(type IN ('normal', 'received', 'opening')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- Settings table: Application settings
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cases_tm_number ON cases(tm_number);
CREATE INDEX IF NOT EXISTS idx_cases_phase ON cases(phase);
CREATE INDEX IF NOT EXISTS idx_payments_case_id ON payments(case_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);

-- Trigger to update updated_at timestamp on cases
CREATE TRIGGER IF NOT EXISTS update_cases_timestamp
AFTER UPDATE ON cases
BEGIN
  UPDATE cases SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
