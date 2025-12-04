import React from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';
import { useMindoStore } from '../../../../store/useMindoStore';

export function SemanticEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  
  const { theme } = useMindoStore();
  const label = data?.semanticLabel || 'link';

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: theme === 'dark' ? '#94a3b8' : '#64748b',
          strokeOpacity: 0.6,
        }}
      />
      {/* @ts-ignore */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="z-10"
        >
          <div className="bg-white dark:bg-mindo-void px-2 py-1 rounded-md border border-slate-200 dark:border-white/10 shadow-sm">
             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
               {label}
             </span>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}