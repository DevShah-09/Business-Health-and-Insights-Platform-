import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Card } from '../ui/Card';

export function RevenueExpenseChart({ data, loading }) {
  if (loading) {
    return <Card className="h-[300px] animate-pulse flex items-center justify-center text-slate-500">Loading chart...</Card>;
  }

  return (
    <Card className="h-[300px] flex flex-col">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">Financial Momentum</h3>
      <div className="flex-1 w-full h-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3449" vertical={false} />
            <XAxis dataKey="month" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
            <Tooltip
              contentStyle={{ backgroundColor: '#171f33', borderColor: '#334155', borderRadius: '8px', color: '#dae2fd' }}
              itemStyle={{ color: '#dae2fd' }}
            />
            <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#22c55e" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
