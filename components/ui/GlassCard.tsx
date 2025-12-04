import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children?: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassCard = ({ children, className = '', hoverEffect = false }: GlassCardProps) => {
  return (
    <div 
      className={`
        relative overflow-hidden rounded-3xl
        bg-white/60 dark:bg-mindo-depth/60 backdrop-blur-xl
        border border-white/50 dark:border-white/10 border-t-white/80 dark:border-t-white/20
        shadow-lg shadow-slate-200/50 dark:shadow-black/40
        ring-1 ring-inset ring-white/20 dark:ring-white/5
        transition-colors duration-500
        ${hoverEffect ? 'transition-all duration-300 hover:border-mindo-glow/30 hover:shadow-mindo-glow/10 hover:-translate-y-1' : ''}
        ${className}
      `}
    >
      {/* Inner Noise (Subtle texture) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Top Highlight Shine */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 dark:via-white/20 to-transparent" />

      {/* Content */}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};