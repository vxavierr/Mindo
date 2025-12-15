import { differenceInDays, differenceInHours } from 'date-fns';
import { NodeStatus, MindNodeData, MemoryUnit } from '../types';

export type BioHealth = 'radiant' | 'dimmed' | 'petrified' | 'isolated' | 'mastered';

/**
 * Calculates the biological health/color of a node.
 * 
 * Logic:
 * - BLUE (Radiant): New (< 24h).
 * - GRAY (Isolated): Old (> 24h) AND No connections.
 * - YELLOW (Dimmed/Learning): Connected AND (Learning OR < 7 days since review).
 * - RED (Petrified): Connected AND > 7 days since review.
 * - GREEN (Mastered): All memory units mastered OR explicitly marked as mastered.
 */
export const calculateNodeHealth = (
  data: MindNodeData,
  connectionCount: number = 0
): BioHealth => {
  if (!data) return 'dimmed';
  const { created_at, lastReview, status, memoryUnits = [] } = data;

  // 1. MASTERED (Green)
  // If explicitly mastered OR (has memory units AND all are mastered)
  if (status === 'mastered') return 'mastered';
  if (memoryUnits.length > 0 && memoryUnits.every(u => u.status === 'mastered')) {
    return 'mastered';
  }

  const now = new Date();
  const created = created_at ? new Date(created_at) : now;
  const hoursSinceCreation = differenceInHours(now, created);

  // 2. NEW (Blue/Radiant)
  if (hoursSinceCreation < 24) return 'radiant';

  // 3. ISOLATED (Gray)
  if (connectionCount === 0) return 'isolated';

  // 4. PETRIFIED (Red)
  // If it has connections but hasn't been reviewed in a long time
  if (lastReview) {
    const daysSinceReview = differenceInDays(now, new Date(lastReview));
    if (daysSinceReview > 7) return 'petrified';
  } else if (hoursSinceCreation > 24 * 7) {
    // Created over a week ago, never reviewed, but connected? Petrified.
    return 'petrified';
  }

  // 5. LEARNING (Yellow/Dimmed)
  // Default state for connected, active nodes
  return 'dimmed';
};

/**
 * Returns Tailwind classes based on health state.
 */
export const getHealthStyles = (health: BioHealth, isSelected: boolean) => {
  switch (health) {
    case 'radiant': // NEW (Blue)
      return {
        opacity: 'opacity-100',
        filter: 'brightness(1.1)',
        glow: isSelected
          ? 'shadow-[0_0_50px_rgba(56,189,248,0.7)] ring-2 ring-blue-400'
          : 'shadow-[0_0_30px_rgba(56,189,248,0.4)]',
        border: 'border-blue-400',
        bg: 'bg-blue-950/80'
      };
    case 'isolated': // ISOLATED (Gray)
      return {
        opacity: 'opacity-80',
        filter: 'grayscale(1)',
        glow: isSelected ? 'shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'shadow-none',
        border: 'border-slate-600',
        bg: 'bg-slate-900/80'
      };
    case 'dimmed': // LEARNING (Yellow)
      return {
        opacity: 'opacity-100',
        filter: 'sepia(1) hue-rotate(5deg) saturate(2)', // Push towards yellow/amber
        glow: isSelected
          ? 'shadow-[0_0_40px_rgba(251,191,36,0.6)] ring-2 ring-amber-400'
          : 'shadow-[0_0_20px_rgba(251,191,36,0.3)]',
        border: 'border-amber-400',
        bg: 'bg-amber-950/80'
      };
    case 'petrified': // CRITICAL (Red)
      return {
        opacity: 'opacity-100',
        filter: 'none',
        glow: isSelected
          ? 'shadow-[0_0_40px_rgba(239,68,68,0.6)] ring-2 ring-red-500'
          : 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
        border: 'border-red-500',
        bg: 'bg-red-950/80'
      };
    case 'mastered': // MASTERED (Green)
      return {
        opacity: 'opacity-100',
        filter: 'none',
        glow: isSelected
          ? 'shadow-[0_0_40px_rgba(34,197,94,0.6)] ring-2 ring-green-500'
          : 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
        border: 'border-green-500',
        bg: 'bg-green-950/80'
      };
  }
};