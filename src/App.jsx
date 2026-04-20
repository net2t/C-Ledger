import { useEffect, useMemo, useState } from 'react';

import './App.css';
import { apiGet, apiSend } from './lib/api';
import { useDebounce } from './lib/useDebounce';

const PHASES = [
  { v: 1, label: 'Submitted' },
  { v: 2, label: 'Acknowledged' },
  { v: 3, label: 'Published' },
  { v: 4, label: 'Completed / Objection handled' },
];

function App() {
  const [tab, setTab] = useState('dashboard');
  const [dash, setDash] = useState(null);

  const [cases, setCases] = useState([]);
  const [caseSearch, setCaseSearch] = useState('');
  const debouncedSearch = useDebounce(caseSearch, 250);

  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);

  const [newCase, setNewCase] = useState({
    tmNumber: '',
    clientName: '',
    caseType: 'X',
    phase: 1,
    assignedTo: '',
    deadlineDate: '',
    remarks: '',
  });

  const [payment, setPayment] = useState({
    tmNumber: '',
    direction: 'in',
    amount: '',
    date: '',
    method: '',
    refNo: '',
    notes: '',
  });
  const debouncedTm = useDebounce(payment.tmNumber, 300);
  const [tmLookup, setTmLookup] = useState({ status: 'idle', data: null, error: '' });

  useEffect(() => {
    apiGet('/api/dashboard').then(setDash).catch(() => setDash(null));
  }, []);

  useEffect(() => {
    apiGet(`/api/cases?search=${encodeURIComponent(debouncedSearch)}`)
      .then(setCases)
      .catch(() => setCases([]));
  }, [debouncedSearch]);

  useEffect(() => {
    if (!selectedCaseId) {
      setSelectedCase(null);
      return;
    }
    apiGet(`/api/cases/${selectedCaseId}`)
      .then(setSelectedCase)
      .catch(() => setSelectedCase(null));
  }, [selectedCaseId]);

  useEffect(() => {
    const tm = (debouncedTm || '').trim();
    if (!tm) {
      setTmLookup({ status: 'idle', data: null, error: '' });
      return;
    }
    setTmLookup((s) => ({ ...s, status: 'loading', error: '' }));
    apiGet(`/api/cases/by-tm/${encodeURIComponent(tm)}`)
      .then((data) => setTmLookup({ status: 'ok', data, error: '' }))
      .catch((e) => setTmLookup({ status: 'error', data: null, error: e.message || 'Case not found' }));
  }, [debouncedTm]);

  const selectedPhaseLabel = useMemo(() => {
    const p = PHASES.find((x) => x.v === Number(selectedCase?.phase));
    return p ? p.label : '—';
  }, [selectedCase?.phase]);

  async function createCase() {
    const body = {
      ...newCase,
      tmNumber: newCase.tmNumber.trim().toUpperCase(),
      clientName: newCase.clientName.trim(),
      assignedTo: newCase.assignedTo.trim(),
      deadlineDate: newCase.deadlineDate || null,
    };
    const created = await apiSend('/api/cases', { method: 'POST', body });
    setNewCase({ tmNumber: '', clientName: '', caseType: 'X', phase: 1, assignedTo: '', deadlineDate: '', remarks: '' });
    setTab('cases');
    setSelectedCaseId(created.id);
    const list = await apiGet('/api/cases');
    setCases(list);
  }

  async function addPayment() {
    const body = {
      ...payment,
      tmNumber: payment.tmNumber.trim().toUpperCase(),
      amount: Number(payment.amount),
      date: payment.date || null,
    };
    await apiSend('/api/payments', { method: 'POST', body });
    setPayment({ tmNumber: '', direction: 'in', amount: '', date: '', method: '', refNo: '', notes: '' });
    setTmLookup({ status: 'idle', data: null, error: '' });
    const d = await apiGet('/api/dashboard');
    setDash(d);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">BrandEx Ledger</div>
        <nav className="tabs">
          <button className={tab === 'dashboard' ? 'tab active' : 'tab'} onClick={() => setTab('dashboard')}>Dashboard</button>
          <button className={tab === 'cases' ? 'tab active' : 'tab'} onClick={() => setTab('cases')}>Cases</button>
          <button className={tab === 'payments' ? 'tab active' : 'tab'} onClick={() => setTab('payments')}>Payments</button>
        </nav>
        <div className="right">
          <span className="pill">SQLite</span>
        </div>
      </header>

      <main className="container">
        {tab === 'dashboard' && (
          <section className="grid">
            <div className="card">
              <div className="card-title">Total Cases</div>
              <div className="big">{dash?.totalCases ?? '—'}</div>
            </div>
            <div className="card">
              <div className="card-title">Overdue</div>
              <div className="big">{dash?.overdueCount ?? '—'}</div>
            </div>
            <div className="card span2">
              <div className="card-title">By Phase</div>
              <div className="rows">
                {PHASES.map((p) => {
                  const n = dash?.byPhase?.find((x) => Number(x.phase) === p.v)?.n ?? 0;
                  return (
                    <div key={p.v} className="row">
                      <span className="muted">Phase {p.v}</span>
                      <span>{p.label}</span>
                      <span className="mono">{n}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card span2">
              <div className="card-title">Create Case</div>
              <div className="form">
                <label>
                  <span>TM Number</span>
                  <input value={newCase.tmNumber} onChange={(e) => setNewCase((s) => ({ ...s, tmNumber: e.target.value }))} placeholder="TM-1001" />
                </label>
                <label>
                  <span>Client Name</span>
                  <input value={newCase.clientName} onChange={(e) => setNewCase((s) => ({ ...s, clientName: e.target.value }))} placeholder="Client" />
                </label>
                <label>
                  <span>Case Type</span>
                  <select value={newCase.caseType} onChange={(e) => setNewCase((s) => ({ ...s, caseType: e.target.value }))}>
                    <option value="X">X</option>
                    <option value="Y">Y</option>
                    <option value="B">B</option>
                  </select>
                </label>
                <label>
                  <span>Phase</span>
                  <select value={newCase.phase} onChange={(e) => setNewCase((s) => ({ ...s, phase: Number(e.target.value) }))}>
                    {PHASES.map((p) => (
                      <option key={p.v} value={p.v}>Phase {p.v} — {p.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Assigned Person</span>
                  <input value={newCase.assignedTo} onChange={(e) => setNewCase((s) => ({ ...s, assignedTo: e.target.value }))} placeholder="Agent name" />
                </label>
                <label>
                  <span>Deadline</span>
                  <input type="date" value={newCase.deadlineDate} onChange={(e) => setNewCase((s) => ({ ...s, deadlineDate: e.target.value }))} />
                </label>
                <label className="span2">
                  <span>Remarks</span>
                  <input value={newCase.remarks} onChange={(e) => setNewCase((s) => ({ ...s, remarks: e.target.value }))} />
                </label>
                <div className="actions span2">
                  <button className="btn" onClick={createCase} disabled={!newCase.tmNumber.trim() || !newCase.clientName.trim()}>
                    Save Case
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {tab === 'cases' && (
          <section className="split">
            <div className="card">
              <div className="card-title">Cases</div>
              <input
                value={caseSearch}
                onChange={(e) => setCaseSearch(e.target.value)}
                placeholder="Search TM, client, assigned..."
              />
              <div className="list">
                {cases.map((c) => (
                  <button
                    key={c.id}
                    className={selectedCaseId === c.id ? 'list-item active' : 'list-item'}
                    onClick={() => setSelectedCaseId(c.id)}
                  >
                    <div className="list-top">
                      <span className="mono">{c.tmNumber}</span>
                      <span className="pill">P{c.phase}</span>
                    </div>
                    <div className="list-mid">{c.clientName}</div>
                    <div className="list-sub muted">{c.assignedTo || 'Unassigned'}{c.deadlineDate ? ` · Due ${c.deadlineDate}` : ''}</div>
                  </button>
                ))}
                {!cases.length && <div className="muted" style={{ padding: 12 }}>No cases found.</div>}
              </div>
            </div>

            <div className="card">
              <div className="card-title">Case Detail</div>
              {!selectedCase && <div className="muted">Select a case from the left.</div>}
              {selectedCase && (
                <>
                  <div className="kv">
                    <div><span className="muted">TM</span><span className="mono">{selectedCase.tmNumber}</span></div>
                    <div><span className="muted">Client</span><span>{selectedCase.clientName}</span></div>
                    <div><span className="muted">Phase</span><span>{selectedPhaseLabel}</span></div>
                    <div><span className="muted">Assigned</span><span>{selectedCase.assignedTo || '—'}</span></div>
                    <div><span className="muted">Deadline</span><span>{selectedCase.deadlineDate || '—'}</span></div>
                    <div><span className="muted">Balance</span><span className="mono">{Number(selectedCase.balance || 0).toLocaleString()}</span></div>
                  </div>

                  <div className="card-title" style={{ marginTop: 14 }}>Payments</div>
                  <div className="rows">
                    {selectedCase.payments?.map((p) => (
                      <div key={p.id} className="row">
                        <span className="mono">{p.date}</span>
                        <span>{p.direction === 'in' ? 'IN' : 'OUT'}</span>
                        <span className="mono">{Number(p.amount).toLocaleString()}</span>
                      </div>
                    ))}
                    {!selectedCase.payments?.length && <div className="muted">No payments yet.</div>}
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {tab === 'payments' && (
          <section className="grid">
            <div className="card span2">
              <div className="card-title">Add Payment</div>

              <div className="form">
                <label>
                  <span>TM Number</span>
                  <input
                    value={payment.tmNumber}
                    onChange={(e) => setPayment((s) => ({ ...s, tmNumber: e.target.value }))}
                    placeholder="TM-1001"
                  />
                </label>
                <label>
                  <span>Direction</span>
                  <select value={payment.direction} onChange={(e) => setPayment((s) => ({ ...s, direction: e.target.value }))}>
                    <option value="in">Incoming</option>
                    <option value="out">Outgoing</option>
                  </select>
                </label>
                <label>
                  <span>Amount</span>
                  <input
                    type="number"
                    value={payment.amount}
                    onChange={(e) => setPayment((s) => ({ ...s, amount: e.target.value }))}
                    placeholder="0"
                    min="0"
                  />
                </label>
                <label>
                  <span>Date</span>
                  <input type="date" value={payment.date} onChange={(e) => setPayment((s) => ({ ...s, date: e.target.value }))} />
                </label>
                <label>
                  <span>Method</span>
                  <input value={payment.method} onChange={(e) => setPayment((s) => ({ ...s, method: e.target.value }))} placeholder="Cash / Bank" />
                </label>
                <label>
                  <span>Ref No</span>
                  <input value={payment.refNo} onChange={(e) => setPayment((s) => ({ ...s, refNo: e.target.value }))} />
                </label>
                <label className="span2">
                  <span>Notes</span>
                  <input value={payment.notes} onChange={(e) => setPayment((s) => ({ ...s, notes: e.target.value }))} />
                </label>
              </div>

              <div className="lookup">
                {tmLookup.status === 'idle' && <div className="muted">Enter TM Number to auto-fetch case details.</div>}
                {tmLookup.status === 'loading' && <div className="muted">Fetching case…</div>}
                {tmLookup.status === 'error' && <div className="error">{tmLookup.error || 'Case not found'}</div>}
                {tmLookup.status === 'ok' && (
                  <div className="kv">
                    <div><span className="muted">Client</span><span>{tmLookup.data.clientName}</span></div>
                    <div><span className="muted">Phase</span><span>{PHASES.find((p) => p.v === Number(tmLookup.data.phase))?.label || `Phase ${tmLookup.data.phase}`}</span></div>
                    <div><span className="muted">Prev. Payments</span><span className="mono">{tmLookup.data.payments?.length || 0}</span></div>
                  </div>
                )}
              </div>

              <div className="actions">
                <button
                  className="btn"
                  onClick={addPayment}
                  disabled={tmLookup.status !== 'ok' || !payment.amount || Number(payment.amount) <= 0}
                >
                  Save Payment
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
