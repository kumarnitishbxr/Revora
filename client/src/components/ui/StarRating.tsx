import React, { useState } from 'react';
import { Star } from 'lucide-react';

export interface StarRatingProps {
  value?: number | null;
  onChange?: (rating: number) => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  totalRatings?: number;
  className?: string;
  disabled?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value = 0,
  onChange,
  interactive = false,
  size = 'md',
  showValue = false,
  totalRatings,
  className = '',
  disabled = false,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const currentRating = hoverRating ?? (value || 0);

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => interactive && !disabled && setHoverRating(null)}
      >
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = currentRating >= starIndex;
          const isHalf = !isFilled && currentRating >= starIndex - 0.5;

          return (
            <button
              key={starIndex}
              type="button"
              disabled={!interactive || disabled}
              onClick={() => interactive && !disabled && onChange?.(starIndex)}
              onMouseEnter={() => interactive && !disabled && setHoverRating(starIndex)}
              className={`p-0.5 transition-transform duration-100 ${
                interactive && !disabled
                  ? 'cursor-pointer hover:scale-115 active:scale-95 focus:outline-none'
                  : 'cursor-default'
              }`}
              aria-label={`${starIndex} star${starIndex > 1 ? 's' : ''}`}
            >
              <Star
                className={`${starSizes[size]} transition-colors duration-150 ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isHalf
                    ? 'fill-amber-400/50 text-amber-400'
                    : 'text-slate-300 dark:text-slate-700'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1">
          {value ? value.toFixed(1) : '0.0'}
          {totalRatings !== undefined && (
            <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">
              ({totalRatings})
            </span>
          )}
        </span>
      )}
    </div>
  );
};
