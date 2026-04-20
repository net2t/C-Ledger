import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

const dataDir = path.resolve(process.env.DATA_DIR || 'data');
const dbPath = path.join(dataDir, process.env.SQLITE_FILE || 'c-ledger.db');
const schemaPath = path.resolve('server', 'schema.sql');

fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export const q = {
  getTotalCases: db.prepare('SELECT COUNT(*) AS n FROM cases'),
  getCasesByPhase: db.prepare('SELECT phase, COUNT(*) AS n FROM cases GROUP BY phase ORDER BY phase'),
  getOverdueCases: db.prepare(
    `SELECT id, tm_number AS tmNumber, client_name AS clientName, phase, assigned_to AS assignedTo, deadline_date AS deadlineDate
     FROM cases
     WHERE deadline_date IS NOT NULL
       AND date(deadline_date) < date('now')
       AND phase < 4
     ORDER BY deadline_date ASC`
  ),

  searchCases: db.prepare(
    `SELECT
        id,
        tm_number AS tmNumber,
        client_name AS clientName,
        case_type AS caseType,
        phase,
        assigned_to AS assignedTo,
        deadline_date AS deadlineDate,
        remarks,
        submitted_date AS submittedDate,
        acknowledged_date AS acknowledgedDate,
        published_date AS publishedDate,
        completed_date AS completedDate,
        created_at AS createdAt,
        updated_at AS updatedAt
     FROM cases
     WHERE ( @search IS NULL
             OR tm_number LIKE @search
             OR client_name LIKE @search
             OR assigned_to LIKE @search )
       AND ( @phase IS NULL OR phase = @phase )
       AND ( @assignedTo IS NULL OR assigned_to = @assignedTo )
     ORDER BY created_at DESC`
  ),

  getCaseById: db.prepare(
    `SELECT
        id,
        tm_number AS tmNumber,
        client_name AS clientName,
        case_type AS caseType,
        phase,
        assigned_to AS assignedTo,
        deadline_date AS deadlineDate,
        remarks,
        submitted_date AS submittedDate,
        acknowledged_date AS acknowledgedDate,
        published_date AS publishedDate,
        completed_date AS completedDate,
        created_at AS createdAt,
        updated_at AS updatedAt
     FROM cases
     WHERE id = @id`
  ),

  getCaseByTm: db.prepare(
    `SELECT
        id,
        tm_number AS tmNumber,
        client_name AS clientName,
        case_type AS caseType,
        phase,
        assigned_to AS assignedTo,
        deadline_date AS deadlineDate,
        remarks,
        submitted_date AS submittedDate,
        acknowledged_date AS acknowledgedDate,
        published_date AS publishedDate,
        completed_date AS completedDate,
        created_at AS createdAt,
        updated_at AS updatedAt
     FROM cases
     WHERE tm_number = @tmNumber`
  ),

  insertCase: db.prepare(
    `INSERT INTO cases (
        id, tm_number, client_name, case_type, phase, assigned_to, deadline_date, remarks,
        submitted_date, acknowledged_date, published_date, completed_date,
        created_at, updated_at
     ) VALUES (
        @id, @tmNumber, @clientName, @caseType, @phase, @assignedTo, @deadlineDate, @remarks,
        @submittedDate, @acknowledgedDate, @publishedDate, @completedDate,
        @createdAt, @updatedAt
     )`
  ),

  updateCase: db.prepare(
    `UPDATE cases SET
        tm_number = @tmNumber,
        client_name = @clientName,
        case_type = @caseType,
        phase = @phase,
        assigned_to = @assignedTo,
        deadline_date = @deadlineDate,
        remarks = @remarks,
        submitted_date = @submittedDate,
        acknowledged_date = @acknowledgedDate,
        published_date = @publishedDate,
        completed_date = @completedDate,
        updated_at = @updatedAt
     WHERE id = @id`
  ),

  insertPayment: db.prepare(
    `INSERT INTO payments (
        id, case_id, tm_number, direction, amount, date, method, ref_no, notes, created_at
     ) VALUES (
        @id, @caseId, @tmNumber, @direction, @amount, @date, @method, @refNo, @notes, @createdAt
     )`
  ),

  getPaymentById: db.prepare(
    `SELECT
        id,
        case_id AS caseId,
        tm_number AS tmNumber,
        direction,
        amount,
        date,
        method,
        ref_no AS refNo,
        notes,
        created_at AS createdAt
     FROM payments
     WHERE id = @id`
  ),

  getPaymentsByCaseId: db.prepare(
    `SELECT
        id,
        case_id AS caseId,
        tm_number AS tmNumber,
        direction,
        amount,
        date,
        method,
        ref_no AS refNo,
        notes,
        created_at AS createdAt
     FROM payments
     WHERE case_id = @caseId
     ORDER BY date DESC, created_at DESC`
  ),

  getCaseBalance: db.prepare(
    `SELECT COALESCE(SUM(CASE WHEN direction='in' THEN amount ELSE -amount END), 0) AS balance
     FROM payments
     WHERE case_id = @caseId`
  ),
};

export function initDb() {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
}
