import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Card } from '../ui/Card';

export function CategoryBarChart({ data, loading }) {
  if (loading) {
    return <Card className="h-[300px] animate-pulse flex items-center justify-center text-slate-500">Loading chart...</Card>;
  }

  return (
    <Card className="h-[300px] flex flex-col">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">Category Spending</h3>
      <div className="flex-1 w-full h-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3449" horizontal={true} vertical={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} width={80} />
            <Tooltip
              cursor={{fill: '#2d3449'}}
              contentStyle={{ backgroundColor: '#171f33', borderColor: '#334155', borderRadius: '8px' }}
            />
            <Bar dataKey="expenses" name="Expenses" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
