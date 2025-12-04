import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { MindNodeData } from '../../types';
import { getNodeStyle } from '../../../../utils/styleMap';

interface NodeLODBlobProps {
  data: MindNodeData;
  selected: boolean;
}

export const NodeLODBlob = memo(({ data, selected }: NodeLODBlobProps) => {
  const styles = getNodeStyle(data.status);

  return (
    <div className="relative group flex items-center justify-center">
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: Math.random() * 2 
        }}
        className={`w-6 h-6 rounded-full ${styles.blob} shadow-[0_0_15px] ${selected ? 'ring-2 ring-white scale-125' : ''}`}
      />
    </div>
  );
});