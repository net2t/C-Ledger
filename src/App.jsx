import React, { useState, useEffect } from 'react';
import { initDatabase, getDashboardStats } from './db/database';
import Dashboard from './components/Dashboard';
import CaseList from './components/CaseList';
import CaseDetail from './components/CaseDetail';
import Ledger from './components/Ledger';
import Settings from './components/Settings';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [stats, setStats] = useState(null);
  const [firmName, setFirmName] = useState('BrandEx Law Associates');

  useEffect(() => {
    initDatabase();
    loadStats();
  }, []);

  const loadStats = () => {
    try {
      const dashboardStats = getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (page === 'dashboard') {
      loadStats();
      setSelectedCaseId(null);
    }
  };

  const handleCaseSelect = (caseId) => {
    setSelectedCaseId(caseId);
    setCurrentPage('case-detail');
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return 'PKR 0';
    const n = parseFloat(amount);
    if (isNaN(n) || n === 0) return 'PKR 0';
    return 'PKR ' + n.toLocaleString('en-PK', { maximumFractionDigits: 0 });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        background: '#FFE234',
        borderBottom: '3px solid #0a0a0a',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'stretch',
        gap: 0,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 20px 12px 0',
          borderRight: '3px solid #0a0a0a',
          minWidth: '200px',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            background: '#0a0a0a',
            border: '3px solid #0a0a0a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFE234',
            fontWeight: 900,
            fontSize: '18px',
            fontFamily: 'var(--font-mono)',
            flexShrink: 0,
          }}>
            B
          </div>
          <div>
            <div style={{
              fontSize: '13px',
              fontWeight: 700,
              lineHeight: 1.2,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {firmName}
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'stretch',
          flex: 1,
          padding: '0 16px',
          gap: '4px',
        }}>
          {[
            { id: 'dashboard', label: '⊞ Dashboard' },
            { id: 'cases', label: '⊟ Cases' },
            { id: 'settings', label: '⚙ Settings' },
          ].map((nav) => (
            <button
              key={nav.id}
              onClick={() => handlePageChange(nav.id)}
              style={{
                background: currentPage === nav.id ? '#0a0a0a' : 'none',
                border: 'none',
                padding: '0 18px',
                fontFamily: 'var(--font-main)',
                fontSize: '13px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                cursor: 'pointer',
                color: currentPage === nav.id ? '#FFE234' : '#0a0a0a',
                position: 'relative',
                transition: 'all 0.1s',
              }}
              onMouseEnter={(e) => {
                if (currentPage !== nav.id) {
                  e.target.style.background = 'rgba(0,0,0,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== nav.id) {
                  e.target.style.background = 'none';
                }
              }}
            >
              {nav.label}
            </button>
          ))}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '12px 0 12px 20px',
          borderLeft: '3px solid #0a0a0a',
        }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              opacity: 0.7
            }}>
              Total Outstanding
            </div>
            <div style={{
              background: '#0a0a0a',
              color: '#FFE234',
              padding: '6px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 700,
              border: '3px solid #0a0a0a',
              display: 'inline-block',
            }}>
              {stats ? formatCurrency(stats.totalBalance) : 'PKR 0'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px' }}>
        {currentPage === 'dashboard' && (
          <Dashboard onCaseSelect={handleCaseSelect} stats={stats} />
        )}
        {currentPage === 'cases' && (
          <CaseList onCaseSelect={handleCaseSelect} />
        )}
        {currentPage === 'case-detail' && selectedCaseId && (
          <CaseDetail caseId={selectedCaseId} onBack={() => handlePageChange('cases')} />
        )}
        {currentPage === 'settings' && (
          <Settings onStatsUpdate={loadStats} onFirmNameChange={setFirmName} />
        )}
      </div>

      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700;900&family=IBM+Plex+Mono:wght@400;700&display=swap" rel="stylesheet" />
    </div>
  );
}

export default App;
