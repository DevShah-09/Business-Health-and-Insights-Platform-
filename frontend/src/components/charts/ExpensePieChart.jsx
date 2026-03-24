import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Card } from '../ui/Card';

const COLORS = ['#6366f1', '#a5b4fc', '#818cf8', '#4f46e5', '#3730a3'];

export function ExpensePieChart({ data, loading }) {
  if (loading) {
    return <Card className="h-[300px] animate-pulse flex items-center justify-center text-surface-muted-foreground">Loading chart...</Card>;
  }

  return (
    <Card className="h-[300px] flex flex-col">
      <h3 className="text-sm font-semibold text-surface-foreground mb-4">Resource Allocation</h3>
      <div className="flex-1 w-full h-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#171f33', borderColor: '#334155', borderRadius: '8px' }}
              itemStyle={{ color: '#dae2fd' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#c7c4d7' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
