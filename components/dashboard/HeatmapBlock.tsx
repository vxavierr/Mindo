import React from 'react';

type HeatmapLevel = 0 | 1 | 2 | 3;

const levelColors: Record<HeatmapLevel, string> = {
  0: 'bg-white/5',
  1: 'bg-mindo-primary/40',
  2: 'bg-mindo-primary/70',
  3: 'bg-mindo-glow shadow-[0_0_10px_#a78bfa]',
};

// Generate mock data for 90 days
const generateHeatmapData = (): HeatmapLevel[] => {
  return Array.from({ length: 90 }, () => 
    Math.floor(Math.random() * 4) as HeatmapLevel
  );
};

export function HeatmapBlock() {
  const data = generateHeatmapData();

  return (
    <div className="flex flex-wrap gap-1.5">
      {data.map((level, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-[2px] ${levelColors[level]} transition-all hover:scale-125 cursor-pointer`}
          title={`Day ${i + 1}: Level ${level}`}
        />
      ))}
      
      {/* Legend */}
      <div className="w-full flex items-center gap-2 mt-4 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
        <span>Rest</span>
        {([0, 1, 2, 3] as HeatmapLevel[]).map((level) => (
          <div
            key={level}
            className={`w-3 h-3 rounded-[2px] ${levelColors[level]}`}
          />
        ))}
        <span>Flow</span>
      </div>
    </div>
  );
}