import { useEffect, useRef } from 'react';

export default function ConfirmDialog({ open, title, description, onConfirm, onCancel, pending = false }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/80 p-4" role="presentation">
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="glass-card w-full max-w-md p-6">
        <h2 id="confirm-title" className="text-xl font-bold">{title}</h2>
        <p className="mt-2 text-sm text-slate-400">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button ref={cancelRef} type="button" onClick={onCancel} className="rounded-lg border border-slate-700 px-4 py-2">Cancel</button>
          <button type="button" disabled={pending} onClick={onConfirm} className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white disabled:opacity-50">
            {pending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
