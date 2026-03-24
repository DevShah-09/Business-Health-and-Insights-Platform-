/**
 * HealthScore — circular gauge showing business health 0–100
 */
import React from 'react';
import { ProgressBar } from '../ui/Badge';

function getScoreColor(score) {
  if (score >= 75) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

function getScoreLabel(score) {
  if (score >= 75) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'At Risk';
}

export function HealthScore({ score = 0, profitMargin = 0, growthRate = 0, expenseRatio = 0, loading = false }) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);

  // SVG circle gauge
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  if (loading) {
    return (
      <div className="card animate-pulse flex gap-6 items-center">
        <div className="h-32 w-32 rounded-full bg-surface-muted shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-24 rounded bg-surface-muted" />
          <div className="h-3 w-full rounded bg-surface-muted" />
          <div className="h-3 w-full rounded bg-surface-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="card flex flex-col sm:flex-row gap-6 items-center">
      {/* Circular gauge */}
      <div className="relative shrink-0">
        <svg width="128" height="128" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#2d3449" strokeWidth="10" />
          <circle
            cx="64" cy="64" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 64 64)"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-surface-foreground" style={{ letterSpacing: '-0.04em' }}>{score}</span>
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color }}>{label}</span>
        </div>
      </div>

      {/* KPI metrics */}
      <div className="flex-1 w-full space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-surface-muted-foreground mb-1">Business Health KPIs</p>
        <ProgressBar value={profitMargin} max={100} color="#6366f1" label="Profit Margin" />
        <ProgressBar value={growthRate} max={50} color="#22c55e" label="Growth Rate" />
        <ProgressBar value={expenseRatio} max={100} color="#f59e0b" label="Expense Ratio" />
      </div>
    </div>
  );
}
