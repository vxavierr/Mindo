import React, { memo } from 'react';
import { NodeProps, useStore, Handle, Position, ReactFlowState } from 'reactflow';
import { AnimatePresence, motion } from 'framer-motion';
import { MindNodeData } from '../types';
import { NodeLODDetail } from './nodes/NodeLODDetail';
import { NodeLODSimple } from './nodes/NodeLODSimple';
import { NodeLODBlob } from './nodes/NodeLODBlob';
import { calculateNodeHealth, getHealthStyles } from '../../../utils/bioMechanics';

const zoomSelector = (s: ReactFlowState) => s.transform[2];

export const MindNodeComponent = memo((props: NodeProps<MindNodeData>) => {
  const zoom = useStore(zoomSelector);
  const { id, data, selected } = props;

  const edges = useStore(s => s.edges);
  const connectionCount = edges.filter(e => e.source === id || e.target === id).length;
  const health = calculateNodeHealth(data, connectionCount);
  const styles = getHealthStyles(health, selected);
  const weight = data.weight || 0;
  const sizeScale = 1 + Math.min(weight * 0.05, 0.5);

  let Component;
  let key;

  if (zoom < 0.25) {
    Component = NodeLODBlob;
    key = 'blob';
  } else if (zoom < 0.6) {
    Component = NodeLODSimple;
    key = 'simple';
  } else {
    Component = NodeLODDetail;
    key = 'detail';
  }

  return (
    <div className={`relative ${styles.opacity} ${styles.filter}`}>
      <div style={{ transform: `scale(${sizeScale})` }}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={key}
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(8px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(8px)' }}
            transition={{ type: "spring", stiffness: 200, damping: 20, mass: 0.8 }}
            style={{ transformOrigin: 'center center', pointerEvents: 'all' }}
            className={`${styles.glow} rounded-full`}
          >
            <Component id={id} {...props} />
          </motion.div>
        </AnimatePresence>

        {/* 
          EXTERNAL GRAY BORDER HANDLES
          - Positioned outside node bounds (-3 offset)
          - Invisible by default, gray dashed border on hover
          - Center stays free for dragging
        */}

        {/* Top handle */}
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          className="!absolute !-top-3 !left-0 !w-full !h-3 !bg-transparent !rounded-none !border-0 hover:!border hover:!border-dashed hover:!border-gray-400 !opacity-0 hover:!opacity-100 transition-all duration-200 cursor-crosshair"
          style={{ transform: 'none' }}
        />

        {/* Bottom handle */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          className="!absolute !-bottom-3 !left-0 !w-full !h-3 !bg-transparent !rounded-none !border-0 hover:!border hover:!border-dashed hover:!border-gray-400 !opacity-0 hover:!opacity-100 transition-all duration-200 cursor-crosshair"
          style={{ transform: 'none' }}
        />

        {/* Left handle */}
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          className="!absolute !top-0 !-left-3 !w-3 !h-full !bg-transparent !rounded-none !border-0 hover:!border hover:!border-dashed hover:!border-gray-400 !opacity-0 hover:!opacity-100 transition-all duration-200 cursor-crosshair"
          style={{ transform: 'none' }}
        />

        {/* Right handle */}
        <Handle
          type="source"
          position={Position.Right}
          id="right"
          className="!absolute !top-0 !-right-3 !w-3 !h-full !bg-transparent !rounded-none !border-0 hover:!border hover:!border-dashed hover:!border-gray-400 !opacity-0 hover:!opacity-100 transition-all duration-200 cursor-crosshair"
          style={{ transform: 'none' }}
        />
      </div>
    </div>
  );
});
MindNodeComponent.displayName = 'MindNode';