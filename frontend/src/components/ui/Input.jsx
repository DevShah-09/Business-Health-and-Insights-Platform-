/** Reusable Input and Select */
import React from 'react';

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium uppercase tracking-wider text-surface-muted-foreground">{label}</label>}
      <input className={`input ${error ? 'border-red-500 focus:border-red-500 focus:shadow-[0_0_0_1px_#ef4444]' : ''} ${className}`} {...props} />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export function Select({ label, options = [], className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-xs font-medium uppercase tracking-wider text-surface-muted-foreground">{label}</label>}
      <select className={`input ${className}`} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface-card">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
