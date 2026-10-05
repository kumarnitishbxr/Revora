// ============================================================================
// REVORA CONSTANTS & ROUTE DEFINITIONS
// ============================================================================

export const ROLES = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  STORE_OWNER: 'STORE_OWNER',
  NORMAL_USER: 'NORMAL_USER',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  SYSTEM_ADMIN: 'Administrator',
  STORE_OWNER: 'Store Owner',
  NORMAL_USER: 'User',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  STORES: '/stores',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_STORES: '/admin/stores',
  OWNER_DASHBOARD: '/owner/dashboard',
  ACCOUNT_PASSWORD: '/account/password',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'revora_access_token',
  AUTH_USER: 'revora_auth_user',
} as const;

export const DEFAULT_PAGE_SIZE = 10;
