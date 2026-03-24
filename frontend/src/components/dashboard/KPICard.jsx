/**
 * KPICard — displays a single KPI metric with trend arrow
 */
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

function formatCurrency(val) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(1)}K`;
  return `$${val}`;
}

export function KPICard({ label, value, delta, icon: Icon, color = '#6366f1', loading = false }) {
  const positive = delta >= 0;

  if (loading) {
    return (
      <div className="card animate-pulse">
        <div className="h-4 w-24 rounded bg-surface-muted mb-3" />
        <div className="h-8 w-32 rounded bg-surface-muted mb-2" />
        <div className="h-3 w-16 rounded bg-surface-muted" />
      </div>
    );
  }

  return (
    <div className="card group relative overflow-hidden transition-all duration-200 hover:shadow-[0_0_30px_rgba(128,131,255,0.1)] hover:-translate-y-0.5">
      {/* Accent glow at top */}
      <div
        className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl opacity-80"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-surface-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-surface-foreground" style={{ letterSpacing: '-0.04em' }}>
            {formatCurrency(value)}
          </p>
        </div>
        {Icon && (
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: `${color}22` }}
          >
            <Icon size={20} style={{ color }} />
          </div>
        )}
      </div>

      {delta !== undefined && (
        <div className={`mt-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
          positive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {positive ? '+' : ''}{delta}% vs last month
        </div>
      )}
    </div>
  );
}
