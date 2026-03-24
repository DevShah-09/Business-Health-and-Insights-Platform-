/** Reusable Button component */
import React from 'react';

const variants = {
  primary: 'btn-primary',
  ghost: 'btn-ghost',
  danger: 'inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20',
};

export function Button({ children, variant = 'primary', className = '', ...props }) {
  return (
    <button className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
