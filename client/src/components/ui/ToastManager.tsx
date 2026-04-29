import React, { useEffect, useState } from 'react';

type ToastItem = { id: string; message: string; variant?: 'default' | 'success' | 'error'; action?: { label: string; onClick: () => void } };

export const ToastManager: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const seen = new Set<string>();

    // SSE for real-time notifications
    const token = localStorage.getItem('kwachawise_token');
    const apiBase = import.meta.env.VITE_API_BASE_URL ?? `${window.location.protocol}//${window.location.hostname}:4000/api`;
    let es: EventSource | null = null;
    try {
      const url = `${apiBase}/notifications/stream${token ? `?token=${encodeURIComponent(token)}` : ''}`;
      es = new EventSource(url);
      es.addEventListener('notification', (ev: any) => {
        try {
          const data = JSON.parse((ev as MessageEvent).data);
          if (seen.has(data.id)) return;
          seen.add(data.id);
          const id = `n-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
          setToasts((t) => [...t, { id, message: data.title, variant: 'default', action: { label: 'Open', onClick: () => window.location.assign('/notifications') } }]);
        } catch (err) {
          // ignore
        }
      });
    } catch (err) {
      // ignore SSE errors
    }
    const onFail = (e: Event) => {
      // show toast with retry
      const detail = (e as CustomEvent<{ tempId?: string; error?: string }>).detail || {};
      const { tempId, error } = detail;
      const id = `t-${Date.now()}`;
      const retry = () => window.dispatchEvent(new CustomEvent('retry-transaction', { detail: { tempId, source: 'toast' } }));
      setToasts((t) => [...t, { id, message: error || 'Failed to save', variant: 'error', action: { label: 'Retry', onClick: retry } }]);
    };

    const onRecurringFail = (e: Event) => {
      const detail = (e as CustomEvent<{ error?: string }>).detail || {};
      const id = `rfail-${Date.now()}`;
      setToasts((t) => [...t, { id, message: detail.error || 'Failed to create recurring schedule', variant: 'error' }]);
    };

    window.addEventListener('transaction:create_failed', onFail as EventListener);
    window.addEventListener('recurring:create_failed', onRecurringFail as EventListener);
    return () => {
      window.removeEventListener('transaction:create_failed', onFail as EventListener);
      window.removeEventListener('recurring:create_failed', onRecurringFail as EventListener);
      if (es) es.close();
    };
  }, []);

  useEffect(() => {
    if (!toasts.length) return;
    const t = setTimeout(() => setToasts((s) => s.slice(1)), 4000);
    return () => clearTimeout(t);
  }, [toasts]);

  return (
    <div className="fixed bottom-6 left-1/2 z-60 flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((toast) => (
        <div key={toast.id} className="flex items-center gap-3 rounded-md bg-[var(--color-surface)] px-4 py-3 shadow-lg border" style={{ borderColor: 'var(--color-border)' }}>
          <div className="text-sm text-[var(--color-text)]">{toast.message}</div>
          {toast.action ? (
            <button
              className="ml-2 rounded bg-[var(--color-primary)] px-3 py-1 text-xs text-white"
              onClick={() => {
                toast.action?.onClick();
                setToasts((s) => s.filter((x) => x.id !== toast.id));
              }}
            >
              {toast.action.label}
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default ToastManager;
