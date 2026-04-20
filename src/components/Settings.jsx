import React, { useState, useEffect } from 'react';
import { getAllSettings, setSetting } from '../db/database';
import Button from './shared/Button';
import Modal from './shared/Modal';
import Input from './shared/Input';

export default function Settings({ onStatsUpdate, onFirmNameChange }) {
  const [settings, setSettings] = useState({
    firmName: 'BrandEx Law Associates',
    address: '',
    phone: '',
    email: '',
    bankName: '',
    bankAccount: '',
    bankIBAN: '',
    bankTitle: '',
    backupFrequency: 'hourly',
    backupPath: './public/backup',
    googleDriveEnabled: false,
  });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const savedSettings = getAllSettings();
      setSettings(prev => ({ ...prev, ...savedSettings }));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSaveSettings = () => {
    Object.entries(settings).forEach(([key, value]) => {
      setSetting(key, value);
    });
    onFirmNameChange(settings.firmName);
    alert('Settings saved successfully!');
  };

  const handleExportData = () => {
    // TODO: Implement export functionality
    alert('Export functionality will be implemented with backup system');
  };

  const handleImportData = () => {
    // TODO: Implement import functionality
    alert('Import functionality will be implemented with backup system');
  };

  const handleClearData = () => {
    // TODO: Implement clear data functionality
    alert('Clear data functionality will be implemented with database reset');
    setShowClearConfirm(false);
    onStatsUpdate();
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
      }}>
        <div style={{
          fontSize: '28px',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '-0.5px',
        }}>
          <span style={{ background: '#FFE234', padding: '0 6px' }}>Settings</span>
        </div>
        <Button onClick={handleSaveSettings}>✓ Save Settings</Button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
      }}>
        {/* Firm Identity Card */}
        <div style={{
          background: '#fafaf0',
          border: '3px solid #0a0a0a',
          boxShadow: '4px 4px 0 #0a0a0a',
        }}>
          <div style={{
            background: '#FFE234',
            borderBottom: '3px solid #0a0a0a',
            padding: '12px 16px',
            fontSize: '13px',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            ⊞ Firm Identity
          </div>
          <div style={{ padding: '16px' }}>
            <Input
              label="Firm / Office Name"
              value={settings.firmName}
              onChange={(e) => setSettings({ ...settings, firmName: e.target.value })}
              placeholder="BrandEx Law Associates"
            />
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                marginBottom: '6px',
                color: '#444'
              }}>
                Office Address
              </label>
              <textarea
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                placeholder="Office No. X2, 2nd Floor, Abdullah Plaza..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '3px solid #0a0a0a',
                  fontFamily: 'var(--font-main)',
                  fontSize: '13px',
                  fontWeight: '500',
                  background: '#fafaf0',
                  boxShadow: '3px 3px 0 #0a0a0a',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>
            <Input
              label="Phone / Tele"
              value={settings.phone}
              onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              placeholder="0314-..."
            />
            <Input
              label="Email"
              value={settings.email}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              placeholder="info@brandex.pk"
            />
          </div>
        </div>

        {/* Bank Account Card */}
        <div style={{
          background: '#fafaf0',
          border: '3px solid #0a0a0a',
          boxShadow: '4px 4px 0 #0a0a0a',
        }}>
          <div style={{
            background: '#FFE234',
            borderBottom: '3px solid #0a0a0a',
            padding: '12px 16px',
            fontSize: '13px',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            🏦 Bank Account
          </div>
          <div style={{ padding: '16px' }}>
            <Input
              label="Bank Name"
              value={settings.bankName}
              onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
              placeholder="Meezan Bank Limited Islamabad"
            />
            <Input
              label="Account Number"
              value={settings.bankAccount}
              onChange={(e) => setSettings({ ...settings, bankAccount: e.target.value })}
              placeholder="0104862477"
            />
            <Input
              label="IBAN"
              value={settings.bankIBAN}
              onChange={(e) => setSettings({ ...settings, bankIBAN: e.target.value })}
              placeholder="PK12MEZN0098140104862..."
            />
            <Input
              label="Account Title"
              value={settings.bankTitle}
              onChange={(e) => setSettings({ ...settings, bankTitle: e.target.value })}
              placeholder="BrandEx Law Associates"
            />
          </div>
        </div>

        {/* Backup Settings Card */}
        <div style={{
          background: '#fafaf0',
          border: '3px solid #0a0a0a',
          boxShadow: '4px 4px 0 #0a0a0a',
        }}>
          <div style={{
            background: '#FFE234',
            borderBottom: '3px solid #0a0a0a',
            padding: '12px 16px',
            fontSize: '13px',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            💾 Backup Settings
          </div>
          <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.8px',
                marginBottom: '6px',
                color: '#444'
              }}>
                Backup Frequency
              </label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => setSettings({ ...settings, backupFrequency: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  border: '3px solid #0a0a0a',
                  fontFamily: 'var(--font-main)',
                  fontSize: '13px',
                  fontWeight: '500',
                  background: '#fafaf0',
                  boxShadow: '3px 3px 0 #0a0a0a',
                  outline: 'none',
                }}
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
            <Input
              label="Local Backup Path"
              value={settings.backupPath}
              onChange={(e) => setSettings({ ...settings, backupPath: e.target.value })}
              placeholder="./public/backup"
            />
            <div style={{ marginBottom: '16px', marginTop: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}>
                <input
                  type="checkbox"
                  checked={settings.googleDriveEnabled}
                  onChange={(e) => setSettings({ ...settings, googleDriveEnabled: e.target.checked })}
                  style={{ width: '18px', height: '18px' }}
                />
                Enable Google Drive Sync
              </label>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px', marginLeft: '26px' }}>
                Requires Google Cloud project setup (see guide)
              </div>
            </div>
          </div>
        </div>

        {/* Data Management Card */}
        <div style={{
          background: '#fafaf0',
          border: '3px solid #0a0a0a',
          boxShadow: '4px 4px 0 #0a0a0a',
        }}>
          <div style={{
            background: '#FFE234',
            borderBottom: '3px solid #0a0a0a',
            padding: '12px 16px',
            fontSize: '13px',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            💾 Data Management
          </div>
          <div style={{ padding: '16px' }}>
            <p style={{ fontSize: '13px', color: '#555', marginBottom: '16px' }}>
              All data is stored in SQLite database. Export regularly as backup.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Button variant="yellow" onClick={handleExportData}>⬇ Export Backup (JSON)</Button>
              <Button onClick={handleImportData}>⬆ Import Backup (JSON)</Button>
              <Button variant="danger" onClick={() => setShowClearConfirm(true)}>✕ Clear ALL Data</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Data Confirmation Modal */}
      <Modal isOpen={showClearConfirm} onClose={() => setShowClearConfirm(false)} title="⚠️ Warning">
        <p style={{ marginBottom: '12px', fontWeight: 700, color: '#FF3B30' }}>
          This will delete ALL cases, payments, and settings permanently!
        </p>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          This action cannot be undone. Please make sure you have exported a backup before proceeding.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button variant="secondary" onClick={() => setShowClearConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleClearData}>Clear All Data</Button>
        </div>
      </Modal>
    </div>
  );
}
