const STATUS_STYLES = {
  pending: { bg: 'rgba(255, 179, 0, 0.15)', color: '#FFB300', border: '#FFB300' },
  confirmed: { bg: 'rgba(0, 200, 83, 0.15)', color: '#00C853', border: '#00C853' },
  active: { bg: 'rgba(0, 200, 83, 0.15)', color: '#00C853', border: '#00C853' },
  rejected: { bg: 'rgba(255, 59, 48, 0.15)', color: '#FF3B30', border: '#FF3B30' },
  cancelled: { bg: 'rgba(255, 59, 48, 0.15)', color: '#FF3B30', border: '#FF3B30' },
  completed: { bg: 'rgba(170, 170, 170, 0.15)', color: '#AAAAAA', border: '#AAAAAA' },
  default: { bg: 'rgba(170, 170, 170, 0.15)', color: '#AAAAAA', border: '#333333' },
};

export default function Badge({ status, children, className = '' }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.default;
  return (
    <span
      className={`inline-flex items-center px-grid-1 py-[2px] text-small font-semibold uppercase tracking-wider rounded-[2px] border ${className}`}
      style={{
        backgroundColor: style.bg,
        color: style.color,
        borderColor: style.border,
      }}
    >
      {children || status}
    </span>
  );
}
