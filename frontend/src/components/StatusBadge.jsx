const colors = {
  pending:  { bg: '#fef3c7', text: '#92400e' },
  approved: { bg: '#d1fae5', text: '#065f46' },
  rejected: { bg: '#fee2e2', text: '#991b1b' },
  completed:{ bg: '#e0e7ff', text: '#3730a3' },
};

export default function StatusBadge({ status }) {
  const c = colors[status] || colors.completed;
  return (
    <span style={{
      padding: '2px 10px',
      borderRadius: 99,
      fontSize: 12,
      fontWeight: 600,
      background: c.bg,
      color: c.text,
      textTransform: 'capitalize',
      letterSpacing: '0.02em',
    }}>
      {status}
    </span>
  );
}
