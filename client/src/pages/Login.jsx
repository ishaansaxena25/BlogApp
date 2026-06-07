import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login } from '../api';
import { Mail, Lock, LogIn, Loader2, Sparkles } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);

  // Read redirect path if redirected by ProtectedRoute
  const from = location.state?.from?.pathname || '/';

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setLoginError(null);
      // Update cached user data
      queryClient.setQueryData(['user'], { user: data.user, blogs: [] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      // Redirect
      navigate(from, { replace: true });
    },
    onError: (err) => {
      // Set error returned by the server (e.g. incorrect password or validation failures)
      setLoginError(err);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    loginMutation.mutate({ email, password });
  };

  // Helper to extract field-specific error messages
  const getFieldError = (fieldName) => {
    if (!loginError?.errors) return null;
    return loginError.errors.find((err) => err.path === fieldName)?.msg;
  };

  const emailError = getFieldError('email');
  const passwordError = getFieldError('password');

  return (
    <main className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-3">
        {/* Brand Banner */}
        <div className="flex justify-center">
          <div className="inline-flex items-center space-x-1 px-3 py-1 bg-brand-600/10 border border-brand-500/20 text-brand-400 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome back</span>
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-white font-sans">
          Sign in to BlogBubble
        </h2>
        <p className="text-center text-sm text-slate-400">
          Or{' '}
          <Link to="/register" className="font-semibold text-brand-400 hover:text-brand-300 hover:underline">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-card py-8 px-4 sm:px-10 border border-slate-900/60 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* General Auth Failure message */}
            {loginError && !loginError.errors && loginError.message && (
              <div className="p-3.5 bg-red-950/40 border border-red-900/50 text-red-200 rounded-lg text-sm font-medium">
                {loginError.message}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loginMutation.isPending}
                  className={`glass-input !pl-11 pr-4 text-sm ${
                    emailError ? 'border-red-500/60 focus:border-red-505 focus:ring-red-505' : ''
                  }`}
                  placeholder="name@example.com"
                />
              </div>
              {emailError && (
                <p className="mt-1.5 text-xs text-red-400 font-medium">{emailError}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loginMutation.isPending}
                  className={`glass-input !pl-11 pr-4 text-sm ${
                    passwordError ? 'border-red-500/60 focus:border-red-505 focus:ring-red-505' : ''
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {passwordError && (
                <p className="mt-1.5 text-xs text-red-400 font-medium">{passwordError}</p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loginMutation.isPending || !email.trim() || !password.trim()}
                className="w-full glass-button flex items-center justify-center space-x-2 py-3 cursor-pointer"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4.5 h-4.5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
