import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import useAuth from '../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-350">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-4" />
        <p className="text-slate-400 font-medium animate-pulse">Verifying credentials...</p>
      </div>
    );
  }

  // If there's an error or no user structure returned, we redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
