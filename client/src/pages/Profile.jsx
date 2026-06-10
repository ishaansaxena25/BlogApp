import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { changePassword, getProfile, updateProfile } from '../api';
import BlogCard from '../components/BlogCard';
import { BookOpen, ExternalLink, Loader2, Upload } from 'lucide-react';
import { ProfileSkeleton } from '../components/skeletons';

const optionalUrl = z.union([z.literal(''), z.url('Enter a complete URL including https://')]);
const profileSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required'),
  email: z.email('Enter a valid email'),
  bio: z.string().max(500).optional(),
  github: optionalUrl,
  linkedin: optionalUrl,
  twitter: optionalUrl,
  website: optionalUrl,
});

const passwordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Use at least 8 characters'),
  confirmPassword: z.string(),
}).refine((values) => values.newPassword === values.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
});

function Field({ label, error, ...props }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-400">{label}</span>
      <input className="glass-input text-sm" {...props} />
      {error && <span className="text-xs text-red-400">{error.message}</span>}
    </label>
  );
}

export default function Profile() {
  const queryClient = useQueryClient();
  const [profileImage, setProfileImage] = useState(null);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['user'],
    queryFn: getProfile,
  });
  const user = data?.user;
  const blogs = data?.blogs || [];
  const publishedBlogs = blogs.filter((blog) => blog.status !== 'DRAFT');
  const draftBlogs = blogs.filter((blog) => blog.status === 'DRAFT');

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      email: '',
      bio: '',
      github: '',
      linkedin: '',
      twitter: '',
      website: '',
    },
  });
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { oldPassword: '', newPassword: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        fullName: user.fullName || '',
        email: user.email || '',
        bio: user.bio || '',
        github: user.github || '',
        linkedin: user.linkedin || '',
        twitter: user.twitter || '',
        website: user.website || '',
      });
    }
  }, [user, profileForm]);

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user'] }),
  });
  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => passwordForm.reset(),
  });

  const submitProfile = profileForm.handleSubmit((values) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.append(key, value || ''));
    if (profileImage) formData.append('profileImage', profileImage);
    profileMutation.mutate(formData);
  });

  if (isLoading) {
    return <ProfileSkeleton />;
  }
  if (isError || !user) {
    return <div className="py-16 text-center text-red-300">Profile could not be loaded.</div>;
  }

  const imageUrl = user.profileImageURL?.startsWith('http')
    ? user.profileImageURL
    : `${import.meta.env.VITE_API_URL || ''}${user.profileImageURL || '/default.png'}`;
  const socialLinks = ['github', 'linkedin', 'twitter', 'website'].filter((key) => user[key]);

  return (
    <main className="max-w-7xl mx-auto py-10 space-y-12">
      <section className="glass-card p-6 sm:p-8 flex flex-col sm:flex-row gap-6">
        <img src={imageUrl} alt={user.fullName} className="w-28 h-28 rounded-full object-cover border border-slate-700" />
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-white">{user.fullName}</h1>
          <p className="text-slate-400">{user.bio || 'Tell readers a little about yourself.'}</p>
          <div className="flex flex-wrap gap-3">
            {socialLinks.map((key) => (
              <a key={key} href={user[key]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-brand-400">
                {key}<ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={submitProfile} className="glass-card p-6 space-y-4">
          <h2 className="text-lg font-bold">Edit profile</h2>
          <Field label="Full name" error={profileForm.formState.errors.fullName} {...profileForm.register('fullName')} />
          <Field label="Email" type="email" error={profileForm.formState.errors.email} {...profileForm.register('email')} />
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-400">Bio</span>
            <textarea className="glass-input min-h-28" {...profileForm.register('bio')} />
          </label>
          {['github', 'linkedin', 'twitter', 'website'].map((field) => (
            <Field key={field} label={field} error={profileForm.formState.errors[field]} {...profileForm.register(field)} />
          ))}
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <Upload className="w-4 h-4" /> Change profile image
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => setProfileImage(event.target.files?.[0] || null)} />
          </label>
          <button disabled={profileMutation.isPending} className="glass-button">Save profile</button>
        </form>

        <form
          onSubmit={passwordForm.handleSubmit(({ oldPassword, newPassword }) => passwordMutation.mutate({ oldPassword, newPassword }))}
          className="glass-card p-6 space-y-4 self-start"
        >
          <h2 className="text-lg font-bold">Change password</h2>
          <Field label="Current password" type="password" error={passwordForm.formState.errors.oldPassword} {...passwordForm.register('oldPassword')} />
          <Field label="New password" type="password" error={passwordForm.formState.errors.newPassword} {...passwordForm.register('newPassword')} />
          <Field label="Confirm password" type="password" error={passwordForm.formState.errors.confirmPassword} {...passwordForm.register('confirmPassword')} />
          <button disabled={passwordMutation.isPending} className="glass-button">Change password</button>
        </form>
      </section>

      {[
        ['Published stories', publishedBlogs],
        ['Drafts', draftBlogs],
      ].map(([title, items]) => (
        <section key={title} className="space-y-6">
          <h2 className="flex items-center gap-2 text-lg font-bold border-b border-slate-900 pb-3">
            <BookOpen className="w-5 h-5 text-brand-400" /> {title} ({items.length})
          </h2>
          {items.length ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
            </div>
          ) : <p className="text-sm text-slate-500">Nothing here yet.</p>}
        </section>
      ))}
    </main>
  );
}
