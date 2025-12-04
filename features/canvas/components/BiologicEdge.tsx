import React from 'react';
import { BaseEdge, EdgeProps, getSmoothStepPath } from 'reactflow';

export function BiologicEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: 3,
          stroke: '#1e293b', 
          strokeOpacity: 0.8,
        }}
      />
      <BaseEdge
        path={edgePath}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: '#38bdf8', 
          strokeDasharray: '10 40', 
          strokeDashoffset: 0,
          animation: 'traveling-pulse 3s linear infinite', 
          filter: 'drop-shadow(0 0 3px rgba(56, 189, 248, 0.8))',
          fill: 'none',
        }}
      />
    </>
  );
}