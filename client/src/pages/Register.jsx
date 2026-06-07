import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { register } from '../api';
import { Mail, Lock, User, UserPlus, Loader2, Sparkles, Upload, X } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [registerError, setRegisterError] = useState(null);

  // Clean up ObjectURL preview on unmount
  useEffect(() => {
    return () => {
      if (profileImage) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [profileImage, previewUrl]);

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      setRegisterError(null);
      // Update cached user data
      queryClient.setQueryData(['user'], { user: data.user, blogs: [] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      // Redirect
      navigate('/', { replace: true });
    },
    onError: (err) => {
      setRegisterError(err);
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeProfileImage = () => {
    setProfileImage(null);
    setPreviewUrl('');
    // Reset file input element
    const fileInput = document.getElementById('profileImage');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) return;

    // Use FormData for multipart/form-data
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('password', password);
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    registerMutation.mutate(formData);
  };

  // Helper to extract field-specific error messages
  const getFieldError = (fieldName) => {
    if (!registerError?.errors) return null;
    return registerError.errors.find((err) => err.path === fieldName)?.msg;
  };

  const nameError = getFieldError('fullName');
  const emailError = getFieldError('email');
  const passwordError = getFieldError('password');

  return (
    <main className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-3">
        {/* Brand Banner */}
        <div className="flex justify-center">
          <div className="inline-flex items-center space-x-1 px-3 py-1 bg-brand-600/10 border border-brand-500/20 text-brand-400 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join our community</span>
          </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-white font-sans">
          Create your account
        </h2>
        <p className="text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300 hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-card py-8 px-4 sm:px-10 border border-slate-900/60 shadow-2xl">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* General Failure message */}
            {registerError && !registerError.errors && registerError.message && (
              <div className="p-3.5 bg-red-950/40 border border-red-900/50 text-red-200 rounded-lg text-sm font-medium">
                {registerError.message}
              </div>
            )}

            {/* Profile Image Upload */}
            <div className="flex flex-col items-center space-y-3 pb-2">
              <span className="text-sm font-semibold text-slate-350">Profile Picture</span>
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Avatar preview"
                    className="profile-avatar-preview"
                  />
                  <button
                    type="button"
                    onClick={removeProfileImage}
                    className="absolute -top-1.5 -right-1.5 p-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-full text-slate-400 hover:text-white cursor-pointer shadow-md"
                    title="Remove Photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="profileImage"
                  className="flex flex-col items-center justify-center w-24 h-24 rounded-full border-2 border-dashed border-slate-800 hover:border-brand-500/60 hover:bg-brand-500/5 cursor-pointer transition-all duration-200"
                >
                  <Upload className="w-5 h-5 text-slate-550 mb-1" />
                  <span className="text-[10px] font-medium text-slate-400">Upload</span>
                  <input
                    type="file"
                    id="profileImage"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileChange}
                    disabled={registerMutation.isPending}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-slate-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={registerMutation.isPending}
                  className={`glass-input !pl-11 pr-4 text-sm ${
                    nameError ? 'border-red-500/60 focus:border-red-505 focus:ring-red-505' : ''
                  }`}
                  placeholder="John Doe"
                />
              </div>
              {nameError && (
                <p className="mt-1.5 text-xs text-red-400 font-medium">{nameError}</p>
              )}
            </div>

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
                  disabled={registerMutation.isPending}
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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={registerMutation.isPending}
                  className={`glass-input !pl-11 pr-4 text-sm ${
                    passwordError ? 'border-red-500/60 focus:border-red-505 focus:ring-red-505' : ''
                  }`}
                  placeholder="At least 8 characters"
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
                disabled={registerMutation.isPending || !fullName.trim() || !email.trim() || !password.trim()}
                className="w-full glass-button flex items-center justify-center space-x-2 py-3 cursor-pointer"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4.5 h-4.5" />
                    <span>Create Account</span>
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
