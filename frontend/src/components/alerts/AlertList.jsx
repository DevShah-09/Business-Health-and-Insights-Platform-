import React from 'react';
import { AlertCard } from './AlertCard';

export function AlertList({ alerts, loading, onDismiss }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 w-full animate-pulse rounded-xl bg-[#2d3449]/50" />
        ))}
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-[#464554] bg-[#171f33]/50 text-sm text-slate-500">
        No active alerts.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <AlertCard key={alert.id} alert={alert} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
