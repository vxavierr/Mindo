import React, { memo } from 'react';
import { NodeType } from '../../types';

export interface NodeLODBlobProps {
  type: NodeType;
}

/**
 * Color mapping for blob nodes by type
 */
const BLOB_COLORS: Record<NodeType, string> = {
  text: 'bg-blue-500',
  code: 'bg-slate-500',
  video: 'bg-red-500',
  image: 'bg-emerald-500',
  pdf: 'bg-orange-500',
};

/**
 * NodeLODBlob - Minimal colored dot for extreme zoom-out levels
 * 
 * Shows:
 * - Small centered colored circle
 * - Color-coded by node type
 * 
 * Used when: visibleHeight < 40px
 * 
 * Design:
 * - Fixed 16x16px circle
 * - Centered in container
 * - Subtle glow effect
 */
export const NodeLODBlob = memo(({ type }: NodeLODBlobProps) => {
  const bgColor = BLOB_COLORS[type] || BLOB_COLORS.text;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div
        className={`
          w-4 h-4 rounded-full ${bgColor}
          shadow-lg shadow-current/30
          ring-2 ring-white/20
        `}
      />
    </div>
  );
});

NodeLODBlob.displayName = 'NodeLODBlob';