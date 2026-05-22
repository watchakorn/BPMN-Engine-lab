import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { api } from '../api';

function StatCard({ label, value, color, to }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: '24px',
        borderLeft: `4px solid ${color}`,
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
      }}>
        <div style={{ fontSize: 32, fontWeight: 700, color }}>{value}</div>
        <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{label}</div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const [requests, setRequests] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getRequests(), api.getTasks(), api.health()])
      .then(([reqs, tks, h]) => {
        setRequests(reqs);
        setTasks(tks);
        setHealth(h);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pending = requests.filter(r => r.status === 'pending').length;
  const approved = requests.filter(r => r.status === 'approved').length;
  const rejected = requests.filter(r => r.status === 'rejected').length;
  const autoDecisions = requests.filter(r => r.reviewer === 'system').length;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Credit Card Approval Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: health?.status === 'ok' ? '#10b981' : '#ef4444',
            display: 'inline-block',
          }} />
          <span style={{ fontSize: 13, color: '#64748b' }}>
            Flowable: {health ? (health.status === 'ok' ? 'Connected' : 'Unavailable') : 'Checking...'}
          </span>
        </div>
      </div>

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading...</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
            <StatCard label="Manual Review Tasks" value={tasks.length} color="#f59e0b" to="/tasks" />
            <StatCard label="Pending Applications" value={pending} color="#2563eb" to="/requests" />
            <StatCard label="Approved" value={approved} color="#10b981" to="/requests" />
            <StatCard label="Rejected" value={rejected} color="#ef4444" to="/requests" />
            <StatCard label="Auto Decisions" value={autoDecisions} color="#0f766e" to="/requests" />
          </div>

          <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Recent Applications</h2>
              <Link to="/new" style={{
                background: '#2563eb',
                color: '#fff',
                padding: '7px 16px',
                borderRadius: 6,
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 700,
              }}>
                New Application
              </Link>
            </div>
            {requests.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: 14 }}>No credit card applications yet.</p>
            ) : (
              requests.slice(0, 5).map(r => (
                <div key={r.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid #f1f5f9',
                  gap: 16,
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{r.applicantName || r.id}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                      {r.cardType || 'Card'} | score {r.creditScore ?? '-'} | {r.processName || r.processKey || '-'} | {r.startTime ? new Date(r.startTime).toLocaleString() : ''}
                    </div>
                  </div>
                  <span style={{
                    padding: '2px 10px',
                    borderRadius: 99,
                    fontSize: 12,
                    fontWeight: 700,
                    background: r.status === 'pending' ? '#fef3c7' : r.status === 'approved' ? '#d1fae5' : '#fee2e2',
                    color: r.status === 'pending' ? '#92400e' : r.status === 'approved' ? '#065f46' : '#991b1b',
                    textTransform: 'capitalize',
                  }}>
                    {r.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
