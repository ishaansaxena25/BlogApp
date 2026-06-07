import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../api';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const location = useLocation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['user'],
    queryFn: getProfile,
    retry: false,
    staleTime: 1000 * 60 * 5, // keep profile fresh but don't hit /me continuously
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-350">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-4" />
        <p className="text-slate-400 font-medium animate-pulse">Verifying credentials...</p>
      </div>
    );
  }

  // If there's an error or no user structure returned, we redirect to login
  if (isError || !data?.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
