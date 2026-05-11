import Spinner from './Spinner';

const VARIANTS = {
  primary:
    'bg-white text-black border border-white hover:bg-[#EAEAEA] hover:border-[#EAEAEA] disabled:opacity-50',
  secondary:
    'bg-transparent text-white border border-white hover:bg-[#1C1C1C] disabled:opacity-50',
  danger:
    'bg-error text-white border border-error hover:opacity-90 disabled:opacity-50',
  ghost:
    'bg-transparent text-white border border-transparent hover:bg-[#1C1C1C] disabled:opacity-50',
  dark:
    'bg-black text-white border border-[#333333] hover:bg-[#1C1C1C] disabled:opacity-50',
};

const SIZES = {
  sm: 'h-8 px-grid-2 text-small',
  md: 'h-10 px-grid-3 text-body',
  lg: 'h-12 px-grid-3 text-body',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  onClick,
  ...rest
}) {
  const isDisabled = disabled || loading;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center gap-grid-1 font-bold tracking-wide rounded-[2px] transition-colors duration-150 disabled:cursor-not-allowed ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`}
      {...rest}
    >
      {loading ? (
        <>
          <Spinner size="sm" />
          <span>Loading…</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
