export default function Card({ children, hover = false, className = '', onClick, ...rest }) {
  return (
    <div
      onClick={onClick}
      className={`bg-surface border border-border rounded-[2px] p-grid-3 ${hover ? 'hover:bg-surface-elevated cursor-pointer transition-colors' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
