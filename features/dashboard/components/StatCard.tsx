import React from 'react';
import { LucideIcon } from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  trend?: number;
  subtext?: string;
  color?: 'red' | 'green';
}

export function StatCard({ 
  label, 
  value, 
  unit, 
  icon: Icon, 
  trend, 
  subtext,
  color 
}: StatCardProps) {
  
  return (
    <GlassCard className="p-5 h-full flex flex-col justify-between gap-3" hoverEffect={true}>
      <div className="flex justify-between items-start">
        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-indigo-600 dark:text-mindo-accent shadow-inner group-hover:text-indigo-800 dark:group-hover:text-white transition-colors">
          <Icon size={20} />
        </div>
        {trend !== undefined && trend !== 0 && (
          <span className={`text-[10px] font-mono py-1 px-2 rounded-lg border flex items-center gap-1 font-bold
            ${trend > 0 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
            }
          `}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-1">
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight drop-shadow-sm dark:drop-shadow-lg">
            {value}
          </h3>
          {unit && <span className="text-xs font-medium text-slate-500">{unit}</span>}
        </div>
        <p className="text-[10px] text-slate-400 font-bold mt-1 tracking-widest uppercase opacity-80">
          {label}
        </p>
      </div>
    </GlassCard>
  );
}