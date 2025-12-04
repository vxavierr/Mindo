import React, { memo } from 'react';
import { MindNodeData } from '../../types';
import { FileText, Mic, AlertCircle } from 'lucide-react';
import { getNodeStyle } from '../../../../utils/styleMap';

interface NodeLODSimpleProps {
  data: MindNodeData;
  selected: boolean;
}

export const NodeLODSimple = memo(({ data, selected }: NodeLODSimpleProps) => {
  const TypeIcon = data.type === 'audio' ? Mic : FileText;

  const styles = getNodeStyle(data.status);

  return (
    <div className={`
      flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border transition-all duration-300
      ${styles.border}
      ${selected ? 'scale-110 border-white ring-1 ring-white/50 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'border-opacity-50'}
    `}>
      {data.status === 'review_due' && <AlertCircle size={12} className="text-red-500 animate-pulse" />}
      {!data.status.includes('review') && <TypeIcon size={12} />}
      
      <span className="text-xs font-bold truncate max-w-[120px] text-slate-200">
        {data.label}
      </span>
    </div>
  );
});