import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { Role } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullPage label="Authenticating session..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to their respective authorized dashboard
    switch (role) {
      case 'SYSTEM_ADMIN':
        return <Navigate to="/admin/dashboard" replace />;
      case 'STORE_OWNER':
        return <Navigate to="/owner/dashboard" replace />;
      case 'NORMAL_USER':
      default:
        return <Navigate to="/user/dashboard" replace />;
    }
  }

  return <Outlet />;
};
