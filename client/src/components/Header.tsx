import { useAuth } from '../lib/auth';

interface HeaderProps {
  title: string;
  subtitle?: string;
  pendingSyncCount?: number;
}

export function Header({ title, subtitle, pendingSyncCount = 0 }: HeaderProps) {
  const { user } = useAuth();
  const isSyncing = pendingSyncCount > 0;

  return (
    <header className="sticky top-0 z-20 border-b border-brand-100/70 bg-[#0d1117]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#00c896]">KwachaWise</p>
          <h1 className="text-xl font-semibold text-[#e6edf3] md:text-[22px]">{title}</h1>
          {subtitle ? <p className="mt-1 text-xs text-[#8b949e]">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition ${
              isSyncing ? 'border-amber-500/30 bg-amber-500/10 text-amber-300' : 'border-emerald-500/20 bg-emerald-500/10 text-[#00c896]'
            }`}
            aria-live="polite"
            aria-label={isSyncing ? `${pendingSyncCount} changes syncing` : 'All changes synced'}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isSyncing ? 'bg-amber-400' : 'bg-[#00c896]'}`} />
            <span>{isSyncing ? `Syncing ${pendingSyncCount}` : 'Synced'}</span>
          </span>
          <button
            type="button"
            onClick={() => (window.location.href = '/notifications')}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#30363d] bg-[#161b22] text-[#8b949e] transition hover:border-[#00c896]/40 hover:text-[#e6edf3]"
            aria-label="Notifications"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 1a5.5 5.5 0 0 0-5.5 5.5v3L1 11h14l-1.5-1.5V6.5A5.5 5.5 0 0 0 8 1zM6.5 13a1.5 1.5 0 0 0 3 0" />
            </svg>
            {isSyncing ? <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-400" /> : null}
          </button>
          <span className="hidden rounded-full border border-[#30363d] bg-[#161b22] px-3 py-1 text-xs font-medium text-[#c9d1d9] md:inline-flex">{user?.email ?? ''}</span>
        </div>
      </div>
    </header>
  );
}
