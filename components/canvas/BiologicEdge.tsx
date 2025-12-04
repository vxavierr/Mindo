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
      {/* 1. The Sheath (Axon/Base) - Dark and thick to create contrast */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: 3,
          stroke: '#1e293b', // Dark Slate (visible against black)
          strokeOpacity: 0.8,
        }}
      />

      {/* 2. The Pulse (Signal) - Electric and animated */}
      <BaseEdge
        path={edgePath}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: '#38bdf8', // Electric Cyan
          // '10 40' creates a pulse of 10px followed by 40px gap.
          // The total pattern length is 50.
          // The animation moves offset from 100 to -100 (delta 200).
          // 200 is a multiple of 50, so the loop is seamless.
          strokeDasharray: '10 40', 
          strokeDashoffset: 0,
          animation: 'traveling-pulse 3s linear infinite', // CSS Keyframe defined in index.html
          filter: 'drop-shadow(0 0 3px rgba(56, 189, 248, 0.8))',
          fill: 'none',
        }}
      />
    </>
  );
}