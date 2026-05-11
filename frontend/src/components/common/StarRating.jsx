import { useState } from 'react';
import { Star } from 'lucide-react';

const SIZE_PX = { sm: 14, md: 18, lg: 24 };

export default function StarRating({
  value = 0,
  onChange,
  interactive = false,
  size = 'md',
  className = '',
}) {
  const [hover, setHover] = useState(0);
  const px = SIZE_PX[size] || SIZE_PX.md;
  const display = hover || value;

  return (
    <div className={`inline-flex items-center gap-[2px] ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(display);
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && onChange?.(star)}
            className={`${interactive ? 'cursor-pointer' : 'cursor-default'} bg-transparent border-0 p-0`}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            <Star
              size={px}
              fill={filled ? '#FFD700' : 'transparent'}
              color={filled ? '#FFD700' : '#666666'}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
      {!interactive && value > 0 && (
        <span className="ml-grid-1 text-small text-text-secondary">
          {Number(value).toFixed(1)}
        </span>
      )}
    </div>
  );
}
