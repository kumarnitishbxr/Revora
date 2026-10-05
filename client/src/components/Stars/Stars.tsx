import React, { useState } from 'react';
import { theme } from '../../theme';

export interface StarsProps {
  value: number; // 0 to 5
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  showValue?: boolean;
}

export const Stars: React.FC<StarsProps> = ({
  value = 0,
  onChange,
  size = 'md',
  disabled = false,
  showValue = false,
}) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const starSizes: Record<'sm' | 'md' | 'lg', number> = {
    sm: 14,
    md: 18,
    lg: 24,
  };

  const px = starSizes[size];
  const isInteractive = typeof onChange === 'function' && !disabled;
  const activeRating = hoverValue !== null ? hoverValue : value;

  const handleKeyDown = (e: React.KeyboardEvent, starIndex: number) => {
    if (!isInteractive) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(starIndex);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(5, (value || 0) + 1);
      onChange(next);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      const prev = Math.max(1, (value || 1) - 1);
      onChange(prev);
    }
  };

  return (
    <div
      role={isInteractive ? 'radiogroup' : 'img'}
      aria-label={`Rating: ${value.toFixed(1)} out of 5 stars`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFilled = activeRating >= starIndex;
        const isPartial = !isFilled && activeRating > starIndex - 1;

        return (
          <button
            key={starIndex}
            type="button"
            role={isInteractive ? 'radio' : 'presentation'}
            aria-checked={value === starIndex}
            aria-label={`${starIndex} star${starIndex > 1 ? 's' : ''}`}
            disabled={!isInteractive}
            tabIndex={isInteractive ? (value === starIndex || (value === 0 && starIndex === 1) ? 0 : -1) : -1}
            onClick={() => isInteractive && onChange(starIndex)}
            onMouseEnter={() => isInteractive && setHoverValue(starIndex)}
            onMouseLeave={() => isInteractive && setHoverValue(null)}
            onKeyDown={(e) => handleKeyDown(e, starIndex)}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px',
              margin: 0,
              cursor: isInteractive ? 'pointer' : 'default',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none',
              transition: 'transform 0.1s ease',
              transform: isInteractive && hoverValue === starIndex ? 'scale(1.15)' : 'none',
            }}
          >
            <svg
              width={px}
              height={px}
              viewBox="0 0 24 24"
              fill={isFilled || isPartial ? theme.colors.star : 'none'}
              stroke={isFilled || isPartial ? theme.colors.star : theme.colors.starEmpty}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ display: 'block' }}
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        );
      })}

      {showValue && (
        <span
          style={{
            marginLeft: '6px',
            fontSize: size === 'sm' ? theme.typography.sizes.xs : theme.typography.sizes.sm,
            fontWeight: theme.typography.weights.bold,
            color: theme.colors.textPrimary,
          }}
        >
          {value ? value.toFixed(1) : '0.0'}
        </span>
      )}
    </div>
  );
};

export default Stars;
