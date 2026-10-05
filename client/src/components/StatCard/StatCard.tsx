import React from 'react';
import { theme } from '../../theme';
import { formatNumber } from '../../utils/formatters';

export interface StatCardProps {
  title: string;
  value: number | string | null | undefined;
  description?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  error?: string | null;
  style?: React.CSSProperties;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  isLoading = false,
  error,
  style,
}) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    border: `1px solid ${theme.colors.border}`,
    padding: '24px',
    boxShadow: theme.shadows.card,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '12px',
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: theme.typography.sizes.sm,
            fontWeight: theme.typography.weights.semibold,
            color: theme.colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {title}
        </span>
        {icon && (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: theme.radii.md,
              backgroundColor: theme.colors.primaryLight,
              color: theme.colors.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div>
        {isLoading ? (
          <div
            style={{
              height: '36px',
              width: '80px',
              borderRadius: theme.radii.md,
              backgroundColor: theme.colors.surfaceHover,
              animation: 'revora-pulse 1.5s infinite ease-in-out',
            }}
          />
        ) : error ? (
          <span style={{ fontSize: theme.typography.sizes.sm, color: theme.colors.danger }}>
            {error}
          </span>
        ) : (
          <div
            style={{
              fontSize: theme.typography.sizes['3xl'],
              fontWeight: theme.typography.weights.black,
              color: theme.colors.textPrimary,
              lineHeight: theme.typography.lineHeights.tight,
              letterSpacing: '-0.02em',
            }}
          >
            {typeof value === 'number' ? formatNumber(value) : value ?? '—'}
          </div>
        )}
      </div>

      {description && (
        <p
          style={{
            fontSize: theme.typography.sizes.xs,
            color: theme.colors.textTertiary,
            margin: 0,
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default StatCard;
