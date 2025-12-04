import React from 'react';
import { Trash2, Edit, Type } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  nodeIds: string[]; 
  onDelete: (ids: string[]) => void;
  onEdit: (id: string) => void;
  onRename: (id: string) => void;
  onClose: () => void;
}

export function ContextMenu({ x, y, nodeIds, onDelete, onEdit, onRename, onClose }: ContextMenuProps) {
  const isMulti = nodeIds.length > 1;

  return (
    <div 
      style={{ top: y, left: x }} 
      className="fixed z-50 min-w-[200px] bg-mindo-depth/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col p-1 animate-fade-in-up origin-top-left ring-1 ring-white/5"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 mb-1">
        {isMulti ? `${nodeIds.length} Nodes Selected` : 'Node Actions'}
      </div>

      {!isMulti && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(nodeIds[0]); onClose(); }}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
          >
            <Edit size={16} className="text-mindo-glow" />
            <span>Open Editor</span>
          </button>

          <button 
            onClick={(e) => { e.stopPropagation(); onRename(nodeIds[0]); onClose(); }}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-left"
          >
            <Type size={16} className="text-mindo-accent" />
            <span>Quick Rename</span>
          </button>

          <div className="h-px bg-white/10 my-1 mx-2" />
        </>
      )}
      
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(nodeIds); onClose(); }}
        className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors text-left"
      >
        <Trash2 size={16} />
        <span>{isMulti ? `Delete ${nodeIds.length} Neurons` : 'Delete Neuron'}</span>
      </button>
    </div>
  );
}