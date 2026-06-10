function Pulse({ className }) {
  return <div className={`animate-pulse rounded bg-slate-900 ${className}`} />;
}

export function BlogCardSkeleton() {
  return (
    <div className="glass-card overflow-hidden">
      <Pulse className="aspect-video w-full" />
      <div className="p-5 space-y-4">
        <Pulse className="h-4 w-1/3" />
        <Pulse className="h-7 w-4/5" />
        <Pulse className="h-4 w-full" />
        <Pulse className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function BlogDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto py-10 space-y-7">
      <Pulse className="aspect-[21/9] w-full rounded-2xl" />
      <Pulse className="h-12 w-4/5" />
      <Pulse className="h-5 w-1/2" />
      {Array.from({ length: 7 }, (_, index) => <Pulse key={index} className="h-4 w-full" />)}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-7xl mx-auto py-10 space-y-8">
      <Pulse className="h-44 w-full rounded-xl" />
      <div className="grid md:grid-cols-2 gap-8">
        <Pulse className="h-96" />
        <Pulse className="h-72" />
      </div>
    </div>
  );
}

export function AuthSkeleton() {
  return <div className="min-h-[60vh] grid place-items-center"><Pulse className="h-64 w-full max-w-md" /></div>;
}
