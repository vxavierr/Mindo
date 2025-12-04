import React, { useMemo } from 'react';
import { MemoryUnit } from '../../types';

interface NodeContentRendererProps {
  content?: string;
  memoryUnits?: MemoryUnit[];
  isReviewMode: boolean;
  activeUnitId?: string | null; 
}

export function NodeContentRenderer({ content, memoryUnits, isReviewMode, activeUnitId }: NodeContentRendererProps) {
  
  const renderedContent = useMemo(() => {
    if (!content) return null;
    
    let html = content;

    if (memoryUnits) {
        memoryUnits.forEach(unit => {
            const isActive = activeUnitId === unit.id;

            let highlightClass = "rounded px-1 transition-all duration-500 cursor-pointer ";
            
            if (isReviewMode) {
                if (isActive) {
                    highlightClass += "bg-mindo-glow text-black font-bold shadow-[0_0_15px_#38bdf8] scale-110 inline-block mx-1 ";
                } else {
                    highlightClass += "bg-transparent text-transparent blur-sm "; 
                }
            } else {
                highlightClass += "bg-mindo-primary/20 hover:bg-mindo-primary/40 text-indigo-700 dark:text-mindo-accent border-b border-dashed border-mindo-primary ";
            }

            const span = `<span id="mu-${unit.id}" class="${highlightClass}" title="${unit.question}">${unit.textSegment}</span>`;
            html = html.replace(unit.textSegment, span);
        });
    }
    
    return { __html: html };
  }, [content, memoryUnits, isReviewMode, activeUnitId]);

  if (!content) return <div className="text-slate-400 italic text-xs">No content.</div>;

  return (
    <div 
       className={`
         prose prose-sm dark:prose-invert max-w-none leading-relaxed
         transition-all duration-700
         ${isReviewMode ? 'blur-context' : ''} 
       `}
       dangerouslySetInnerHTML={renderedContent || { __html: '' }}
    />
  );
}