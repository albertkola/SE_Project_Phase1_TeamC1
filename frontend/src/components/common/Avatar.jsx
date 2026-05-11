const SIZES = {
  sm: 'w-8 h-8 text-small',
  md: 'w-10 h-10 text-body',
  lg: 'w-16 h-16 text-h3',
  xl: 'w-24 h-24 text-h2',
};

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export default function Avatar({ user, name, src, size = 'md', className = '' }) {
  const displayName = name || user?.full_name || user?.name || '';
  const picture = src || user?.profile_picture;
  const sizeClass = SIZES[size] || SIZES.md;

  if (picture) {
    return (
      <img
        src={picture}
        alt={displayName || 'avatar'}
        className={`${sizeClass} rounded-full border border-border object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full border border-border bg-surface-elevated text-text-primary flex items-center justify-center font-semibold ${className}`}
    >
      {getInitials(displayName)}
    </div>
  );
}
