import React, { memo } from 'react';
import { FileText, Mic, Sparkles } from 'lucide-react';
import { MindNodeData } from '../../../types';
import { useMindoStore } from '../../../store/useMindoStore';
import { NodeContentRenderer } from './NodeContentRenderer';
import { getNodeStyle } from '../../../utils/styleMap';

interface NodeLODDetailProps {
  id: string;
  data: MindNodeData;
  selected: boolean;
}

export const NodeLODDetail = memo(({ id, data, selected }: NodeLODDetailProps) => {
  const { reviewSession } = useMindoStore();
  const TypeIcon = data.type === 'audio' ? Mic : FileText;
  
  // Review Mode Logic
  const isReviewPathActive = reviewSession?.mode === 'path';
  const isCurrentNode = reviewSession?.pathNodes?.[reviewSession.currentIndex] === id;
  const isFocused = isReviewPathActive && isCurrentNode;
  
  const dimStyle = isReviewPathActive && !isCurrentNode ? 'opacity-20 blur-sm scale-95 grayscale' : 'opacity-100';

  // DRY: Use centralized style map
  const styles = getNodeStyle(data.status);

  return (
    <div className={`
      relative min-w-[300px] max-w-[350px] rounded-2xl transition-all duration-300 group
      ${dimStyle}
      ${isFocused ? 'scale-110 z-50 ring-4 ring-mindo-glow shadow-[0_0_60px_rgba(56,189,248,0.5)]' : ''}
      ${selected && !isReviewPathActive ? 'scale-105 z-20' : ''}
      ${!selected && !isReviewPathActive ? 'hover:scale-105 z-10' : ''}
    `}>
      {/* Animated Gradient Border */}
      <div className={`absolute -inset-[2px] rounded-2xl bg-gradient-to-r ${styles.glow} opacity-80 blur-[2px] transition-all duration-300 
        ${selected || isFocused ? 'opacity-100 blur-[6px]' : 'group-hover:opacity-100 group-hover:blur-[4px]'}
      `} />

      {/* Main Card Content */}
      <div className="relative h-full w-full bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/50 flex flex-col gap-4 shadow-xl overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-20" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-mindo-accent">
             {isFocused ? (
                 <Sparkles size={16} className="text-mindo-glow animate-spin-slow" />
             ) : (
                 <TypeIcon size={14} className="text-slate-500 dark:text-slate-400" />
             )}
            <span className="text-[10px] font-bold tracking-widest uppercase opacity-90 text-slate-500 dark:text-slate-400">
              {isFocused ? 'Reviewing' : data.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="text-slate-800 dark:text-slate-100 font-bold text-xl leading-tight">
          {data.label}
        </div>

        {/* Content Renderer */}
        <div className="min-h-[60px]">
           <NodeContentRenderer 
              content={data.content} 
              memoryUnits={data.memoryUnits}
              isReviewMode={isFocused}
              activeUnitId={reviewSession?.activeMemoryUnitId}
           />
        </div>

        {/* Tags Footer */}
        {data.tags && data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            {data.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-700">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
