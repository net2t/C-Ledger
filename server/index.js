import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';

import { initDb, db, q } from './lib/db.js';
import { startBackupLoop } from './lib/backup.js';

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.get('/api/dashboard', (_req, res) => {
  const totalCases = q.getTotalCases.get().n;
  const byPhase = q.getCasesByPhase.all();
  const overdue = q.getOverdueCases.all();
  res.json({ totalCases, byPhase, overdueCount: overdue.length, overdue });
});

app.get('/api/cases', (req, res) => {
  const search = (req.query.search || '').toString().trim();
  const phase = (req.query.phase || '').toString().trim();
  const assignedTo = (req.query.assignedTo || '').toString().trim();

  const rows = q.searchCases.all({
    search: search ? `%${search}%` : null,
    phase: phase ? Number(phase) : null,
    assignedTo: assignedTo ? assignedTo : null,
  });

  res.json(rows);
});

app.get('/api/cases/:id', (req, res) => {
  const row = q.getCaseById.get({ id: req.params.id });
  if (!row) return res.status(404).json({ error: 'Case not found' });
  const payments = q.getPaymentsByCaseId.all({ caseId: row.id });
  const balance = q.getCaseBalance.get({ caseId: row.id })?.balance ?? 0;
  res.json({ ...row, balance, payments });
});

app.get('/api/cases/by-tm/:tmNumber', (req, res) => {
  const tmNumber = req.params.tmNumber.trim().toUpperCase();
  const row = q.getCaseByTm.get({ tmNumber });
  if (!row) return res.status(404).json({ error: 'Case not found' });
  const payments = q.getPaymentsByCaseId.all({ caseId: row.id });
  const balance = q.getCaseBalance.get({ caseId: row.id })?.balance ?? 0;
  res.json({ ...row, balance, payments });
});

app.post('/api/cases', (req, res) => {
  const {
    tmNumber,
    clientName,
    caseType,
    assignedTo,
    deadlineDate,
    phase = 1,
    remarks,
    submittedDate,
    acknowledgedDate,
    publishedDate,
    completedDate,
  } = req.body || {};

  if (!tmNumber || !clientName) {
    return res.status(400).json({ error: 'tmNumber and clientName are required' });
  }

  const tm = String(tmNumber).trim().toUpperCase();
  const exists = q.getCaseByTm.get({ tmNumber: tm });
  if (exists) return res.status(409).json({ error: 'TM number already exists' });

  const id = cryptoRandomId();
  const now = new Date().toISOString();

  q.insertCase.run({
    id,
    tmNumber: tm,
    clientName: String(clientName).trim(),
    caseType: String(caseType || '').trim(),
    phase: Number(phase) || 1,
    assignedTo: String(assignedTo || '').trim(),
    deadlineDate: deadlineDate ? String(deadlineDate) : null,
    remarks: String(remarks || '').trim(),
    submittedDate: submittedDate ? String(submittedDate) : null,
    acknowledgedDate: acknowledgedDate ? String(acknowledgedDate) : null,
    publishedDate: publishedDate ? String(publishedDate) : null,
    completedDate: completedDate ? String(completedDate) : null,
    createdAt: now,
    updatedAt: now,
  });

  res.status(201).json(q.getCaseById.get({ id }));
});

app.patch('/api/cases/:id', (req, res) => {
  const id = req.params.id;
  const existing = q.getCaseById.get({ id });
  if (!existing) return res.status(404).json({ error: 'Case not found' });

  const patch = req.body || {};
  const updated = {
    ...existing,
    tmNumber: patch.tmNumber ? String(patch.tmNumber).trim().toUpperCase() : existing.tmNumber,
    clientName: patch.clientName !== undefined ? String(patch.clientName).trim() : existing.clientName,
    caseType: patch.caseType !== undefined ? String(patch.caseType).trim() : existing.caseType,
    phase: patch.phase !== undefined ? Number(patch.phase) : existing.phase,
    assignedTo: patch.assignedTo !== undefined ? String(patch.assignedTo).trim() : existing.assignedTo,
    deadlineDate: patch.deadlineDate !== undefined ? (patch.deadlineDate ? String(patch.deadlineDate) : null) : existing.deadlineDate,
    remarks: patch.remarks !== undefined ? String(patch.remarks).trim() : existing.remarks,
    submittedDate: patch.submittedDate !== undefined ? (patch.submittedDate ? String(patch.submittedDate) : null) : existing.submittedDate,
    acknowledgedDate: patch.acknowledgedDate !== undefined ? (patch.acknowledgedDate ? String(patch.acknowledgedDate) : null) : existing.acknowledgedDate,
    publishedDate: patch.publishedDate !== undefined ? (patch.publishedDate ? String(patch.publishedDate) : null) : existing.publishedDate,
    completedDate: patch.completedDate !== undefined ? (patch.completedDate ? String(patch.completedDate) : null) : existing.completedDate,
    updatedAt: new Date().toISOString(),
  };

  const tmConflict = updated.tmNumber !== existing.tmNumber && q.getCaseByTm.get({ tmNumber: updated.tmNumber });
  if (tmConflict) return res.status(409).json({ error: 'TM number already exists' });

  q.updateCase.run(updated);

  res.json(q.getCaseById.get({ id }));
});

app.get('/api/cases/:id/payments', (req, res) => {
  const row = q.getCaseById.get({ id: req.params.id });
  if (!row) return res.status(404).json({ error: 'Case not found' });
  res.json(q.getPaymentsByCaseId.all({ caseId: row.id }));
});

app.post('/api/payments', (req, res) => {
  const {
    tmNumber,
    caseId,
    direction,
    amount,
    date,
    notes,
    method,
    refNo,
  } = req.body || {};

  const resolvedCase = caseId
    ? q.getCaseById.get({ id: String(caseId) })
    : (tmNumber ? q.getCaseByTm.get({ tmNumber: String(tmNumber).trim().toUpperCase() }) : null);

  if (!resolvedCase) return res.status(404).json({ error: 'Case not found' });

  const dir = String(direction || 'in').toLowerCase();
  if (!['in', 'out'].includes(dir)) return res.status(400).json({ error: 'direction must be in or out' });

  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ error: 'amount must be > 0' });

  const paymentId = cryptoRandomId();
  const now = new Date().toISOString();

  q.insertPayment.run({
    id: paymentId,
    caseId: resolvedCase.id,
    tmNumber: resolvedCase.tmNumber,
    direction: dir,
    amount: amt,
    date: date ? String(date) : now.slice(0, 10),
    method: String(method || '').trim(),
    refNo: String(refNo || '').trim(),
    notes: String(notes || '').trim(),
    createdAt: now,
  });

  const created = q.getPaymentById.get({ id: paymentId });
  res.status(201).json(created);
});

const PORT = Number(process.env.PORT || 5174);

initDb();

const dataDir = path.resolve(process.env.DATA_DIR || 'data');
const backupDir = path.resolve(process.env.BACKUP_DIR || 'backups');
fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(backupDir, { recursive: true });

startBackupLoop({ backupDir });

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[api] listening on http://localhost:${PORT}`);
});

function cryptoRandomId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`.toUpperCase();
}
