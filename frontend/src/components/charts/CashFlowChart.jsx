import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function CashFlowChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <defs>
          <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2d3449" />
        <XAxis
          dataKey="date"
          stroke="#64748b"
          style={{ fontSize: '12px' }}
        />
        <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a2436',
            border: '1px solid #2d3449',
            borderRadius: '8px',
          }}
          formatter={(value) => `$${value.toLocaleString()}`}
          labelStyle={{ color: '#cbd5e1' }}
        />
        <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: '12px' }} />
        <Area
          type="monotone"
          dataKey="inflow"
          stroke="#10b981"
          fillOpacity={1}
          fill="url(#colorInflow)"
        />
        <Area
          type="monotone"
          dataKey="outflow"
          stroke="#ef4444"
          fillOpacity={1}
          fill="url(#colorOutflow)"
        />
        <Area
          type="monotone"
          dataKey="cumulative"
          stroke="#6366f1"
          fillOpacity={0.1}
          fill="url(#colorCumulative)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
