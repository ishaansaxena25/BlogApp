import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { register as registerRequest } from '../api';
import useAuth from '../hooks/useAuth';

const schema = z.object({
  fullName: z.string().trim().min(1, 'Full name is required'),
  email: z.email('Enter a valid email'),
  password: z.string().min(8, 'Use at least 8 characters'),
});

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [profileImage, setProfileImage] = useState(null);
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { fullName: '', email: '', password: '' } });
  const mutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: (data) => {
      login(data);
      navigate('/', { replace: true });
    },
  });

  const submit = form.handleSubmit((values) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => formData.append(key, value));
    if (profileImage) formData.append('profileImage', profileImage);
    mutation.mutate(formData);
  });

  return (
    <main className="min-h-[80vh] flex items-center justify-center py-12">
      <form onSubmit={submit} className="glass-card w-full max-w-md p-8 space-y-5">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold">Join BlogBubble</h1>
          <p className="mt-2 text-sm text-slate-400">Already registered? <Link to="/login" className="text-brand-400">Sign in</Link></p>
        </div>
        {mutation.error && <p className="rounded-lg bg-red-950/40 p-3 text-sm text-red-300">{mutation.error.message}</p>}
        {[
          ['fullName', 'Full name', 'text'],
          ['email', 'Email', 'email'],
          ['password', 'Password', 'password'],
        ].map(([name, label, type]) => (
          <label key={name} className="block space-y-2">
            <span className="text-sm font-semibold">{label}</span>
            <input type={type} className="glass-input" {...form.register(name)} />
            {form.formState.errors[name] && <span className="text-xs text-red-400">{form.formState.errors[name].message}</span>}
          </label>
        ))}
        <label className="block text-sm text-slate-400">
          Optional profile image
          <input type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm" onChange={(event) => setProfileImage(event.target.files?.[0] || null)} />
        </label>
        <button disabled={mutation.isPending} className="glass-button w-full">{mutation.isPending ? 'Creating account...' : 'Create account'}</button>
      </form>
    </main>
  );
}
