import React from 'react';
import {
  BarChart, Bar, XAxis, ResponsiveContainer, Tooltip as RechartsTooltip,
} from 'recharts';
import { useMindoStore } from '../../../../store/useMindoStore';
import { GlassCard } from '../../../../components/ui/GlassCard';

const activityData = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 1.0 },
  { day: 'Wed', hours: 0.0 },
  { day: 'Thu', hours: 3.2 },
  { day: 'Fri', hours: 1.5 },
  { day: 'Sat', hours: 4.0 },
  { day: 'Sun', hours: 2.0 },
];

export function ActivityChart() {
  const { theme } = useMindoStore();

  return (
    <GlassCard className="p-6 h-full flex flex-col">
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
        Activity Output
      </h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
              dy={10}
            />
            <RechartsTooltip
              cursor={{ fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
              contentStyle={{
                backgroundColor: theme === 'dark' ? 'rgba(5,5,5,0.9)' : 'rgba(255,255,255,0.95)',
                borderRadius: '12px',
                border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                color: theme === 'dark' ? '#fff' : '#0f172a',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              }}
              formatter={(value: number) => [`${value}h`, 'Time']}
            />
            <Bar
              dataKey="hours"
              fill="#6b21a8"
              radius={[6, 6, 6, 6]}
              barSize={32}
              className="hover:fill-mindo-glow transition-all duration-300"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}