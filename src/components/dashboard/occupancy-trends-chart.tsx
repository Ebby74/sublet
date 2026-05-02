'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface OccupancyData {
  month: string;
  currentYear: number;
  previousYear: number;
}

interface OccupancyTrendsChartProps {
  userId?: string;
}

function SkeletonChart() {
  return (
    <div className="h-[300px] w-full animate-pulse bg-muted rounded-lg" />
  );
}

export function OccupancyTrendsChart({ userId }: OccupancyTrendsChartProps) {
  const [data, setData] = useState<OccupancyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOccupancyData() {
      setLoading(true);
      try {
        const response = await fetch(`/api/v1/reports/occupancy-trends`);
        const result = await response.json();
        if (result.data) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch occupancy data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOccupancyData();
  }, [userId]);

  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number; dataKey: string; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-md">
          <p className="font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey === 'currentYear' ? currentYear : previousYear}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Occupancy Trends</h3>
        <SkeletonChart />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Occupancy Trends</h3>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          No occupancy data available.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-foreground mb-4">Occupancy Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickLine={{ stroke: 'hsl(var(--border))' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="currentYear" 
            name={`${currentYear}`}
            stroke="#2563eb" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="previousYear" 
            name={`${previousYear}`}
            stroke="#9ca3af" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}