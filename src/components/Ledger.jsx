import React, { useState, useEffect } from 'react';
import { getPaymentsByCaseId, createPayment, deletePayment, getCaseById } from '../db/database';
import Button from './shared/Button';
import Modal from './shared/Modal';
import Input from './shared/Input';

export default function Ledger({ caseId, caseData, onBack, onBalanceUpdate }) {
  const [payments, setPayments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPayment, setNewPayment] = useState({
    date: new Date().toISOString().split('T')[0],
    folder_no: '',
    stage: '',
    class: '',
    details: '',
    due_amount: 0,
    received_amount: 0,
    type: 'normal'
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    loadPayments();
  }, [caseId]);

  const loadPayments = () => {
    try {
      const casePayments = getPaymentsByCaseId(caseId);
      setPayments(casePayments);
    } catch (error) {
      console.error('Error loading payments:', error);
    }
  };

  const handleAddPayment = () => {
    if (!newPayment.date) {
      alert('Date is required');
      return;
    }
    createPayment({
      case_id: caseId,
      ...newPayment,
      balance_amount: newPayment.due_amount - newPayment.received_amount
    });
    setShowAddModal(false);
    setNewPayment({
      date: new Date().toISOString().split('T')[0],
      folder_no: '',
      stage: '',
      class: '',
      details: '',
      due_amount: 0,
      received_amount: 0,
      type: 'normal'
    });
    loadPayments();
    onBalanceUpdate();
  };

  const handleDeletePayment = (id) => {
    deletePayment(id);
    setDeleteConfirmId(null);
    loadPayments();
    onBalanceUpdate();
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'PKR 0';
    return 'PKR ' + parseFloat(amount).toLocaleString('en-PK', { maximumFractionDigits: 0 });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
  };

  // Calculate running balance
  let runningBalance = 0;
  const paymentsWithBalance = payments.map(p => {
    runningBalance += (p.due_amount || 0) - (p.received_amount || 0);
    return { ...p, runningBalance };
  });

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
          <span style={{ background: '#FFE234', padding: '0 6px' }}>Payment Ledger</span>
        </div>
        <Button onClick={() => setShowAddModal(true)}>+ Add Payment</Button>
      </div>

      {/* Case Info Header */}
      <div style={{
        background: '#0a0a0a',
        color: '#FFE234',
        padding: '16px 24px',
        border: '3px solid #0a0a0a',
        boxShadow: '6px 6px 0 #0a0a0a',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '2px',
            opacity: 0.7,
            marginBottom: '4px',
          }}>
            {caseData?.tm_number}
          </div>
          <div style={{
            fontSize: '20px',
            fontWeight: 900,
            textTransform: 'uppercase',
          }}>
            {caseData?.client_name}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '24px',
            fontWeight: 900,
          }}>
            {formatCurrency(runningBalance)}
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div style={{
        overflowX: 'auto',
        border: '3px solid #0a0a0a',
        boxShadow: '6px 6px 0 #0a0a0a',
        background: '#fafaf0',
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '13px',
          minWidth: '900px',
        }}>
          <thead>
            <tr style={{ background: '#0a0a0a', color: '#FFE234' }}>
              <th style={{
                padding: '12px 10px',
                textAlign: 'left',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                borderRight: '1px solid rgba(255,226,52,0.2)',
                whiteSpace: 'nowrap',
              }}>#</th>
              <th style={{
                padding: '12px 10px',
                textAlign: 'left',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                borderRight: '1px solid rgba(255,226,52,0.2)',
                whiteSpace: 'nowrap',
              }}>Date</th>
              <th style={{
                padding: '12px 10px',
                textAlign: 'left',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                borderRight: '1px solid rgba(255,226,52,0.2)',
                whiteSpace: 'nowrap',
              }}>Folder No</th>
              <th style={{
                padding: '12px 10px',
                textAlign: 'left',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                borderRight: '1px solid rgba(255,226,52,0.2)',
                whiteSpace: 'nowrap',
              }}>Stage</th>
              <th style={{
                padding: '12px 10px',
                textAlign: 'left',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                borderRight: '1px solid rgba(255,226,52,0.2)',
                whiteSpace: 'nowrap',
              }}>Class</th>
              <th style={{
                padding: '12px 10px',
                textAlign: 'left',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                borderRight: '1px solid rgba(255,226,52,0.2)',
                whiteSpace: 'nowrap',
              }}>Details</th>
              <th style={{
                padding: '12px 10px',
                textAlign: 'right',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                borderRight: '1px solid rgba(255,226,52,0.2)',
                whiteSpace: 'nowrap',
              }}>Due</th>
              <th style={{
                padding: '12px 10px',
                textAlign: 'right',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                borderRight: '1px solid rgba(255,226,52,0.2)',
                whiteSpace: 'nowrap',
              }}>Received</th>
              <th style={{
                padding: '12px 10px',
                textAlign: 'right',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                borderRight: '1px solid rgba(255,226,52,0.2)',
                whiteSpace: 'nowrap',
              }}>Balance</th>
              <th style={{
                padding: '12px 10px',
                textAlign: 'left',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 700',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paymentsWithBalance.length === 0 ? (
              <tr>
                <td colSpan={10} style={{
                  textAlign: 'center',
                  padding: '32px',
                  color: '#888',
                }}>
                  No payment entries yet. Click "+ Add Payment" to add your first entry.
                </td>
              </tr>
            ) : (
              paymentsWithBalance.map((p, index) => (
                <tr
                  key={p.id}
                  style={{
                    background: p.type === 'received' ? '#e8ffe8' : p.type === 'opening' ? '#FFE234' : 'transparent',
                    borderBottom: '2px solid #0a0a0a',
                    borderRight: '1px solid #ddd',
                  }}
                >
                  <td style={{
                    padding: '10px 10px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: '#999',
                  }}>{index + 1}</td>
                  <td style={{ padding: '10px 10px', whiteSpace: 'nowrap', fontSize: '12px' }}>{formatDate(p.date)}</td>
                  <td style={{ padding: '10px 10px', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{p.folder_no || '—'}</td>
                  <td>{p.stage || '—'}</td>
                  <td style={{ fontSize: '12px', textAlign: 'center' }}>{p.class || '—'}</td>
                  <td style={{ maxWidth: '220px', fontSize: '12px', lineHeight: 1.4 }}>
                    {p.details || '—'}
                    {p.type === 'received' && <span style={{ background: '#00C853', color: '#0a0a0a', padding: '1px 6px', fontSize: '10px', fontWeight: 700, border: '2px solid #0a0a0a', fontFamily: 'var(--font-mono)', marginLeft: '4px' }}>RECEIVED</span>}
                    {p.type === 'opening' && <span style={{ background: '#0a0a0a', color: '#FFE234', padding: '1px 6px', fontSize: '10px', fontWeight: 700, border: '2px solid #0a0a0a', fontFamily: 'var(--font-mono)', marginLeft: '4px' }}>OPENING</span>}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, textAlign: 'right', color: '#FF3B30' }}>{p.due_amount > 0 ? formatCurrency(p.due_amount) : '—'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, textAlign: 'right', color: '#00C853' }}>{p.received_amount > 0 ? formatCurrency(p.received_amount) : '—'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700, textAlign: 'right', color: '#2563FF' }}>{formatCurrency(p.runningBalance)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => setDeleteConfirmId(p.id)}
                      style={{
                        background: 'none',
                        border: '2px solid #0a0a0a',
                        padding: '3px 8px',
                        fontSize: '10px',
                        fontWeight: 700',
                        cursor: pointer,
                        fontFamily: 'var(--font-mono)',
                        borderColor: '#FF3B30',
                        color: '#FF3B30',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#FF3B30';
                        e.target.style.color = '#fafaf0';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'none';
                        e.target.style.color = '#FF3B30';
                      }}
                    >
                      Del
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Payment Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Payment Entry">
        <Input
          label="Date *"
          type="date"
          value={newPayment.date}
          onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
          required
        />
        <Input
          label="Folder No"
          value={newPayment.folder_no}
          onChange={(e) => setNewPayment({ ...newPayment, folder_no: e.target.value })}
          placeholder="A02-001"
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
            Stage
          </label>
          <select
            value={newPayment.stage}
            onChange={(e) => setNewPayment({ ...newPayment, stage: e.target.value })}
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
            <option value="">Select Stage</option>
            <option value="S1">S1 — Stage 1</option>
            <option value="S2">S2 — Stage 2</option>
            <option value="S3">S3 — Stage 3</option>
            <option value="S4">S4 — Stage 4</option>
          </select>
        </div>
        <Input
          label="Class"
          value={newPayment.class}
          onChange={(e) => setNewPayment({ ...newPayment, class: e.target.value })}
          placeholder="1-45"
        />
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
            Entry Type
          </label>
          <select
            value={newPayment.type}
            onChange={(e) => {
              const type = e.target.value;
              setNewPayment({
                ...newPayment,
                type,
                details: type === 'received' ? 'PAYMENT RECEIVED' : type === 'opening' ? 'Opening Balance' : newPayment.details,
                due_amount: type === 'received' ? 0 : newPayment.due_amount
              });
            }}
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
            <option value="normal">Normal Entry</option>
            <option value="received">Payment Received</option>
            <option value="opening">Opening Balance</option>
          </select>
        </div>
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
            Details
          </label>
          <textarea
            value={newPayment.details}
            onChange={(e) => setNewPayment({ ...newPayment, details: e.target.value })}
            placeholder="Description..."
            rows={2}
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Input
            label="Due Amount (PKR)"
            type="number"
            value={newPayment.due_amount}
            onChange={(e) => setNewPayment({ ...newPayment, due_amount: parseFloat(e.target.value) || 0 })}
            placeholder="0"
          />
          <Input
            label="Received Amount (PKR)"
            type="number"
            value={newPayment.received_amount}
            onChange={(e) => setNewPayment({ ...newPayment, received_amount: parseFloat(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>
        <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button onClick={handleAddPayment}>Save Entry</Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Confirm Delete">
        <p style={{ marginBottom: '20px' }}>
          Are you sure you want to delete this payment entry? This cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => handleDeletePayment(deleteConfirmId)}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
