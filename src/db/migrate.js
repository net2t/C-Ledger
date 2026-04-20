// ============================================================
// Data Migration Script: LocalStorage → SQLite
// ============================================================

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { initDatabase, createCase, createPayment, setSetting } from './database.js';

const __dirname = new URL('.', import.meta.url).pathname;

// Read JSON backup file
function readBackupFile(filePath) {
  try {
    const data = readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading backup file:', error);
    return null;
  }
}

// Transform client-centric data to TM-centric
function transformData(oldData) {
  const { clients, entries, settings } = oldData;
  
  // Create a map to track TM numbers to case IDs
  const tmToCaseId = {};
  
  // Create cases from unique TM numbers found in entries
  const uniqueTMNumbers = new Set();
  entries.forEach(entry => {
    if (entry.tmno) {
      uniqueTMNumbers.add(entry.tmno);
    }
  });
  
  // Also include clients without TM numbers (use client code as TM)
  clients.forEach(client => {
    if (!uniqueTMNumbers.has(client.code)) {
      uniqueTMNumbers.add(client.code);
    }
  });
  
  const cases = [];
  const payments = [];
  
  // Create cases
  uniqueTMNumbers.forEach(tmNumber => {
    // Find client associated with this TM number
    const client = clients.find(c => c.code === tmNumber) || 
                   clients.find(c => entries.some(e => e.tmno === tmNumber && e.clientId === c.id));
    
    const caseData = {
      tm_number: tmNumber,
      client_name: client ? client.name : 'Unknown Client',
      case_type: '',
      phase: 'Submitted',
      remarks: client ? `City: ${client.city || 'N/A'}` : ''
    };
    
    cases.push(caseData);
  });
  
  // Create payments linked to cases
  entries.forEach(entry => {
    const tmNumber = entry.tmno || (clients.find(c => c.id === entry.clientId)?.code);
    if (!tmNumber) return;
    
    const caseData = cases.find(c => c.tm_number === tmNumber);
    if (!caseData) return;
    
    const paymentData = {
      case_id: null, // Will be set after inserting cases
      date: entry.date || new Date().toISOString().split('T')[0],
      folder_no: entry.folder || '',
      stage: entry.stage || '',
      class: entry.cls || '',
      details: entry.details || '',
      due_amount: entry.due || 0,
      received_amount: entry.received || 0,
      balance_amount: entry.balance || 0,
      type: entry.type || 'normal'
    };
    
    payments.push({ ...paymentData, tm_number: tmNumber });
  });
  
  return { cases, payments, settings };
}

// Perform migration
export async function migrateFromBackup(backupFilePath) {
  console.log('Starting migration...');
  
  // Initialize database
  initDatabase();
  
  // Read backup file
  const oldData = readBackupFile(backupFilePath);
  if (!oldData) {
    return { success: false, error: 'Failed to read backup file' };
  }
  
  console.log(`Loaded backup with ${oldData.clients?.length || 0} clients and ${oldData.entries?.length || 0} entries`);
  
  // Transform data
  const { cases, payments, settings } = transformData(oldData);
  console.log(`Transformed to ${cases.length} cases and ${payments.length} payments`);
  
  // Insert cases
  const tmToCaseId = {};
  let caseCount = 0;
  for (const caseData of cases) {
    try {
      const caseId = createCase(caseData);
      tmToCaseId[caseData.tm_number] = caseId;
      caseCount++;
    } catch (error) {
      if (error.message.includes('UNIQUE constraint')) {
        console.log(`Case ${caseData.tm_number} already exists, skipping`);
      } else {
        console.error(`Error creating case ${caseData.tm_number}:`, error);
      }
    }
  }
  console.log(`Inserted ${caseCount} cases`);
  
  // Insert payments
  let paymentCount = 0;
  for (const payment of payments) {
    const caseId = tmToCaseId[payment.tm_number];
    if (!caseId) {
      console.log(`No case found for TM ${payment.tm_number}, skipping payment`);
      continue;
    }
    
    try {
      createPayment({
        ...payment,
        case_id: caseId
      });
      paymentCount++;
    } catch (error) {
      console.error(`Error creating payment:`, error);
    }
  }
  console.log(`Inserted ${paymentCount} payments`);
  
  // Insert settings
  if (settings) {
    Object.entries(settings).forEach(([key, value]) => {
      if (typeof value === 'object') {
        setSetting(key, JSON.stringify(value));
      } else {
        setSetting(key, String(value));
      }
    });
    console.log('Migrated settings');
  }
  
  console.log('Migration completed successfully!');
  return {
    success: true,
    casesMigrated: caseCount,
    paymentsMigrated: paymentCount,
    settingsMigrated: Object.keys(settings || {}).length
  };
}

// Command line interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const backupPath = process.argv[2];
  if (!backupPath) {
    console.error('Usage: node migrate.js <backup-file-path>');
    console.error('Example: node migrate.js ../BrandEx-Ledger-Backup-2026-04-20.json');
    process.exit(1);
  }
  
  migrateFromBackup(backupPath)
    .then(result => {
      if (result.success) {
        console.log('\n=== Migration Summary ===');
        console.log(`Cases migrated: ${result.casesMigrated}`);
        console.log(`Payments migrated: ${result.paymentsMigrated}`);
        console.log(`Settings migrated: ${result.settingsMigrated}`);
        process.exit(0);
      } else {
        console.error('Migration failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Migration error:', error);
      process.exit(1);
    });
}
