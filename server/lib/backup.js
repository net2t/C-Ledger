import fs from 'node:fs';
import path from 'node:path';

function pad2(n) {
  return String(n).padStart(2, '0');
}

function stamp(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}_${pad2(d.getHours())}-${pad2(d.getMinutes())}-${pad2(d.getSeconds())}`;
}

export function startBackupLoop({ backupDir }) {
  const enabled = (process.env.BACKUP_ENABLED || '1') !== '0';
  if (!enabled) return;

  const dataDir = path.resolve(process.env.DATA_DIR || 'data');
  const dbFile = process.env.SQLITE_FILE || 'c-ledger.db';
  const dbPath = path.join(dataDir, dbFile);

  const everyMinutes = Number(process.env.BACKUP_EVERY_MINUTES || 60);
  const keepDays = Number(process.env.BACKUP_KEEP_DAYS || 30);

  fs.mkdirSync(backupDir, { recursive: true });

  const runOnce = () => {
    try {
      if (!fs.existsSync(dbPath)) return;
      const name = `c-ledger_${stamp(new Date())}.db`;
      const dest = path.join(backupDir, name);
      fs.copyFileSync(dbPath, dest);
      cleanupOldBackups(backupDir, keepDays);
      // eslint-disable-next-line no-console
      console.log(`[backup] created ${dest}`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[backup] failed', err);
    }
  };

  // initial backup shortly after start
  setTimeout(runOnce, 5000);

  const ms = Math.max(1, everyMinutes) * 60 * 1000;
  setInterval(runOnce, ms);
}

function cleanupOldBackups(backupDir, keepDays) {
  if (!Number.isFinite(keepDays) || keepDays <= 0) return;
  const cutoff = Date.now() - keepDays * 24 * 60 * 60 * 1000;
  for (const f of fs.readdirSync(backupDir)) {
    if (!f.endsWith('.db')) continue;
    const p = path.join(backupDir, f);
    try {
      const st = fs.statSync(p);
      if (st.mtimeMs < cutoff) fs.unlinkSync(p);
    } catch {
      // ignore
    }
  }
}
