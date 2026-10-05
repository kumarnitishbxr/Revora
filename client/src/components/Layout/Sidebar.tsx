import React from 'react';
import { NavLink } from 'react-router-dom';
import { theme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import RoleBadge from '../RoleBadge/RoleBadge';
import { getInitials } from '../../utils/formatters';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose, isMobile = false }) => {
  const { user, role, logout } = useAuth();

  // Role-specific navigation items
  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return [
          {
            label: 'Overview',
            path: '/admin/dashboard',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="9" rx="1" />
                <rect x="14" y="3" width="7" height="5" rx="1" />
                <rect x="14" y="12" width="7" height="9" rx="1" />
                <rect x="3" y="16" width="7" height="5" rx="1" />
              </svg>
            ),
          },
          {
            label: 'Manage Stores',
            path: '/admin/stores',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            ),
          },
          {
            label: 'Manage Users',
            path: '/admin/users',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            ),
          },
        ];

      case 'STORE_OWNER':
        return [
          {
            label: 'Store Dashboard',
            path: '/owner/dashboard',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            ),
          },
        ];

      case 'NORMAL_USER':
      default:
        return [
          {
            label: 'Discover Stores',
            path: '/stores',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            ),
          },
        ];
    }
  };

  const navItems = getNavItems();

  const sidebarStyle: React.CSSProperties = {
    width: `${theme.layout.sidebarWidth}px`,
    height: '100vh',
    backgroundColor: '#ffffff',
    borderRight: `1px solid ${theme.colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: isMobile ? 'fixed' : 'sticky',
    top: 0,
    left: 0,
    zIndex: isMobile ? 1000 : 50,
    boxShadow: isMobile ? theme.shadows.xl : 'none',
    transition: 'transform 0.25s ease',
    transform: isMobile && !isOpen ? 'translateX(-100%)' : 'translateX(0)',
  };

  return (
    <aside style={sidebarStyle} aria-label="Sidebar Navigation">
      {/* Top Brand Header */}
      <div>
        <div
          style={{
            height: `${theme.layout.headerHeight}px`,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${theme.colors.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: theme.radii.md,
                backgroundColor: theme.colors.primary,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: theme.typography.weights.black,
                fontSize: '16px',
                boxShadow: theme.shadows.sm,
              }}
            >
              R
            </div>
            <div>
              <div
                style={{
                  fontSize: theme.typography.sizes.md,
                  fontWeight: theme.typography.weights.black,
                  color: theme.colors.textPrimary,
                  letterSpacing: '-0.02em',
                }}
              >
                REVORA
              </div>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: theme.typography.weights.medium,
                  color: theme.colors.textMuted,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                }}
              >
                Store Ratings
              </div>
            </div>
          </div>

          {isMobile && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Sidebar"
              style={{
                background: 'none',
                border: 'none',
                color: theme.colors.textSecondary,
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: theme.typography.weights.semibold,
              color: theme.colors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Menu
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => isMobile && onClose && onClose()}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: theme.radii.md,
                fontSize: theme.typography.sizes.sm,
                fontWeight: isActive
                  ? theme.typography.weights.semibold
                  : theme.typography.weights.medium,
                textDecoration: 'none',
                color: isActive ? theme.colors.primary : theme.colors.textSecondary,
                backgroundColor: isActive ? theme.colors.primaryLight : 'transparent',
                transition: theme.transitions.fast,
              })}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div
            style={{
              margin: '16px 0 8px 0',
              borderTop: `1px solid ${theme.colors.border}`,
              paddingTop: '12px',
              paddingLeft: '12px',
              fontSize: '11px',
              fontWeight: theme.typography.weights.semibold,
              color: theme.colors.textMuted,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Account
          </div>

          <NavLink
            to="/account/password"
            onClick={() => isMobile && onClose && onClose()}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: theme.radii.md,
              fontSize: theme.typography.sizes.sm,
              fontWeight: isActive
                ? theme.typography.weights.semibold
                : theme.typography.weights.medium,
              textDecoration: 'none',
              color: isActive ? theme.colors.primary : theme.colors.textSecondary,
              backgroundColor: isActive ? theme.colors.primaryLight : 'transparent',
              transition: theme.transitions.fast,
            })}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Change Password</span>
          </NavLink>
        </nav>
      </div>

      {/* Bottom User Profile Section */}
      <div
        style={{
          padding: '16px',
          borderTop: `1px solid ${theme.colors.border}`,
          backgroundColor: theme.colors.surfaceSubtle,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: theme.colors.primary,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: theme.typography.weights.bold,
              fontSize: '13px',
              flexShrink: 0,
            }}
          >
            {getInitials(user?.name)}
          </div>

          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div
              style={{
                fontSize: theme.typography.sizes.sm,
                fontWeight: theme.typography.weights.semibold,
                color: theme.colors.textPrimary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={user?.name}
            >
              {user?.name || 'Account'}
            </div>
            <div style={{ marginTop: '2px' }}>
              <RoleBadge role={role} size="sm" />
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => logout()}
          style={{
            width: '100%',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.radii.md,
            fontSize: theme.typography.sizes.sm,
            fontWeight: theme.typography.weights.medium,
            color: theme.colors.danger,
            cursor: 'pointer',
            transition: theme.transitions.fast,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.colors.dangerLight)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
