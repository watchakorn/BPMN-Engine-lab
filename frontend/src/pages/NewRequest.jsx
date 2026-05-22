import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';

const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid #e2e8f0',
  borderRadius: 6,
  fontSize: 14,
  background: '#fff',
  color: '#1e293b',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
  marginBottom: 6,
};

const processBadgeColor = {
  fixedFlow: '#0f766e',
  creditCardSimple: '#2563eb',
  creditCardAdvanced: '#b45309',
};

const initialForm = {
  applicantName: '',
  nationalId: '',
  monthlyIncome: '',
  employmentType: 'employee',
  employer: '',
  cardType: 'Classic',
  creditLimitRequest: '',
  processKey: '',
};

export default function NewRequest() {
  const nav = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProcs, setLoadingProcs] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.getProcesses()
      .then(procs => {
        const deployed = procs.filter(p => p.deployed);
        setProcesses(deployed);
        if (deployed.length > 0) setForm(f => ({ ...f, processKey: deployed[0].key }));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoadingProcs(false));
  }, []);

  const set = (key) => (event) => setForm(f => ({ ...f, [key]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await api.createRequest({
        applicantName: form.applicantName.trim(),
        nationalId: form.nationalId.trim(),
        monthlyIncome: Number(form.monthlyIncome),
        employmentType: form.employmentType,
        employer: form.employer.trim(),
        cardType: form.cardType,
        creditLimitRequest: form.creditLimitRequest ? Number(form.creditLimitRequest) : 0,
        processKey: form.processKey,
      });

      const suffix = result.autoDecision
        ? `Auto decision: ${result.status} with score ${result.creditScore}.`
        : 'Manual review task created if the score is in the review band.';
      setSuccess(`Application submitted. ${suffix}`);
      setTimeout(() => nav('/requests'), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedProc = processes.find(p => p.key === form.processKey);

  return (
    <div style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6, color: '#0f172a' }}>New Credit Card Application</h1>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>
        Submit one application through the hardcoded flow or a BPMN-managed flow.
      </p>

      <div style={{ background: '#fff', borderRadius: 12, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.07)' }}>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 22 }}>
            <label style={labelStyle}>Workflow *</label>
            {loadingProcs ? (
              <div style={{ fontSize: 13, color: '#94a3b8', padding: '8px 0' }}>Loading workflows...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {processes.map(proc => {
                  const color = processBadgeColor[proc.key] || '#2563eb';
                  const selected = form.processKey === proc.key;
                  return (
                    <label key={proc.key} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 8,
                      border: selected ? `2px solid ${color}` : '2px solid #e2e8f0',
                      background: selected ? `${color}08` : '#fafafa',
                      cursor: 'pointer',
                    }}>
                      <input
                        type="radio"
                        name="processKey"
                        value={proc.key}
                        checked={selected}
                        onChange={set('processKey')}
                        style={{ marginTop: 2, accentColor: color }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 600, fontSize: 14, color: selected ? color : '#374151' }}>
                            {proc.name}
                          </span>
                          {proc.hardcoded && (
                            <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 99, background: '#ccfbf1', color: '#0f766e', fontWeight: 700 }}>
                              hardcoded
                            </span>
                          )}
                          <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 99, background: `${color}20`, color, fontWeight: 600 }}>
                            v{proc.version}
                          </span>
                          <Link to="/workflow" style={{ fontSize: 11, color: '#64748b', textDecoration: 'none', marginLeft: 'auto' }}>
                            view diagram
                          </Link>
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{proc.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ height: 1, background: '#f1f5f9', marginBottom: 20 }} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 18 }}>
            <div>
              <label style={labelStyle}>Applicant Name *</label>
              <input style={inputStyle} value={form.applicantName} onChange={set('applicantName')} placeholder="Alice Tan" required />
            </div>
            <div>
              <label style={labelStyle}>National ID *</label>
              <input style={inputStyle} value={form.nationalId} onChange={set('nationalId')} placeholder="1234567890123" required minLength={6} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 18 }}>
            <div>
              <label style={labelStyle}>Monthly Income *</label>
              <input style={inputStyle} type="number" min="0" value={form.monthlyIncome} onChange={set('monthlyIncome')} placeholder="50000" required />
            </div>
            <div>
              <label style={labelStyle}>Employment Type</label>
              <select style={inputStyle} value={form.employmentType} onChange={set('employmentType')}>
                <option value="employee">Employee</option>
                <option value="business_owner">Business Owner</option>
                <option value="freelancer">Freelancer</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Employer / Company</label>
            <input style={inputStyle} value={form.employer} onChange={set('employer')} placeholder="Company name" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div>
              <label style={labelStyle}>Card Type *</label>
              <select style={inputStyle} value={form.cardType} onChange={set('cardType')} required>
                <option value="Classic">Classic</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Credit Limit Request</label>
              <input style={inputStyle} type="number" min="0" value={form.creditLimitRequest} onChange={set('creditLimitRequest')} placeholder="100000" />
            </div>
          </div>

          {error && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: 6, fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: '#d1fae5', color: '#065f46', padding: '10px 14px', borderRadius: 6, fontSize: 13, marginBottom: 16 }}>
              {success}
            </div>
          )}

          <button type="submit" disabled={loading || !form.processKey} style={{
            width: '100%',
            padding: '11px',
            background: loading || !form.processKey ? '#93c5fd' : (processBadgeColor[form.processKey] || '#2563eb'),
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 700,
            cursor: loading || !form.processKey ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Submitting...' : `Submit via ${selectedProc?.name || 'selected workflow'}`}
          </button>
        </form>
      </div>
    </div>
  );
}
