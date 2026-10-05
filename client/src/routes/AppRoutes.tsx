import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../utils/constants';

// Layout & Route Guards
import Layout from '../components/Layout/Layout';
import ProtectedRoute from './ProtectedRoute';
import RoleProtectedRoute from './RoleProtectedRoute';
import LoadingState from '../components/LoadingState/LoadingState';

// Pages
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminUsers from '../pages/admin/Users';
import AdminStores from '../pages/admin/Stores';
import Stores from '../pages/user/Stores';
import OwnerDashboard from '../pages/owner/Dashboard';
import ChangePassword from '../pages/account/ChangePassword';
import NotFound from '../pages/NotFound';

// Root URL dynamic dispatcher according to role
const RootRedirect: React.FC = () => {
  const { user, role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingState label="Initializing Revora..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  switch (role) {
    case ROLES.SYSTEM_ADMIN:
      return <Navigate to="/admin/dashboard" replace />;
    case ROLES.STORE_OWNER:
      return <Navigate to="/owner/dashboard" replace />;
    case ROLES.NORMAL_USER:
    default:
      return <Navigate to="/stores" replace />;
  }
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root Entry Point */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Authenticated Application Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          {/* System Administrator Routes */}
          <Route element={<RoleProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/stores" element={<AdminStores />} />
          </Route>

          {/* Normal Customer Store Discovery & Rating Routes */}
          <Route element={<RoleProtectedRoute allowedRoles={[ROLES.NORMAL_USER]} />}>
            <Route path="/stores" element={<Stores />} />
          </Route>

          {/* Merchant Store Owner Routes */}
          <Route element={<RoleProtectedRoute allowedRoles={[ROLES.STORE_OWNER]} />}>
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
          </Route>

          {/* Shared Authenticated Account Security */}
          <Route path="/account/password" element={<ChangePassword />} />
        </Route>
      </Route>

      {/* 404 Catch All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
