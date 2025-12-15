import React from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip as RechartsTooltip,
} from 'recharts';
import { Target, AlertTriangle } from 'lucide-react';
import { GlassCard } from '../../../../components/ui/GlassCard';
import { RadarDataPoint, ObesityLevel } from '../../../analytics/types';

interface ConfidenceRadarProps {
  data: RadarDataPoint[];
  score: number;
  obesityLevel: ObesityLevel;
  theme: 'light' | 'dark';
}

export function ConfidenceRadar({ data, score, obesityLevel, theme }: ConfidenceRadarProps) {
  return (
    <GlassCard className="p-6 h-full relative">
      <div className="flex flex-col h-full min-h-[250px]">
        <div className="absolute top-0 right-0 w-40 h-40 bg-mindo-primary/20 rounded-full blur-[60px]" />

        <div className="relative z-10 flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Target className="text-indigo-500 dark:text-mindo-glow" size={18} />
              Confidence
            </h3>
            <div className="text-3xl font-black text-slate-800 dark:text-white mt-1">
              {score}
            </div>
          </div>
          {obesityLevel !== 'healthy' && (
            <AlertTriangle className="text-amber-500 dark:text-amber-400 animate-pulse" size={20} />
          )}
        </div>

        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
              <PolarGrid stroke={theme === 'dark' ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
              />
              <Radar
                name="Current State"
                dataKey="A"
                stroke="#a78bfa"
                strokeWidth={2}
                fill="#6b21a8"
                fillOpacity={0.5}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: theme === 'dark' ? '#050505' : '#ffffff',
                  border: theme === 'dark' ? '1px solid #333' : '1px solid #e2e8f0',
                  borderRadius: '8px',
                  color: theme === 'dark' ? '#fff' : '#0f172a'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  );
}