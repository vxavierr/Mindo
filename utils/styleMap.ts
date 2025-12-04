import { NodeStatus } from '../types';

interface StatusStyle {
  glow: string;   // For NodeLODDetail (Gradient borders)
  border: string; // For NodeLODSimple (Border + Text color)
  blob: string;   // For NodeLODBlob (Background + Shadow)
}

export const NODE_STYLES: Record<NodeStatus, StatusStyle> = {
  new: {
    glow: 'from-blue-500 via-cyan-400 to-blue-500',
    border: 'border-blue-500 text-blue-400',
    blob: 'bg-blue-500 shadow-blue-500/50'
  },
  learning: {
    glow: 'from-yellow-500 via-amber-400 to-yellow-500',
    border: 'border-yellow-500 text-yellow-400',
    blob: 'bg-yellow-500 shadow-yellow-500/50'
  },
  review_due: {
    glow: 'from-red-500 via-rose-400 to-red-500',
    border: 'border-red-500 text-red-400',
    blob: 'bg-red-500 shadow-red-500/50'
  },
  mastered: {
    glow: 'from-emerald-500 via-green-400 to-emerald-500',
    border: 'border-emerald-500 text-emerald-400',
    blob: 'bg-emerald-500 shadow-emerald-500/50'
  },
  inbox: {
    glow: 'from-white via-slate-200 to-white',
    border: 'border-white text-white',
    blob: 'bg-white shadow-white/50'
  }
};

export const getNodeStyle = (status: NodeStatus) => NODE_STYLES[status] || NODE_STYLES.new;
