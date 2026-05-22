import { useEffect, useState } from 'react';
import { api } from '../api';

const riskColor = {
  low: { bg: '#dcfce7', text: '#166534' },
  medium: { bg: '#fef3c7', text: '#92400e' },
  high: { bg: '#fee2e2', text: '#991b1b' },
};

function money(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n.toLocaleString() : '-';
}

function TaskCard({ task, onComplete }) {
  const [comment, setComment] = useState('');
  const [reviewer, setReviewer] = useState('');
  const [loading, setLoading] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const risk = riskColor[task.riskLevel] || riskColor.medium;
  const defaultReviewer = task.name?.toLowerCase().includes('director') ? 'director' : 'manager';

  const handle = async (approved) => {
    setLoading(approved ? 'approve' : 'reject');
    try {
      await api.completeTask(task.id, { approved, comment, reviewer: reviewer || defaultReviewer });
      onComplete(task.id);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, marginBottom: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{task.applicantName || 'Credit Card Application'}</span>
              <span style={{ padding: '1px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: risk.bg, color: risk.text }}>
                {task.riskLevel || 'unknown'} risk
              </span>
              <span style={{ padding: '1px 8px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: '#dbeafe', color: '#1d4ed8' }}>
                score {task.creditScore ?? '-'}
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              {task.name || 'Review'} | {task.cardType || 'Card'} | limit {money(task.creditLimitRequest)} | {task.processName || task.processKey}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
              National ID: {task.nationalId || '-'} | Income: {money(task.monthlyIncome)} | Created: {task.created ? new Date(task.created).toLocaleString() : '-'}
            </div>
          </div>
          <span style={{ color: '#94a3b8', fontSize: 18, lineHeight: 1 }}>{expanded ? '^' : 'v'}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid #f1f5f9', padding: '16px 20px', background: '#fafafa' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 16 }}>
            <Info label="Existing Cards" value={task.existingCards ?? '-'} />
            <Info label="Monthly Debt" value={money(task.monthlyDebt)} />
            <Info label="Recommendation" value={task.recommendation || '-'} />
            <Info label="Employer" value={task.employer || '-'} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
              Reviewer Name
            </label>
            <input
              style={{ width: '100%', padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
              value={reviewer}
              onChange={e => setReviewer(e.target.value)}
              placeholder={`Default: ${defaultReviewer}`}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 4 }}>
              Comment
            </label>
            <textarea
              style={{ width: '100%', padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, minHeight: 60, resize: 'vertical', boxSizing: 'border-box' }}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Decision note for audit trail"
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => handle(true)} disabled={!!loading} style={{
              flex: 1, padding: '9px', background: loading === 'approve' ? '#6ee7b7' : '#10b981',
              color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading === 'approve' ? 'Approving...' : 'Approve'}
            </button>
            <button onClick={() => handle(false)} disabled={!!loading} style={{
              flex: 1, padding: '9px', background: loading === 'reject' ? '#fca5a5' : '#ef4444',
              color: '#fff', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading === 'reject' ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 12px' }}>
      <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: 14, color: '#0f172a', fontWeight: 700, marginTop: 3 }}>{value}</div>
    </div>
  );
}

export default function TaskInbox() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.getTasks()
      .then(setTasks)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onComplete = (id) => setTasks(t => t.filter(x => x.id !== id));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>Credit Review Inbox</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
            {tasks.length} pending {tasks.length === 1 ? 'task' : 'tasks'} awaiting manual decision
          </p>
        </div>
        <button onClick={load} style={{
          padding: '7px 14px', background: '#fff', border: '1px solid #e2e8f0',
          borderRadius: 6, fontSize: 13, cursor: 'pointer', color: '#374151',
        }}>
          Refresh
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, padding: 40, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
          <div style={{ fontWeight: 700, color: '#374151' }}>Inbox is empty</div>
          <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>No medium-risk applications are waiting for review.</div>
        </div>
      ) : (
        tasks.map(task => <TaskCard key={task.id} task={task} onComplete={onComplete} />)
      )}
    </div>
  );
}
