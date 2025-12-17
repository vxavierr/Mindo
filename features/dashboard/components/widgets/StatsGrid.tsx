import React from 'react';
import { TrendingUp, BrainCircuit, Share2, CalendarDays } from 'lucide-react';
import { useMindoStore } from '../../../../store/useMindoStore';
import { StatCard } from '../StatCard';
import { AnimatedCard } from '../../../../components/ui/PageTransition';

export function StatsGrid() {
  const { metrics } = useMindoStore();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <AnimatedCard>
        <StatCard
          label="Sequência"
          value={metrics.streakDays}
          unit="dias"
          icon={TrendingUp}
          trend={1}
          color="green"
        />
      </AnimatedCard>
      <AnimatedCard>
        <StatCard
          label="Neurônios"
          value={metrics.totalNodes}
          unit=""
          icon={BrainCircuit}
          trend={5.2}
        />
      </AnimatedCard>
      <AnimatedCard>
        <StatCard
          label="Conexões"
          value={metrics.totalConnections}
          unit=""
          icon={Share2}
          trend={12}
        />
      </AnimatedCard>
      <AnimatedCard>
        <StatCard
          label="Focus"
          value={metrics.hoursThisWeek.toFixed(1)}
          unit="h"
          icon={CalendarDays}
          trend={-2}
          color={metrics.hoursThisWeek < 10 ? 'red' : 'green'}
        />
      </AnimatedCard>
    </div>
  );
}