export default function UserManual() {
  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>User Manual</h1>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
        This POC compares hardcoded approval logic with BPMN-driven credit card approval workflows.
      </p>

      <Section title="1. Choose a Workflow">
        <p>Open New Application and choose one of three flows.</p>
        <ul>
          <li><strong>Fixed Flow:</strong> backend JavaScript runs all routing in memory. It does not use Flowable.</li>
          <li><strong>BPMN Simple:</strong> Flowable runs an HTTP Task credit check and sends medium-risk applications to Manager Review.</li>
          <li><strong>BPMN Advanced:</strong> Flowable uses a stricter auto-approval threshold and requires Manager then Director approval for medium-risk applications.</li>
        </ul>
      </Section>

      <Section title="2. Submit an Application">
        <p>Fill in applicant name, national ID, monthly income, employment details, card type, and optional credit limit request.</p>
        <p>The backend mock credit API uses the national ID as a deterministic seed, so the same ID always receives the same credit score.</p>
      </Section>

      <Section title="3. Credit Score Routing">
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <Th>Flow</Th>
              <Th>Auto Approve</Th>
              <Th>Manual Review</Th>
              <Th>Auto Reject</Th>
            </tr>
          </thead>
          <tbody>
            <Tr cells={['Fixed Flow', 'Score >= 700', '400-699', 'Score < 400']} />
            <Tr cells={['BPMN Simple', 'Score >= 700', '450-699 Manager', 'Score < 450']} />
            <Tr cells={['BPMN Advanced', 'Score >= 750', '400-749 Manager + Director', 'Score < 400']} />
          </tbody>
        </table>
      </Section>

      <Section title="4. Review Tasks">
        <p>Open Review Inbox to approve or reject pending manual tasks. Task cards show score, risk level, existing cards, monthly debt, and Flowable process name.</p>
        <p>For the advanced BPMN flow, approving the Manager task creates a Director task before final approval.</p>
      </Section>

      <Section title="5. View Results">
        <p>Open Applications to see all active and completed applications with status, card type, requested limit, score, and risk level.</p>
        <p>Open Workflow Viewer to inspect the static BPMN diagrams for all three flows.</p>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ background: '#fff', borderRadius: 12, padding: 22, boxShadow: '0 1px 3px rgba(0,0,0,0.07)', marginBottom: 16 }}>
      <h2 style={{ fontSize: 17, color: '#0f172a', marginBottom: 10 }}>{title}</h2>
      <div style={{ color: '#475569', fontSize: 14, lineHeight: 1.7 }}>{children}</div>
    </section>
  );
}

function Th({ children }) {
  return (
    <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
      {children}
    </th>
  );
}

function Tr({ cells }) {
  return (
    <tr>
      {cells.map(cell => (
        <td key={cell} style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
          {cell}
        </td>
      ))}
    </tr>
  );
}
