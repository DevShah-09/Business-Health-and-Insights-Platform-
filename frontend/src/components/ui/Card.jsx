/** Reusable Card component with optional glow */
import React from 'react';

export function Card({ children, className = '', glow = false }) {
  return (
    <div
      className={`card ${glow ? 'shadow-[0_0_40px_rgba(128,131,255,0.08)]' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
