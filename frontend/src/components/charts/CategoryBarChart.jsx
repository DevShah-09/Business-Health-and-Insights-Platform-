import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Card } from '../ui/Card';

// Brown gradient palette — darkest to lightest across bars
const BROWN_SHADES = [
  '#a0522d', // sienna
  '#b5651d', // medium brown
  '#c8803a',
  '#d4944e',
  '#dda86a',
  '#e6bb86',
  '#f0cfa0',
  '#f7e0bc',
];

function getBrownColor(index, total) {
  const idx = Math.round((index / Math.max(total - 1, 1)) * (BROWN_SHADES.length - 1));
  return BROWN_SHADES[idx];
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#1e1410', border: '1px solid #6b3f1a', borderRadius: 8, padding: '8px 14px' }}>
        <p style={{ color: '#f0cfa0', fontSize: 12, marginBottom: 4, textTransform: 'capitalize' }}>{label}</p>
        <p style={{ color: '#e6bb86', fontWeight: 700, fontSize: 14 }}>
          ₹{Number(payload[0].value).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export function CategoryBarChart({ data, loading }) {
  if (loading) {
    return <Card className="h-[300px] animate-pulse flex items-center justify-center text-surface-muted-foreground">Loading chart...</Card>;
  }

  return (
    <div className="h-[300px] flex flex-col w-full">
      <div className="flex-1 w-full h-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 16, left: 4, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3a2010" horizontal={false} vertical={true} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fill: '#d4a472', fontSize: 13, fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              width={90}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(160,82,45,0.08)' }} />
            <Bar dataKey="expenses" name="Expenses" radius={[0, 5, 5, 0]} barSize={16}>
              {(data || []).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBrownColor(index, data.length)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
