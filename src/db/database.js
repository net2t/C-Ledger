// ============================================================
// SQLite Database Connection and Operations
// ============================================================

import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DB_PATH = join(process.cwd(), 'ledger.db');
const SCHEMA_PATH = join(__dirname, 'schema.sql');

let db = null;

// Initialize database connection
export function initDatabase() {
  try {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL'); // Better concurrency
    
    // Create tables from schema
    const schema = readFileSync(SCHEMA_PATH, 'utf-8');
    db.exec(schema);
    
    console.log('Database initialized successfully at:', DB_PATH);
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Get database instance
export function getDatabase() {
  if (!db) {
    return initDatabase();
  }
  return db;
}

// Close database connection
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

// ============================================================
// CASE OPERATIONS
// ============================================================

export function createCase(caseData) {
  const database = getDatabase();
  const stmt = database.prepare(`
    INSERT INTO cases (tm_number, client_name, case_type, phase, remarks)
    VALUES (?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    caseData.tm_number,
    caseData.client_name,
    caseData.case_type || '',
    caseData.phase || 'Submitted',
    caseData.remarks || ''
  );
  return result.lastInsertRowid;
}

export function getCaseByTMNumber(tmNumber) {
  const database = getDatabase();
  const stmt = database.prepare('SELECT * FROM cases WHERE tm_number = ?');
  return stmt.get(tmNumber);
}

export function getCaseById(id) {
  const database = getDatabase();
  const stmt = database.prepare('SELECT * FROM cases WHERE id = ?');
  return stmt.get(id);
}

export function getAllCases() {
  const database = getDatabase();
  const stmt = database.prepare('SELECT * FROM cases ORDER BY created_at DESC');
  return stmt.all();
}

export function updateCase(id, caseData) {
  const database = getDatabase();
  const stmt = database.prepare(`
    UPDATE cases 
    SET client_name = ?, case_type = ?, phase = ?, remarks = ?
    WHERE id = ?
  `);
  stmt.run(
    caseData.client_name,
    caseData.case_type || '',
    caseData.phase || 'Submitted',
    caseData.remarks || '',
    id
  );
}

export function deleteCase(id) {
  const database = getDatabase();
  const stmt = database.prepare('DELETE FROM cases WHERE id = ?');
  stmt.run(id);
}

export function searchCases(query) {
  const database = getDatabase();
  const stmt = database.prepare(`
    SELECT * FROM cases 
    WHERE tm_number LIKE ? OR client_name LIKE ?
    ORDER BY created_at DESC
  `);
  const searchPattern = `%${query}%`;
  return stmt.all(searchPattern, searchPattern);
}

export function getCasesByPhase(phase) {
  const database = getDatabase();
  const stmt = database.prepare(`
    SELECT * FROM cases 
    WHERE phase = ?
    ORDER BY created_at DESC
  `);
  return stmt.all(phase);
}

// ============================================================
// PAYMENT OPERATIONS
// ============================================================

export function createPayment(paymentData) {
  const database = getDatabase();
  const stmt = database.prepare(`
    INSERT INTO payments (
      case_id, date, folder_no, stage, class, details,
      due_amount, received_amount, balance_amount, type
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    paymentData.case_id,
    paymentData.date,
    paymentData.folder_no || '',
    paymentData.stage || '',
    paymentData.class || '',
    paymentData.details || '',
    paymentData.due_amount || 0,
    paymentData.received_amount || 0,
    paymentData.balance_amount || 0,
    paymentData.type || 'normal'
  );
  return result.lastInsertRowid;
}

export function getPaymentsByCaseId(caseId) {
  const database = getDatabase();
  const stmt = database.prepare(`
    SELECT * FROM payments 
    WHERE case_id = ? 
    ORDER BY date ASC
  `);
  return stmt.all(caseId);
}

export function updatePayment(id, paymentData) {
  const database = getDatabase();
  const stmt = database.prepare(`
    UPDATE payments 
    SET date = ?, folder_no = ?, stage = ?, class = ?, details = ?,
        due_amount = ?, received_amount = ?, balance_amount = ?, type = ?
    WHERE id = ?
  `);
  stmt.run(
    paymentData.date,
    paymentData.folder_no || '',
    paymentData.stage || '',
    paymentData.class || '',
    paymentData.details || '',
    paymentData.due_amount || 0,
    paymentData.received_amount || 0,
    paymentData.balance_amount || 0,
    paymentData.type || 'normal',
    id
  );
}

export function deletePayment(id) {
  const database = getDatabase();
  const stmt = database.prepare('DELETE FROM payments WHERE id = ?');
  stmt.run(id);
}

export function getCaseBalance(caseId) {
  const database = getDatabase();
  const payments = getPaymentsByCaseId(caseId);
  let balance = 0;
  payments.forEach(p => {
    balance += (p.due_amount || 0) - (p.received_amount || 0);
  });
  return balance;
}

// ============================================================
// SETTINGS OPERATIONS
// ============================================================

export function getSetting(key) {
  const database = getDatabase();
  const stmt = database.prepare('SELECT value FROM settings WHERE key = ?');
  const result = stmt.get(key);
  return result ? result.value : null;
}

export function setSetting(key, value) {
  const database = getDatabase();
  const stmt = database.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `);
  stmt.run(key, value);
}

export function getAllSettings() {
  const database = getDatabase();
  const stmt = database.prepare('SELECT * FROM settings');
  const rows = stmt.all();
  const settings = {};
  rows.forEach(row => {
    settings[row.key] = row.value;
  });
  return settings;
}

// ============================================================
// STATISTICS
// ============================================================

export function getDashboardStats() {
  const database = getDatabase();
  
  const totalCases = database.prepare('SELECT COUNT(*) as count FROM cases').get().count;
  
  const phaseStats = database.prepare(`
    SELECT phase, COUNT(*) as count 
    FROM cases 
    GROUP BY phase
  `).all();
  
  const payments = database.prepare('SELECT * FROM payments').all();
  let totalDue = 0;
  let totalReceived = 0;
  payments.forEach(p => {
    totalDue += p.due_amount || 0;
    totalReceived += p.received_amount || 0;
  });
  
  return {
    totalCases,
    phaseStats,
    totalDue,
    totalReceived,
    totalBalance: totalDue - totalReceived
  };
}
