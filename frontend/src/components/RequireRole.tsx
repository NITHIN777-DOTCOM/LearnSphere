import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import type { Role } from '../types/index.js';

// Sends users back to their overview if their role can't open this page.
// The backend enforces the same rules; this just stops broken pages loading.
export const RequireRole: React.FC<{ roles: Role[] }> = ({ roles }) => {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
