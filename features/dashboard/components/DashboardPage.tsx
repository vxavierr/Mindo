import React from 'react';
import { Activity } from 'lucide-react';
import { HeatmapBlock } from './HeatmapBlock';
import { PageWrapper, AnimatedCard } from '../../../components/ui/PageTransition';
import { GlassCard } from '../../../components/ui/GlassCard';

import { DashboardHeader } from './widgets/DashboardHeader';
import { ConfidenceRadar } from './widgets/ConfidenceRadar';
import { StatsGrid } from './widgets/StatsGrid';
import { ActivityChart } from './widgets/ActivityChart';
import { useMindoStore } from '../../../store/useMindoStore';

export function DashboardPage() {
  const { calculateObesity, getRadarData, metrics, theme } = useMindoStore();
  
  const obesityLevel = calculateObesity();
  const radarData = getRadarData();

  return (
    <PageWrapper className="!p-6 h-full flex flex-col overflow-hidden">
      
      <DashboardHeader />

      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 min-h-0">
        <div className="md:col-span-4 flex flex-col gap-4 min-h-0">
          <AnimatedCard className="flex-1 min-h-[300px]">
             <ConfidenceRadar 
                data={radarData}
                score={metrics.confidenceScore}
                obesityLevel={obesityLevel}
                theme={theme}
             />
          </AnimatedCard>

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

        <div className="md:col-span-8 flex flex-col gap-4 min-h-0">
          <StatsGrid />
          <AnimatedCard className="flex-1 min-h-[250px]">
            <ActivityChart />
          </AnimatedCard>
        </div>
      </div>
    </PageWrapper>
  );
}