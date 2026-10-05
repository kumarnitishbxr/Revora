import React from 'react';
import { theme } from '../../theme';

export interface LoadingStateProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  fullHeight?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = 'Loading data...',
  size = 'md',
  fullHeight = false,
}) => {
  const spinnerSizes: Record<'sm' | 'md' | 'lg', number> = {
    sm: 20,
    md: 32,
    lg: 48,
  };

  const px = spinnerSizes[size];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        padding: '40px 20px',
        minHeight: fullHeight ? '50vh' : 'auto',
      }}
    >
      <div
        style={{
          width: `${px}px`,
          height: `${px}px`,
          border: '3px solid #e0e7ff',
          borderTopColor: theme.colors.primary,
          borderRadius: '50%',
          animation: 'revora-spin 0.8s linear infinite',
        }}
      />
      {label && (
        <span
          style={{
            fontSize: theme.typography.sizes.sm,
            fontWeight: theme.typography.weights.medium,
            color: theme.colors.textSecondary,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default LoadingState;
