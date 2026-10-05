import React from 'react';
import { theme } from '../../theme';

export interface FieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const Field: React.FC<FieldProps> = ({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  style,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', ...style }}>
      {label && (
        <label
          htmlFor={htmlFor}
          style={{
            fontSize: theme.typography.sizes.sm,
            fontWeight: theme.typography.weights.semibold,
            color: theme.colors.textSecondary,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>{label}</span>
          {required && <span style={{ color: theme.colors.danger }}>*</span>}
        </label>
      )}

      {children}

      {error ? (
        <span
          role="alert"
          style={{
            fontSize: theme.typography.sizes.xs,
            fontWeight: theme.typography.weights.medium,
            color: theme.colors.danger,
            marginTop: '2px',
          }}
        >
          {error}
        </span>
      ) : hint ? (
        <span
          style={{
            fontSize: theme.typography.sizes.xs,
            color: theme.colors.textMuted,
            marginTop: '2px',
          }}
        >
          {hint}
        </span>
      ) : null}
    </div>
  );
};

export default Field;
