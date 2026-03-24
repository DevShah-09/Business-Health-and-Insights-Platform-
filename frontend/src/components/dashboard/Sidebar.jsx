import React from 'react';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/',            label: 'Dashboard',    icon: 'dashboard' },
  { to: '/transactions',label: 'Transactions', icon: 'receipt_long' },
  { to: '/financials',  label: 'Analytics',    icon: 'analytics' },
  { to: '/insights',    label: 'AI Insights',  icon: 'psychology' },
  { to: '/forecast',    label: 'Forecast',     icon: 'trending_up' },
  { to: '/simulation',  label: 'Simulation',   icon: 'sliders' },
];

export function Sidebar() {
  return (
    <aside className="h-screen w-64 shrink-0 overflow-y-auto z-50 bg-surface flex flex-col p-4 gap-2 border-r border-surface-border/50 transition-colors">
      <div className="flex items-center gap-3 px-2 py-4 mb-6">
        <div className="w-10 h-10 bg-brand flex items-center justify-center rounded-xl shadow-sm">
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance_wallet</span>
        </div>
        <div>
          <h1 className="font-headline text-xl font-bold text-surface-foreground">FinSight</h1>
          <p className="text-[10px] uppercase tracking-widest text-surface-muted-foreground font-bold">Ledger Artisan</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 font-bold rounded-lg transition-all duration-300 ease-in-out ${
                isActive
                  ? 'bg-surface-card text-brand shadow-sm'
                  : 'text-surface-muted-foreground font-medium hover:bg-surface-border/50 hover:text-surface-foreground'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
                <span className="font-sans text-sm">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-surface-border/50">
        <a className="flex items-center gap-3 px-4 py-3 text-surface-muted-foreground font-medium hover:bg-surface-border/50 hover:text-surface-foreground rounded-lg transition-all duration-300 ease-in-out cursor-pointer">
          <span className="material-symbols-outlined">help</span>
          <span className="font-sans text-sm">Help Center</span>
        </a>
        <a className="flex items-center gap-3 px-4 py-3 text-surface-muted-foreground font-medium hover:bg-surface-border/50 hover:text-error rounded-lg transition-all duration-300 ease-in-out cursor-pointer">
          <span className="material-symbols-outlined text-error">logout</span>
          <span className="font-sans text-sm">Logout</span>
        </a>
      </div>
    </aside>
  );
}
