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

        <Handle type="target" position={Position.Top} className="!w-12 !h-2 !bg-mindo-glow !rounded-full !-top-[3px] opacity-0 hover:opacity-100 transition-all duration-300 !border-none shadow-[0_0_15px_#a78bfa] z-50" />
        <Handle type="source" position={Position.Bottom} className="!w-4 !h-4 !bg-black !border-2 !border-mindo-glow !bottom-[-8px] shadow-[0_0_15px_#a78bfa] transition-all duration-300 hover:scale-125 cursor-crosshair z-50" />
      </div>
    </div>
  );
});
MindNodeComponent.displayName = 'MindNode';