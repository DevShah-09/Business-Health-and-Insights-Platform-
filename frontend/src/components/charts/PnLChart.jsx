import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function PnLChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2d3449" />
        <XAxis
          dataKey="period"
          stroke="#64748b"
          style={{ fontSize: '12px' }}
        />
        <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a2436',
            border: '1px solid #2d3449',
            borderRadius: '8px',
            textAlign: 'right',
          }}
          formatter={(value) => `$${value.toLocaleString()}`}
          labelStyle={{ color: '#cbd5e1' }}
        />
        <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: '12px' }} />
        <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} />
        <Bar dataKey="expenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
        <Bar dataKey="profit" fill="#6366f1" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
