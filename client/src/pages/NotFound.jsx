import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="min-h-[70vh] grid place-items-center text-center">
      <div>
        <p className="text-sm font-bold text-brand-400">404</p>
        <h1 className="mt-2 text-4xl font-extrabold">Page not found</h1>
        <p className="mt-3 text-slate-400">The page may have moved or never existed.</p>
        <Link to="/" className="glass-button mt-6 inline-block">Back home</Link>
      </div>
    </main>
  );
}
