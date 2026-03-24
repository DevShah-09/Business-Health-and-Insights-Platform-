import React from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const VARIANTS = {
  critical: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-400',
    iconText: 'text-red-500',
    Icon: AlertCircle
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    iconText: 'text-amber-500',
    Icon: AlertTriangle
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    iconText: 'text-blue-500',
    Icon: Info
  }
};

export function AlertCard({ alert, onDismiss }) {
  // Support both 'severity' and 'type' fields for backwards compatibility
  const severity = alert.severity || alert.type || 'info';
  const { bg, border, text, iconText, Icon } = VARIANTS[severity] || VARIANTS.info;

  return (
    <div className={`relative flex items-start gap-4 rounded-xl border p-4 ${bg} ${border}`}>
      <div className={`mt-0.5 shrink-0 ${iconText}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <h4 className={`text-sm font-semibold ${text}`}>{alert.title}</h4>
        <p className="mt-1 text-sm text-surface-muted-foreground leading-snug">{alert.message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={() => onDismiss(alert.id)}
          className="shrink-0 rounded-lg p-1 text-surface-muted-foreground hover:bg-white/5 hover:text-surface-foreground"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
