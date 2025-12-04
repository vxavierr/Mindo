import React from 'react';
import { Activity } from 'lucide-react';
import { HeatmapBlock } from './HeatmapBlock';
import { PageWrapper, AnimatedCard } from '../ui/PageTransition';
import { GlassCard } from '../ui/GlassCard';

import { DashboardHeader } from './widgets/DashboardHeader';
import { ConfidenceRadar } from './widgets/ConfidenceRadar';
import { StatsGrid } from './widgets/StatsGrid';
import { ActivityChart } from './widgets/ActivityChart';
import { useMindoStore } from '../../store/useMindoStore';

export function DashboardPage() {
  // Logic injection happening at the Page Level (Container)
  const { calculateObesity, getRadarData, metrics, theme } = useMindoStore();
  
  const obesityLevel = calculateObesity();
  const radarData = getRadarData();

  return (
    <PageWrapper className="!p-6 h-full flex flex-col overflow-hidden">
      
      {/* === HEADER === */}
      <DashboardHeader />

      {/* === MAIN GRID (Fills remaining height) === */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 min-h-0">
        
        {/* COL 1: RADAR & HEATMAP (4 cols) */}
        <div className="md:col-span-4 flex flex-col gap-4 min-h-0">
          
          {/* Hero Radar - Data passed as props */}
          <AnimatedCard className="flex-1 min-h-[300px]">
             <ConfidenceRadar 
                data={radarData}
                score={metrics.confidenceScore}
                obesityLevel={obesityLevel}
                theme={theme}
             />
          </AnimatedCard>

          {/* Heatmap (Compact) */}
          <AnimatedCard className="h-auto">
            <GlassCard className="p-5 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Activity className="text-indigo-500 dark:text-mindo-accent" size={16} />
                  Rhythm
                </h3>
              </div>
              <HeatmapBlock />
            </GlassCard>
          </AnimatedCard>
        </div>

        {/* COL 2: STATS & CHART (8 cols) */}
        <div className="md:col-span-8 flex flex-col gap-4 min-h-0">
          
          {/* Row of Stats (Compact) */}
          <StatsGrid />

          {/* Activity Chart (Fills remaining height) */}
          <AnimatedCard className="flex-1 min-h-[250px]">
            <ActivityChart />
          </AnimatedCard>

        </div>
      </div>
    </PageWrapper>
  );
}