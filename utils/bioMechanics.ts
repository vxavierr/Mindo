import { differenceInDays } from 'date-fns';
import { NodeStatus } from '../types';

export type BioHealth = 'radiant' | 'dimmed' | 'petrified';

/**
 * Calculates the biological health of a node based on its last review date.
 * 
 * - Radiant (Healthy): 0-3 days (Fresh memory)
 * - Dimmed (Decaying): 4-7 days (Fading memory)
 * - Petrified (Critical): >7 days (Needs reactivation)
 */
export const calculateNodeHealth = (lastReview?: string, status?: NodeStatus): BioHealth => {
  if (status === 'new' || status === 'inbox') return 'radiant';
  if (!lastReview) return 'dimmed';

  const daysSinceReview = differenceInDays(new Date(), new Date(lastReview));

  if (daysSinceReview <= 3) return 'radiant';
  if (daysSinceReview <= 7) return 'dimmed';
  return 'petrified';
};

/**
 * Returns Tailwind classes based on health state.
 * EDITED: Removed opacity drops to improve visibility in Dark Mode.
 * EDITED: Removed 'animate-pulse' to make glow stable.
 * EDITED: Increased shadow intensity.
 */
export const getHealthStyles = (health: BioHealth, isSelected: boolean) => {
  switch (health) {
    case 'radiant':
      return {
        // Full opacity for visibility
        opacity: 'opacity-100', 
        filter: 'brightness(1.05)',
        // Stronger, static glow (no animation)
        glow: isSelected 
          ? 'shadow-[0_0_50px_rgba(56,189,248,0.7)] ring-2 ring-mindo-glow' 
          : 'shadow-[0_0_30px_rgba(56,189,248,0.4)]', 
        animation: '' 
      };
    case 'dimmed':
      return {
        // Increased from 0.7 to 1.0 for better contrast
        opacity: 'opacity-100', 
        // Use saturation to indicate health instead of opacity
        filter: 'grayscale(0.4)', 
        glow: isSelected ? 'shadow-[0_0_20px_rgba(255,255,255,0.2)]' : '',
        animation: ''
      };
    case 'petrified':
      return {
        // Increased from 0.5 to 0.9
        opacity: 'opacity-90', 
        filter: 'grayscale(1) contrast(1.1)', 
        glow: 'shadow-none',
        animation: ''
      };
  }
};