import React, { useState, useEffect } from 'react';
import { getAllCases } from '../db/database';
import Button from './shared/Button';

export default function Dashboard({ onCaseSelect, stats }) {
  const [cases, setCases] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredCases = cases.filter(c =>
    c.tm_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.client_name.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 6);

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'PKR 0';
    return 'PKR ' + parseFloat(amount).toLocaleString('en-PK', { maximumFractionDigits: 0 });
  };

  const statCardStyle = {
    background: '#fafaf0',
    border: '3px solid #0a0a0a',
    boxShadow: '4px 4px 0 #0a0a0a',
    padding: '16px 20px'
  };

  const labelStyle = {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: '#555',
    marginBottom: '6px'
  };

  const valueStyle = {
    fontFamily: 'var(--font-mono)',
    fontSize: '22px',
    fontWeight: 700
  };

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
          <span style={{ background: '#FFE234', padding: '0 6px' }}>Dashboard</span>
        </div>
        <Button onClick={() => onCaseSelect(null)}>+ New Case</Button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div style={{...statCardStyle, background: '#0a0a0a'}}>
          <div style={{...labelStyle, color: '#FFE234'}}>Total Cases</div>
          <div style={{...valueStyle, background: '#FFE234', color: '#0a0a0a', padding: '4px 8px', display: 'inline-block'}}>
            {stats?.totalCases || 0}
          </div>
        </div>

        <div style={{...statCardStyle, background: '#FFE234'}}>
          <div style={labelStyle}>Total Due</div>
          <div style={valueStyle}>
            {stats ? formatCurrency(stats.totalDue) : 'PKR 0'}
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={labelStyle}>Total Received</div>
          <div style={valueStyle}>
            {stats ? formatCurrency(stats.totalReceived) : 'PKR 0'}
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={labelStyle}>Total Balance</div>
          <div style={valueStyle}>
            {stats ? formatCurrency(stats.totalBalance) : 'PKR 0'}
          </div>
        </div>
      </div>

      {stats?.phaseStats && stats.phaseStats.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}>
          {stats.phaseStats.map((phaseStat) => (
            <div key={phaseStat.phase} style={statCardStyle}>
              <div style={labelStyle}>{phaseStat.phase}</div>
              <div style={valueStyle}>{phaseStat.count}</div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Cases */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 900,
          textTransform: 'uppercase',
        }}>
          Recent Cases
        </h3>
        <input
          type="text"
          placeholder="Search TM or Client..."
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
            width: '250px',
          }}
        />
      </div>

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
              No Cases Yet
            </div>
            <div style={{ color: '#666', marginBottom: '20px' }}>
              Click "+ New Case" to create your first trademark case.
            </div>
          </div>
        ) : (
          filteredCases.map((c) => (
            <div
              key={c.id}
              onClick={() => onCaseSelect(c.id)}
              style={{
                background: '#fafaf0',
                border: '3px solid #0a0a0a',
                boxShadow: '4px 4px 0 #0a0a0a',
                cursor: 'pointer',
                transition: 'all 0.1s',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-3px, -3px)';
                e.currentTarget.style.boxShadow = '6px 6px 0 #0a0a0a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.boxShadow = '4px 4px 0 #0a0a0a';
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
                  fontWeight: 700,
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
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#666',
                }}>
                  Type: {c.case_type || 'N/A'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
