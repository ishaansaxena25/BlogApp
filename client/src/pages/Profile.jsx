import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile, changePassword } from '../api';
import BlogCard from '../components/BlogCard';
import { User, Mail, Lock, Settings, KeyRound, BookOpen, Upload, X, Loader2, Sparkles } from 'lucide-react';

export default function Profile() {
  const queryClient = useQueryClient();

  // Fetch profile details
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['user'],
    queryFn: getProfile,
  });

  const user = data?.user;
  const authoredBlogs = data?.blogs || [];

  // Edit Profile Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Change Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Pre-fill profile form when data loads
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      if (user.profileImageURL) {
        const server = import.meta.env.VITE_API_URL || '';
        setPreviewUrl(user.profileImageURL.startsWith('http') ? user.profileImageURL : `${server}${user.profileImageURL}`);
      }
    }
  }, [user]);

  // Clean up ObjectURL preview
  useEffect(() => {
    return () => {
      if (profileImage && previewUrl && !previewUrl.includes('/profile/') && !previewUrl.includes('/default.png')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [profileImage, previewUrl]);

  // Profile Update Mutation
  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      setProfileError(null);
      setProfileSuccess(true);
      queryClient.setQueryData(['user'], { user: data.user, blogs: authoredBlogs });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setTimeout(() => setProfileSuccess(false), 4000);
    },
    onError: (err) => {
      setProfileError(err);
      setProfileSuccess(false);
    },
  });

  // Password Change Mutation
  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      setPasswordError(null);
      setPasswordSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 4000);
    },
    onError: (err) => {
      setPasswordError(err);
      setPasswordSuccess(false);
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
    const server = import.meta.env.VITE_API_URL || '';
    setPreviewUrl(user?.profileImageURL ? `${server}${user.profileImageURL}` : `${server}/default.png`);
    const fileInput = document.getElementById('editProfileImage');
    if (fileInput) fileInput.value = '';
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    profileMutation.mutate(formData);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;

    if (newPassword !== confirmPassword) {
      setPasswordError({ message: 'New passwords do not match' });
      return;
    }

    passwordMutation.mutate({ oldPassword, newPassword });
  };

  const getProfileFieldError = (fieldName) => {
    if (!profileError?.errors) return null;
    return profileError.errors.find((err) => err.path === fieldName)?.msg;
  };

  const getPasswordFieldError = (fieldName) => {
    if (!passwordError?.errors) return null;
    return passwordError.errors.find((err) => err.path === fieldName)?.msg;
  };

  const getAvatarUrl = (path) => {
    const server = import.meta.env.VITE_API_URL || '';
    if (!path) return `${server}/default.png`;
    if (path.startsWith('http')) return path;
    return `${server}${path}`;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-350">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-4" />
        <p className="text-slate-400 font-medium">Loading profile...</p>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-xl text-red-200">
          {error?.message || 'Profile could not be retrieved.'}
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Profile Overview Card */}
      <section className="glass-card p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 border-slate-900/60 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-brand-550/10 rounded-full blur-3xl pointer-events-none" />
        <img
          src={getAvatarUrl(user.profileImageURL)}
          alt={user.fullName}
          className="w-24 h-24 rounded-full object-cover border-4 border-slate-800 shadow-xl shadow-brand-500/5"
        />
        <div className="text-center md:text-left space-y-2">
          <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-brand-600/20 border border-brand-500/25 text-brand-400 rounded-full text-xs font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>{user.role}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{user.fullName}</h1>
          <p className="text-slate-450 flex items-center justify-center md:justify-start space-x-1.5 text-sm">
            <Mail className="w-4 h-4" />
            <span>{user.email}</span>
          </p>
        </div>
      </section>

      {/* Forms Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Edit Profile Form */}
        <div className="glass-card p-6 sm:p-8 border-slate-900/60 flex flex-col space-y-6">
          <div className="flex items-center space-x-2 text-lg font-bold text-white border-b border-slate-900 pb-3">
            <Settings className="w-5 h-5 text-brand-400" />
            <span>Account Settings</span>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {profileSuccess && (
              <div className="p-3 bg-emerald-950/30 border border-emerald-900/40 text-emerald-305 rounded-lg text-xs font-semibold">
                Profile updated successfully!
              </div>
            )}
            {profileError && !profileError.errors && profileError.message && (
              <div className="p-3 bg-red-950/40 border border-red-900/50 text-red-200 rounded-lg text-xs">
                {profileError.message}
              </div>
            )}

            {/* Avatar Select Preview inside setting */}
            <div className="flex items-center space-x-4 pb-2">
              <div className="relative">
                <img
                  src={previewUrl || `${import.meta.env.VITE_API_URL || ''}/default.png`}
                  alt="Avatar preview"
                  className="w-16 h-16 rounded-full object-cover border border-slate-800"
                />
                {profileImage && (
                  <button
                    type="button"
                    onClick={removeProfileImage}
                    className="absolute -top-1 -right-1 p-1 bg-slate-950 border border-slate-800 rounded-full text-slate-400 hover:text-white cursor-pointer shadow-md"
                    title="Remove Photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div>
                <label
                  htmlFor="editProfileImage"
                  className="inline-flex items-center space-x-1.5 border border-slate-850 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/80 text-slate-200 px-3.5 py-1.8 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-400" />
                  <span>Choose Photo</span>
                </label>
                <input
                  type="file"
                  id="editProfileImage"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileChange}
                  disabled={profileMutation.isPending}
                  className="hidden"
                />
                <p className="text-[10px] text-slate-500 mt-1">PNG, JPG, or WebP up to 5MB</p>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="editFullName" className="block text-xs font-semibold text-slate-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="editFullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={profileMutation.isPending}
                  className={`glass-input !pl-11 pr-4 text-sm py-2 ${
                    getProfileFieldError('fullName') ? 'border-red-500/60' : ''
                  }`}
                />
              </div>
              {getProfileFieldError('fullName') && (
                <p className="mt-1 text-[11px] text-red-400 font-medium">{getProfileFieldError('fullName')}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="editEmail" className="block text-xs font-semibold text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="editEmail"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={profileMutation.isPending}
                  className={`glass-input !pl-11 pr-4 text-sm py-2 ${
                    getProfileFieldError('email') ? 'border-red-505/60' : ''
                  }`}
                />
              </div>
              {getProfileFieldError('email') && (
                <p className="mt-1 text-[11px] text-red-400 font-medium">{getProfileFieldError('email')}</p>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={profileMutation.isPending || !fullName.trim() || !email.trim()}
                className="glass-button text-xs py-2 px-4 flex items-center space-x-1.5 cursor-pointer"
              >
                {profileMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="glass-card p-6 sm:p-8 border-slate-900/60 flex flex-col space-y-6">
          <div className="flex items-center space-x-2 text-lg font-bold text-white border-b border-slate-900 pb-3">
            <KeyRound className="w-5 h-5 text-brand-400" />
            <span>Change Password</span>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {passwordSuccess && (
              <div className="p-3 bg-emerald-950/30 border border-emerald-900/40 text-emerald-305 rounded-lg text-xs font-semibold">
                Password updated successfully!
              </div>
            )}
            {passwordError && !passwordError.errors && passwordError.message && (
              <div className="p-3 bg-red-950/40 border border-red-900/50 text-red-200 rounded-lg text-xs">
                {passwordError.message || passwordError.error}
              </div>
            )}

            {/* Old Password */}
            <div>
              <label htmlFor="oldPassword" className="block text-xs font-semibold text-slate-400 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="oldPassword"
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  disabled={passwordMutation.isPending}
                  className={`glass-input !pl-11 pr-4 text-sm py-2 ${
                    getPasswordFieldError('oldPassword') ? 'border-red-500/60' : ''
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {getPasswordFieldError('oldPassword') && (
                <p className="mt-1 text-[11px] text-red-400 font-medium">{getPasswordFieldError('oldPassword')}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-xs font-semibold text-slate-400 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={passwordMutation.isPending}
                  className={`glass-input !pl-11 pr-4 text-sm py-2 ${
                    getPasswordFieldError('newPassword') ? 'border-red-500/60' : ''
                  }`}
                  placeholder="At least 8 characters"
                />
              </div>
              {getPasswordFieldError('newPassword') && (
                <p className="mt-1 text-[11px] text-red-400 font-medium">{getPasswordFieldError('newPassword')}</p>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-400 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={passwordMutation.isPending}
                  className="glass-input !pl-11 pr-4 text-sm py-2"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={passwordMutation.isPending || !oldPassword || !newPassword || !confirmPassword}
                className="glass-button text-xs py-2 px-4 flex items-center space-x-1.5 cursor-pointer"
              >
                {passwordMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>Change Password</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Authored Blogs Grid Section */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2 text-lg font-bold text-white border-b border-slate-900 pb-3">
          <BookOpen className="w-5 h-5 text-brand-400" />
          <span>Your Stories ({authoredBlogs.length})</span>
        </div>

        {authoredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {authoredBlogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-card p-8 border border-slate-900 max-w-lg mx-auto space-y-3">
            <p className="text-slate-400 font-medium">You haven't written any stories yet.</p>
            <p className="text-xs text-slate-500">Your published articles will show up here.</p>
          </div>
        )}
      </section>
    </main>
  );
}
