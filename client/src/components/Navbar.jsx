import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, logout } from '../api';
import { Feather, Bookmark, User, LogOut, Menu, X, LogIn, UserPlus } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch the logged-in user profile
  const { data } = useQuery({
    queryKey: ['user'],
    queryFn: getProfile,
    retry: false,
    staleTime: 1000 * 60 * 5, // don't refetch on every render
  });

  const currentUser = data?.user;

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
      queryClient.invalidateQueries();
      navigate('/login');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
    setMobileMenuOpen(false);
  };

  // Helper to resolve avatar image path
  const getAvatarUrl = (path) => {
    const server = import.meta.env.VITE_API_URL || '';
    if (!path) return `${server}/default.png`;
    if (path.startsWith('http')) return path;
    return `${server}${path}`;
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-xl font-bold tracking-tight text-white hover:text-brand-400 transition-colors">
          <div className="bg-brand-600/20 p-2 rounded-lg border border-brand-500/30">
            <Feather className="w-5 h-5 text-brand-400" />
          </div>
          <span className="font-extrabold text-white text-xl tracking-tight">
            Blog<span className="text-brand-400">Bubble</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Home
          </Link>
          <Link to="/blogs" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Blogs
          </Link>

          {currentUser ? (
            <>
              <Link to="/bookmarks" className="flex items-center space-x-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                <Bookmark className="w-4 h-4" />
                <span>Bookmarks</span>
              </Link>
              <Link to="/blogs/new" className="flex items-center space-x-1.5 text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors">
                <Feather className="w-4 h-4" />
                <span>Write Post</span>
              </Link>
              <div className="w-px h-5 bg-slate-800" />
              <Link to="/profile" className="flex items-center space-x-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                <img
                  src={getAvatarUrl(currentUser.profileImageURL)}
                  alt={currentUser.fullName}
                  className="w-7 h-7 rounded-full object-cover border border-slate-700 hover:border-brand-500 transition-colors"
                />
                <span className="max-w-[120px] truncate">{currentUser.fullName}</span>
              </Link>
              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="flex items-center space-x-1 text-sm font-medium text-slate-400 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="flex items-center space-x-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
              <Link to="/register" className="flex items-center space-x-1.5 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-md shadow-brand-600/15">
                <UserPlus className="w-4 h-4" />
                <span>Get Started</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-slate-900/60 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-4 px-2 pb-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-300 hover:text-white py-1"
            >
              Home
            </Link>
            <Link
              to="/blogs"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-slate-300 hover:text-white py-1"
            >
              Blogs
            </Link>

            {currentUser ? (
              <>
                <Link
                  to="/bookmarks"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 text-base font-medium text-slate-300 hover:text-white py-1"
                >
                  <Bookmark className="w-5 h-5 text-slate-400" />
                  <span>Bookmarks</span>
                </Link>
                <Link
                  to="/blogs/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 text-base font-medium text-brand-400 hover:text-brand-300 py-1"
                >
                  <Feather className="w-5 h-5" />
                  <span>Write Post</span>
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 text-base font-medium text-slate-300 hover:text-white py-1"
                >
                  <img
                    src={getAvatarUrl(currentUser.profileImageURL)}
                    alt={currentUser.fullName}
                    className="w-6 h-6 rounded-full object-cover border border-slate-700"
                  />
                  <span>Profile ({currentUser.fullName})</span>
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="flex items-center space-x-2 text-base font-medium text-slate-400 hover:text-red-400 py-1 text-left w-full cursor-pointer disabled:opacity-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 text-base font-medium text-slate-300 hover:text-white py-1"
                >
                  <LogIn className="w-5 h-5 text-slate-400" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-base font-semibold text-center"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Get Started</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
