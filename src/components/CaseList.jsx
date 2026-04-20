import React, { useState, useEffect } from 'react';
import { getAllCases, deleteCase } from '../db/database';
import Button from './shared/Button';
import Modal from './shared/Modal';
import Input from './shared/Input';

export default function CaseList({ onCaseSelect }) {
  const [cases, setCases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCase, setNewCase] = useState({
    tm_number: '',
    client_name: '',
    case_type: '',
    phase: 'Submitted',
    remarks: ''
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = () => {
    try {
      const allCases = getAllCases();
      setCases(allCases);
    } catch (error) {
      console.error('Error loading cases:', error);
    }
  };

  const handleAddCase = () => {
    if (!newCase.tm_number || !newCase.client_name) {
      alert('TM Number and Client Name are required');
      return;
    }
    // TODO: Implement createCase call
    setShowAddModal(false);
    setNewCase({ tm_number: '', client_name: '', case_type: '', phase: 'Submitted', remarks: '' });
    loadCases();
  };

  const handleDeleteCase = (id) => {
    deleteCase(id);
    setDeleteConfirmId(null);
    loadCases();
  };

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.tm_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         c.client_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPhase = !phaseFilter || c.phase === phaseFilter;
    return matchesSearch && matchesPhase;
  });

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{
          fontSize: '28px',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '-0.5px',
        }}>
          <span style={{ background: '#FFE234', padding: '0 6px' }}>All Cases</span>
        </div>
        <Button onClick={() => setShowAddModal(true)}>+ New Case</Button>
      </div>

      {/* Filter Bar */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <input
          type="text"
          placeholder="Search TM number or client..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '8px 14px',
            border: '3px solid #0a0a0a',
            fontFamily: 'var(--font-main)',
            fontSize: '13px',
            fontWeight: 600,
            background: '#fafaf0',
            boxShadow: '3px 3px 0 #0a0a0a',
            outline: 'none',
            flex: 1,
            minWidth: '200px',
          }}
        />
        <select
          value={phaseFilter}
          onChange={(e) => setPhaseFilter(e.target.value)}
          style={{
            padding: '8px 14px',
            border: '3px solid #0a0a0a',
            fontFamily: 'var(--font-main)',
            fontSize: '13px',
            fontWeight: 600,
            background: '#fafaf0',
            boxShadow: '3px 3px 0 #0a0a0a',
            outline: 'none',
          }}
        >
          <option value="">All Phases</option>
          <option value="Submitted">Submitted</option>
          <option value="Acknowledged">Acknowledged</option>
          <option value="Published">Published</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Cases Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
      }}>
        {filteredCases.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 24px',
            border: '3px dashed #0a0a0a',
            background: '#fafaf0',
            gridColumn: '1 / -1',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <div style={{
              fontSize: '20px',
              fontWeight: 900,
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}>
              No Cases Found
            </div>
            <div style={{ color: '#666', marginBottom: '20px' }}>
              {cases.length === 0 ? 'Click "+ New Case" to create your first trademark case.' : 'Try adjusting your search or filter.'}
            </div>
          </div>
        ) : (
          filteredCases.map((c) => (
            <div
              key={c.id}
              style={{
                background: '#fafaf0',
                border: '3px solid #0a0a0a',
                boxShadow: '4px 4px 0 #0a0a0a',
                overflow: 'hidden',
              }}
            >
              <div style={{
                background: '#0a0a0a',
                color: '#FFE234',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 700',
                  letterSpacing: '1px',
                }}>
                  {c.tm_number}
                </span>
                <span style={{
                  background: '#FFE234',
                  color: '#0a0a0a',
                  padding: '2px 8px',
                  fontSize: '10px',
                  fontWeight: 700',
                  textTransform: 'uppercase',
                  border: '2px solid #0a0a0a',
                }}>
                  {c.phase}
                </span>
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                  letterSpacing: '0.3px',
                }}>
                  {c.client_name}
                </div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: 700',
                  textTransform: 'uppercase',
                  color: '#666',
                  marginBottom: '8px',
                }}>
                  Type: {c.case_type || 'N/A'}
                </div>
                <div style={{
                  borderTop: '2px solid #0a0a0a',
                  paddingTop: '8px',
                  display: 'flex',
                  gap: '8px',
                }}>
                  <Button size="small" onClick={() => onCaseSelect(c.id)}>View</Button>
                  <Button size="small" variant="danger" onClick={() => setDeleteConfirmId(c.id)}>Del</Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Case Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Case">
        <Input
          label="TM Number *"
          value={newCase.tm_number}
          onChange={(e) => setNewCase({ ...newCase, tm_number: e.target.value.toUpperCase() })}
          placeholder="TM-1001"
          required
        />
        <Input
          label="Client Name *"
          value={newCase.client_name}
          onChange={(e) => setNewCase({ ...newCase, client_name: e.target.value })}
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
            value={newCase.case_type}
            onChange={(e) => setNewCase({ ...newCase, case_type: e.target.value })}
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
            value={newCase.phase}
            onChange={(e) => setNewCase({ ...newCase, phase: e.target.value })}
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
            value={newCase.remarks}
            onChange={(e) => setNewCase({ ...newCase, remarks: e.target.value })}
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
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button onClick={handleAddCase}>Save Case</Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} title="Confirm Delete">
        <p style={{ marginBottom: '20px' }}>
          Are you sure you want to delete this case and all its payment history? This cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button variant="secondary" onClick={() => setDeleteConfirmId(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => handleDeleteCase(deleteConfirmId)}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
