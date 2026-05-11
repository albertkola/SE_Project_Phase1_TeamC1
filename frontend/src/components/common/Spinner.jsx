const SIZE_MAP = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-[3px]',
};

export default function Spinner({ size = 'md', className = '' }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block ${SIZE_MAP[size] || SIZE_MAP.md} border-white border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
}
