// ============================================================
// Local Backup System
// ============================================================

import { copyFileSync, existsSync, mkdirSync, readdirSync, unlinkSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PROJECT_ROOT = join(process.cwd(), '..');
const DB_PATH = join(PROJECT_ROOT, 'ledger.db');
const DEFAULT_BACKUP_DIR = join(PROJECT_ROOT, 'public', 'backup');

// Ensure backup directory exists
export function ensureBackupDir(backupPath) {
  const dir = backupPath || DEFAULT_BACKUP_DIR;
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

// Create timestamped backup
export function createBackup(backupPath) {
  try {
    const backupDir = ensureBackupDir(backupPath);
    
    if (!existsSync(DB_PATH)) {
      throw new Error('Database file not found');
    }

    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '-')
      .replace('T', '_')
      .split('.')[0];
    
    const backupFileName = `ledger_backup_${timestamp}.db`;
    const backupFilePath = join(backupDir, backupFileName);
    
    copyFileSync(DB_PATH, backupFilePath);
    
    console.log(`Backup created: ${backupFilePath}`);
    return { success: true, path: backupFilePath, filename: backupFileName };
  } catch (error) {
    console.error('Backup error:', error);
    return { success: false, error: error.message };
  }
}

// Clean old backups (keep last N backups)
export function cleanOldBackups(backupPath, keepCount = 30) {
  try {
    const backupDir = ensureBackupDir(backupPath);
    const files = readdirSync(backupDir)
      .filter(f => f.startsWith('ledger_backup_') && f.endsWith('.db'))
      .map(f => ({
        name: f,
        path: join(backupDir, f),
        time: statSync(join(backupDir, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // Sort by time, newest first
    
    // Delete old backups beyond keepCount
    const toDelete = files.slice(keepCount);
    toDelete.forEach(f => {
      unlinkSync(f.path);
      console.log(`Deleted old backup: ${f.name}`);
    });
    
    return { success: true, deleted: toDelete.length };
  } catch (error) {
    console.error('Cleanup error:', error);
    return { success: false, error: error.message };
  }
}

// Get backup info
export function getBackupInfo(backupPath) {
  try {
    const backupDir = ensureBackupDir(backupPath);
    const files = readdirSync(backupDir)
      .filter(f => f.startsWith('ledger_backup_') && f.endsWith('.db'))
      .map(f => ({
        name: f,
        path: join(backupDir, f),
        size: statSync(join(backupDir, f)).size,
        time: statSync(join(backupDir, f)).mtime
      }))
      .sort((a, b) => b.time - a.time);
    
    return { success: true, files, count: files.length };
  } catch (error) {
    console.error('Backup info error:', error);
    return { success: false, error: error.message };
  }
}
