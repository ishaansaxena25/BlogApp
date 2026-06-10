export default function ServerError({ onRetry }) {
  return (
    <main className="min-h-screen grid place-items-center bg-slate-950 p-6 text-center text-slate-100">
      <div>
        <p className="text-sm font-bold text-red-400">Something went wrong</p>
        <h1 className="mt-2 text-4xl font-extrabold">BlogBubble hit an unexpected error.</h1>
        <button onClick={onRetry} className="glass-button mt-6">Try again</button>
      </div>
    </main>
  );
}
