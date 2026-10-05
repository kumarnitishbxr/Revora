// ============================================================================
// REVORA DESIGN SYSTEM — STRIPE / VERCEL / LINEAR TIER DESIGN TOKENS
// Pure CSS & Static Style Constants (Zero External CSS Dependencies)
// ============================================================================

export const theme = {
  colors: {
    // Primary brand palette (Stripe / Indigo vibe)
    primary: '#4f46e5',
    primaryHover: '#4338ca',
    primaryActive: '#3730a3',
    primaryLight: '#eef2ff',
    primaryBorder: '#c7d2fe',

    // Canvas & Surface
    bg: '#f5f6fa',
    surface: '#ffffff',
    surfaceSubtle: '#f9fafb',
    surfaceHover: '#f3f4f6',
    surfaceActive: '#e5e7eb',

    // Text & Content (Dark Neutrals)
    textPrimary: '#111827',
    textSecondary: '#4b5563',
    textTertiary: '#6b7280',
    textMuted: '#9ca3af',
    textInverse: '#ffffff',

    // Borders & Dividers
    border: '#e5e7eb',
    borderStrong: '#d1d5db',
    borderFocus: '#4f46e5',

    // Feedback & System States
    success: '#10b981',
    successLight: '#ecfdf5',
    successBorder: '#a7f3d0',
    successText: '#065f46',

    danger: '#ef4444',
    dangerLight: '#fef2f2',
    dangerBorder: '#fecaca',
    dangerText: '#991b1b',

    warning: '#f59e0b',
    warningLight: '#fffbeb',
    warningBorder: '#fde68a',
    warningText: '#92400e',

    info: '#3b82f6',
    infoLight: '#eff6ff',
    infoBorder: '#bfdbfe',
    infoText: '#1e40af',

    // Star rating palette
    star: '#f59e0b',
    starEmpty: '#d1d5db',

    // Role-specific badges
    roles: {
      SYSTEM_ADMIN: {
        bg: '#fef2f2',
        border: '#fecaca',
        text: '#b91c1c',
      },
      STORE_OWNER: {
        bg: '#ecfdf5',
        border: '#a7f3d0',
        text: '#047857',
      },
      NORMAL_USER: {
        bg: '#eff6ff',
        border: '#bfdbfe',
        text: '#1d4ed8',
      },
    },
  },

  typography: {
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    monoFontFamily:
      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
    sizes: {
      xs: '11px',
      sm: '13px',
      base: '14px',
      md: '15px',
      lg: '17px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 800,
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625,
    },
  },

  radii: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
    focus: '0 0 0 3px rgba(79, 70, 229, 0.25)',
  },

  transitions: {
    fast: 'all 0.15s ease',
    normal: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  layout: {
    sidebarWidth: 260,
    sidebarCollapsedWidth: 72,
    headerHeight: 64,
    maxContentWidth: 1200,
  },
} as const;

export type Theme = typeof theme;
