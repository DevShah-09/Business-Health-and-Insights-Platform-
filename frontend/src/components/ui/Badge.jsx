/** Badge and ProgressBar */
import React from 'react';

const badgeVariants = {
  high:   'bg-red-500/15 text-red-400 border border-red-500/20',
  medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  low:    'bg-green-500/15 text-green-400 border border-green-500/20',
  info:   'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  default:'bg-surface-muted text-surface-muted-foreground border border-surface-border/30',
};

export function Badge({ children, variant = 'default' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${badgeVariants[variant?.toLowerCase()] || badgeVariants.default}`}>
      {children}
    </span>
  );
}

export function ProgressBar({ value = 0, max = 100, color = '#6366f1', label, showValue = true }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100)).toFixed(1);
  return (
    <div className="flex flex-col gap-1.5">
      {(label || showValue) && (
        <div className="flex justify-between text-xs">
          {label && <span className="text-surface-muted-foreground">{label}</span>}
          {showValue && <span className="font-semibold text-surface-foreground">{pct}%</span>}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export function Slider({ label, value, min = -100, max = 100, step = 1, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-sm">
        <span className="text-surface-muted-foreground">{label}</span>
        <span className={`font-bold ${value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {value > 0 ? '+' : ''}{value}%
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer accent-[#6366f1]"
      />
      <div className="flex justify-between text-xs text-surface-muted-foreground">
        <span>{min}%</span><span>0%</span><span>+{max}%</span>
      </div>
    </div>
  );
}
