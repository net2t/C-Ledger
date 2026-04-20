import React, { useState, useEffect } from 'react';
import { getCaseById, updateCase, getPaymentsByCaseId, getCaseBalance } from '../db/database';
import Button from './shared/Button';
import Modal from './shared/Modal';
import Input from './shared/Input';
import Ledger from './Ledger';

export default function CaseDetail({ caseId, onBack }) {
  const [caseData, setCaseData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [showLedger, setShowLedger] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    loadCase();
  }, [caseId]);

  const loadCase = () => {
    try {
      const c = getCaseById(caseId);
      if (c) {
        setCaseData(c);
        setEditForm({
          tm_number: c.tm_number,
          client_name: c.client_name,
          case_type: c.case_type,
          phase: c.phase,
          remarks: c.remarks
        });
        setBalance(getCaseBalance(caseId));
      }
    } catch (error) {
      console.error('Error loading case:', error);
    }
  };

  const handleUpdateCase = () => {
    if (!editForm.tm_number || !editForm.client_name) {
      alert('TM Number and Client Name are required');
      return;
    }
    updateCase(caseId, editForm);
    setShowEditModal(false);
    loadCase();
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'PKR 0';
    return 'PKR ' + parseFloat(amount).toLocaleString('en-PK', { maximumFractionDigits: 0 });
  };

  if (!caseData) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
        <div style={{ fontSize: '20px', fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px' }}>
          Case Not Found
        </div>
        <Button onClick={onBack}>Back to Cases</Button>
      </div>
    );
  }

  if (showLedger) {
    return <Ledger caseId={caseId} caseData={caseData} onBack={() => setShowLedger(false)} onBalanceUpdate={() => { setBalance(getCaseBalance(caseId)); loadCase(); }} />;
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <Button onClick={onBack}>← Back</Button>
        <div style={{
          fontSize: '28px',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '-0.5px',
          flex: 1,
        }}>
          <span style={{ background: '#FFE234', padding: '0 6px' }}>Case Details</span>
        </div>
        <Button onClick={() => setShowEditModal(true)}>Edit</Button>
      </div>

      {/* Case Header */}
      <div style={{
        background: '#0a0a0a',
        color: '#FFE234',
        padding: '20px 24px',
        border: '3px solid #0a0a0a',
        boxShadow: '6px 6px 0 #0a0a0a',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '2px',
            opacity: 0.7,
            marginBottom: '8px',
          }}>
            {caseData.tm_number}
          </div>
          <div style={{
            fontSize: '24px',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            {caseData.client_name}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            opacity: 0.6,
            marginBottom: '4px',
          }}>
            Outstanding Balance
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '28px',
            fontWeight: 900,
          }}>
            {formatCurrency(balance)}
          </div>
        </div>
      </div>

      {/* Case Info Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '20px',
      }}>
        <div style={{
          background: '#fafaf0',
          border: '3px solid #0a0a0a',
          boxShadow: '4px 4px 0 #0a0a0a',
          padding: '16px 20px',
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#555',
            marginBottom: '6px',
          }}>
            Case Type
          </div>
          <div style={{ fontSize: '18px', fontWeight: 700 }}>
            {caseData.case_type || 'N/A'}
          </div>
        </div>

        <div style={{
          background: '#FFE234',
          border: '3px solid #0a0a0a',
          boxShadow: '4px 4px 0 #0a0a0a',
          padding: '16px 20px',
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#555',
            marginBottom: '6px',
          }}>
            Current Phase
          </div>
          <div style={{ fontSize: '18px, fontWeight: 700' }}>
            {caseData.phase}
          </div>
        </div>

        <div style={{
          background: '#fafaf0',
          border: '3px solid #0a0a0a',
          boxShadow: '4px 4px 0 #0a0a0a',
          padding: '16px 20px',
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#555',
            marginBottom: '6px',
          }}>
            Created
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600 }}>
            {new Date(caseData.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Remarks */}
      {caseData.remarks && (
        <div style={{
          background: '#fafaf0',
          border: '3px solid #0a0a0a',
          boxShadow: '4px 4px 0 #0a0a0a',
          padding: '16px 20px',
          marginBottom: '20px',
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 700',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#555',
            marginBottom: '8px',
          }}>
            Remarks
          </div>
          <div style={{ fontSize: '14px', lineHeight: 1.5 }}>
            {caseData.remarks}
          </div>
        </div>
      )}

      {/* Ledger Button */}
      <Button onClick={() => setShowLedger(true)} style={{ width: '100%' }}>
        View Payment Ledger
      </Button>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Case">
        <Input
          label="TM Number *"
          value={editForm.tm_number}
          onChange={(e) => setEditForm({ ...editForm, tm_number: e.target.value.toUpperCase() })}
          placeholder="TM-1001"
          required
        />
        <Input
          label="Client Name *"
          value={editForm.client_name}
          onChange={(e) => setEditForm({ ...editForm, client_name: e.target.value })}
          placeholder="Client Name"
          required
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
            Case Type
          </label>
          <select
            value={editForm.case_type}
            onChange={(e) => setEditForm({ ...editForm, case_type: e.target.value })}
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
            <option value="">Select Type</option>
            <option value="X">Type X</option>
            <option value="Y">Type Y</option>
            <option value="B">Type B</option>
          </select>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 700',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: '6px',
            color: '#444'
          }}>
            Phase
          </label>
          <select
            value={editForm.phase}
            onChange={(e) => setEditForm({ ...editForm, phase: e.target.value })}
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
            <option value="Submitted">Submitted</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="Published">Published</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 700',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
            marginBottom: '6px',
            color: '#444'
          }}>
            Remarks
          </label>
          <textarea
            value={editForm.remarks}
            onChange={(e) => setEditForm({ ...editForm, remarks: e.target.value })}
            placeholder="Additional notes..."
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
          <Button onClick={handleUpdateCase}>Save Changes</Button>
        </div>
      </Modal>
    </div>
  );
}
