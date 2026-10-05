import React from 'react';
import { theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import RoleBadge from '../RoleBadge/RoleBadge';

export interface HeaderProps {
  onToggleMobileMenu: () => void;
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, title, subtitle }) => {
  const { user, role } = useAuth();

  return (
    <header
      style={{
        height: `${theme.layout.headerHeight}px`,
        backgroundColor: '#ffffff',
        borderBottom: `1px solid ${theme.colors.border}`,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          aria-label="Toggle Navigation Menu"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radii.md,
            padding: '6px',
            color: theme.colors.textSecondary,
            cursor: 'pointer',
          }}
          className="mobile-only-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {title && (
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: theme.typography.sizes.lg,
                fontWeight: theme.typography.weights.bold,
                color: theme.colors.textPrimary,
                lineHeight: 1.2,
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                style={{
                  margin: '2px 0 0 0',
                  fontSize: theme.typography.sizes.xs,
                  color: theme.colors.textTertiary,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <RoleBadge role={role} size="sm" />
        <span
          style={{
            fontSize: theme.typography.sizes.sm,
            fontWeight: theme.typography.weights.medium,
            color: theme.colors.textSecondary,
          }}
        >
          {user?.email}
        </span>
      </div>
    </header>
  );
};

export default Header;
