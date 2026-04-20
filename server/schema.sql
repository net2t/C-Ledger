BEGIN;

CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  tm_number TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  case_type TEXT NOT NULL DEFAULT '',
  phase INTEGER NOT NULL DEFAULT 1 CHECK (phase BETWEEN 1 AND 4),
  assigned_to TEXT NOT NULL DEFAULT '',
  deadline_date TEXT,
  remarks TEXT NOT NULL DEFAULT '',

  submitted_date TEXT,
  acknowledged_date TEXT,
  published_date TEXT,
  completed_date TEXT,

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cases_phase ON cases(phase);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_to ON cases(assigned_to);
CREATE INDEX IF NOT EXISTS idx_cases_deadline ON cases(deadline_date);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL,
  tm_number TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('in','out')),
  amount REAL NOT NULL CHECK (amount > 0),
  date TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT '',
  ref_no TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY(case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_payments_case_id ON payments(case_id);
CREATE INDEX IF NOT EXISTS idx_payments_tm_number ON payments(tm_number);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);

COMMIT;
