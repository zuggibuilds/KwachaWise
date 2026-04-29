import { NavLink } from 'react-router-dom';

const items = [
  { to: '/', label: 'Home' },
  { to: '/transactions', label: 'Tx' },
  { to: '/budgets', label: 'Budgets' },
  { to: '/goals', label: 'Goals' },
  { to: '/more', label: 'More' }
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#30363d] bg-[#0d1117]/95 md:hidden">
      <div className="relative mx-auto max-w-6xl px-3 py-2">
        <div className="absolute -top-5 left-1/2 -translate-x-1/2">
          <button
            aria-label="Add transaction"
            onClick={() => window.dispatchEvent(new CustomEvent('open-transaction-sheet'))}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-[#0d1117] shadow-lg shadow-emerald-950/40"
          >
            +
          </button>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-xl px-2 py-3 text-center text-xs font-semibold transition ${
                  isActive ? 'bg-[#00c896] text-[#0d1117]' : 'text-[#8b949e] hover:bg-white/5 hover:text-[#e6edf3]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
