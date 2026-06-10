import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { AuthSkeleton } from './skeletons';

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <AuthSkeleton />;
  }

  // If there's an error or no user structure returned, we redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
