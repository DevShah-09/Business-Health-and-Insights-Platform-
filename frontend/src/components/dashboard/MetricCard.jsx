import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export function MetricCard({ label, value, change, icon: Icon, trend = 'neutral' }) {
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400';
  const bgColor = trend === 'up' ? 'bg-green-500/10' : trend === 'down' ? 'bg-red-500/10' : 'bg-slate-500/10';
  const iconColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400';

  return (
    <div className="bg-[#1a2436] rounded-xl p-5 border border-[#2d3449] hover:border-[#6366f1]/30 transition">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${bgColor}`}>
          <Icon size={18} className={iconColor} />
        </div>
        {trend === 'up' && <TrendingUp size={16} className="text-green-400" />}
        {trend === 'down' && <TrendingDown size={16} className="text-red-400" />}
      </div>
      <p className="text-xs font-medium text-slate-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-white mb-2">{value}</p>
      <p className={`text-xs font-medium ${trendColor}`}>{change}</p>
    </div>
  );
}
