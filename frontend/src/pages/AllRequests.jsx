import { useEffect, useState } from 'react';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';

function money(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n.toLocaleString() : '-';
}

export default function AllRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => {
    setLoading(true);
    api.getRequests()
      .then(setRequests)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const counts = requests.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] || 0) + 1 }), {});

  const tabStyle = (active) => ({
    padding: '6px 14px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: active ? 700 : 500,
    background: active ? '#2563eb' : '#fff',
    color: active ? '#fff' : '#64748b',
    border: active ? '1px solid #2563eb' : '1px solid #e2e8f0',
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Credit Card Applications</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{requests.length} total applications</p>
        </div>
        <button onClick={load} style={{
          padding: '7px 14px', background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 6, fontSize: 13, cursor: 'pointer', color: '#374151',
        }}>
          Refresh
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[['all', 'All'], ['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']].map(([val, label]) => (
          <button key={val} style={tabStyle(filter === val)} onClick={() => setFilter(val)}>
            {label} {val !== 'all' && counts[val] ? `(${counts[val]})` : val === 'all' ? `(${requests.length})` : ''}
          </button>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.07)', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: 24, color: '#64748b' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>No applications found</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Applicant', 'Workflow', 'Card', 'Income', 'Limit', 'Score', 'Risk', 'Status', 'Submitted', 'Completed'].map(h => (
                  <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{r.applicantName || '-'}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{r.nationalId || '-'}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#2563eb', fontWeight: 700, whiteSpace: 'nowrap' }}>{r.processName || r.processKey || '-'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>{r.cardType || '-'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>{money(r.monthlyIncome)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14 }}>{money(r.creditLimitRequest)}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700 }}>{r.creditScore ?? '-'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, textTransform: 'capitalize' }}>{r.riskLevel || '-'}</td>
                  <td style={{ padding: '12px 16px' }}><StatusBadge status={r.status} /></td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>
                    {r.startTime ? new Date(r.startTime).toLocaleDateString() : '-'}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>
                    {r.endTime ? new Date(r.endTime).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
