import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

export interface RoleProtectedRouteProps {
  allowedRoles: Role[];
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ allowedRoles }) => {
  const { role } = useAuth();

  if (!role || !allowedRoles.includes(role)) {
    // Redirect to their respective authorized home route
    switch (role) {
      case 'SYSTEM_ADMIN':
        return <Navigate to="/admin/dashboard" replace />;
      case 'STORE_OWNER':
        return <Navigate to="/owner/dashboard" replace />;
      case 'NORMAL_USER':
      default:
        return <Navigate to="/stores" replace />;
    }
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
