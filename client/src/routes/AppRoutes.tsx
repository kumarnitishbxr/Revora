import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks';
import { LoadingSpinner } from '../components/ui';

// Layouts
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Lazy-loaded Pages for optimal performance and chunk splitting
const LoginPage = lazy(() =>
  import('../pages/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('../pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const UserDashboardPage = lazy(() =>
  import('../pages/user/UserDashboardPage').then((m) => ({ default: m.UserDashboardPage }))
);
const AdminDashboardPage = lazy(() =>
  import('../pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const AdminStoresPage = lazy(() =>
  import('../pages/admin/AdminStoresPage').then((m) => ({ default: m.AdminStoresPage }))
);
const AdminUsersPage = lazy(() =>
  import('../pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage }))
);
const OwnerDashboardPage = lazy(() =>
  import('../pages/owner/OwnerDashboardPage').then((m) => ({ default: m.OwnerDashboardPage }))
);
const SettingsPage = lazy(() =>
  import('../pages/settings/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const NotFoundPage = lazy(() =>
  import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

const SuspenseLoader: React.FC = () => (
  <div className="py-20 flex justify-center items-center">
    <LoadingSpinner size="md" />
  </div>
);

const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullPage label="Initializing Revora..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'SYSTEM_ADMIN':
      return <Navigate to="/admin/dashboard" replace />;
    case 'STORE_OWNER':
      return <Navigate to="/owner/dashboard" replace />;
    case 'NORMAL_USER':
    default:
      return <Navigate to="/user/dashboard" replace />;
  }
};

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<SuspenseLoader />}>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/dashboard" element={<RootRedirect />} />

        {/* Public Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Authenticated Dashboard routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            {/* Normal User Dashboard */}
            <Route element={<ProtectedRoute allowedRoles={['NORMAL_USER']} />}>
              <Route path="/user/dashboard" element={<UserDashboardPage />} />
            </Route>

            {/* System Admin Dashboard */}
            <Route element={<ProtectedRoute allowedRoles={['SYSTEM_ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/stores" element={<AdminStoresPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
            </Route>

            {/* Store Owner Dashboard */}
            <Route element={<ProtectedRoute allowedRoles={['STORE_OWNER']} />}>
              <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
            </Route>

            {/* Common Authenticated Routes */}
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};
