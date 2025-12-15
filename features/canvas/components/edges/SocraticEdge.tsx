import React, { useState, useRef, useEffect } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';
import { useMindoStore } from '../../../../store/useMindoStore';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

export function SocraticEdge({
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
  const { solidifyEdge, cancelEdge } = useMindoStore();
  const [label, setLabel] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (label.trim()) {
        solidifyEdge(id, label.trim());
      } else {
        cancelEdge(id);
      }
    } else if (e.key === 'Escape') {
      cancelEdge(id);
    }
  };

  const handleBlur = () => {
    if (!label.trim()) {
      cancelEdge(id);
    }
  };

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          strokeWidth: 3,
          stroke: '#c084fc',
          strokeDasharray: '5, 5',
          animation: 'dash 1s linear infinite',
          opacity: 0.8,
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {/* @ts-ignore */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="z-50"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-mindo-accent to-mindo-primary rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-200"></div>
              <div className="relative bg-[#02040A] rounded-lg border border-mindo-accent/50 p-1 flex items-center shadow-2xl">
                <div className="bg-mindo-accent/20 p-1 rounded mr-2">
                  <HelpCircle size={14} className="text-mindo-accent animate-pulse" />
                </div>
                <input
                  ref={inputRef}
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  placeholder="Why this connection?"
                  className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-40 font-mono"
                />
                <span className="text-[10px] text-slate-600 px-1 ml-1 border border-white/10 rounded">⏎</span>
              </div>
            </div>
          </motion.div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}