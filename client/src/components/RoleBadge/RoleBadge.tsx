import React from 'react';
import { Role } from '../../types';
import { theme } from '../../theme';
import { ROLE_LABELS } from '../../utils/constants';

export interface RoleBadgeProps {
  role?: Role | null;
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'sm' }) => {
  if (!role) return null;

  const roleConfig = theme.colors.roles[role] || {
    bg: theme.colors.surfaceSubtle,
    border: theme.colors.border,
    text: theme.colors.textSecondary,
  };

  const label = ROLE_LABELS[role] || role;

  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: size === 'sm' ? '2px 8px' : '4px 12px',
    fontSize: size === 'sm' ? theme.typography.sizes.xs : theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    lineHeight: theme.typography.lineHeights.tight,
    borderRadius: theme.radii.full,
    backgroundColor: roleConfig.bg,
    color: roleConfig.text,
    border: `1px solid ${roleConfig.border}`,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  };

  return (
    <span style={style}>
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: roleConfig.text,
        }}
      />
      <span>{label}</span>
    </span>
  );
};

export default RoleBadge;
