/**
 * KPICard — displays a single KPI metric with trend arrow
 */
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

function formatCurrency(val) {
  const number = Number(val) || 0;
  if (number >= 1_000_000) return `₹${(number / 1_000_000).toFixed(1)}M`;
  if (number >= 1_000) return `₹${(number / 1_000).toFixed(1)}K`;
  return `₹${number.toLocaleString()}`;
}

export function KPICard({ label, value, delta, icon: Icon, color = '#6366f1', loading = false }) {
  const positive = delta >= 0;

  if (loading) {
    return (
      <div className="card animate-pulse flex flex-col items-center justify-center p-6 min-h-[160px]">
        <div className="h-10 w-10 rounded-xl bg-surface-muted mb-4" />
        <div className="h-4 w-24 rounded bg-surface-muted mb-3" />
        <div className="h-8 w-32 rounded bg-surface-muted" />
      </div>
    );
  }

  return (
    <div className="card group relative overflow-hidden transition-all duration-200 hover:shadow-[0_0_30px_rgba(128,131,255,0.1)] hover:-translate-y-0.5 min-h-[160px] flex flex-col items-center justify-center text-center p-6">
      {/* Accent glow at top */}
      <div
        className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl opacity-80"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      {Icon && (
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ background: `${color}22` }}
        >
          <Icon size={24} style={{ color }} />
        </div>
      )}

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-surface-muted-foreground opacity-80">{label}</p>
        <p className="mt-2 text-4xl font-bold tracking-tight text-surface-foreground" style={{ letterSpacing: '-0.04em' }}>
          {formatCurrency(value)}
        </p>
      </div>
    </div>
  );
}
