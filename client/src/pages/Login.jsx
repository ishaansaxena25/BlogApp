import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { login as loginRequest } from '../api';
import useAuth from '../hooks/useAuth';

const schema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });
  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      login(data);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    },
  });

  return (
    <main className="min-h-[80vh] flex items-center justify-center">
      <form onSubmit={form.handleSubmit((values) => mutation.mutate(values))} className="glass-card w-full max-w-md p-8 space-y-5">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-400">New here? <Link to="/register" className="text-brand-400">Create an account</Link></p>
        </div>
        {mutation.error && <p className="rounded-lg bg-red-950/40 p-3 text-sm text-red-300">{mutation.error.message}</p>}
        <label className="block space-y-2">
          <span className="text-sm font-semibold">Email</span>
          <input type="email" autoComplete="email" className="glass-input" {...form.register('email')} />
          {form.formState.errors.email && <span className="text-xs text-red-400">{form.formState.errors.email.message}</span>}
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-semibold">Password</span>
          <input type="password" autoComplete="current-password" className="glass-input" {...form.register('password')} />
          {form.formState.errors.password && <span className="text-xs text-red-400">{form.formState.errors.password.message}</span>}
        </label>
        <button disabled={mutation.isPending} className="glass-button w-full">{mutation.isPending ? 'Signing in...' : 'Sign in'}</button>
      </form>
    </main>
  );
}
