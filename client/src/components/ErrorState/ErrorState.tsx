import React from 'react';
import { theme } from '../../theme';
import Button from '../Button/Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: React.CSSProperties;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'Failed to load data. Please check your connection and try again.',
  onRetry,
  style,
}) => {
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 20px',
        textAlign: 'center',
        backgroundColor: theme.colors.dangerLight,
        borderRadius: theme.radii.lg,
        border: `1px solid ${theme.colors.dangerBorder}`,
        ...style,
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.colors.danger,
          marginBottom: '12px',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h4
        style={{
          fontSize: theme.typography.sizes.md,
          fontWeight: theme.typography.weights.bold,
          color: theme.colors.dangerText,
          margin: '0 0 6px 0',
        }}
      >
        {title}
      </h4>

      <p
        style={{
          fontSize: theme.typography.sizes.sm,
          color: theme.colors.dangerText,
          opacity: 0.9,
          maxWidth: '420px',
          margin: '0 0 16px 0',
        }}
      >
        {message}
      </p>

      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
