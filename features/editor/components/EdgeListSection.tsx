
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EdgeListSectionProps {
  label: string;
  icon: LucideIcon;
  items: { edge: any, partnerNode: any }[];
}

export const EdgeListSection = ({ label, icon: Icon, items }: EdgeListSectionProps) => (
  <div>
    <span className="text-[10px] text-slate-500 font-bold block mb-2 flex items-center gap-1">
      <Icon size={10} /> {label}
    </span>
    <div className="space-y-2">
      {items.map(({ edge, partnerNode }) => (
        <div key={edge.id} className="flex items-center justify-between p-2 rounded bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 text-xs">
          <span className="text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
            {partnerNode?.data.label || 'Unknown'}
          </span>
          {edge.data?.semanticLabel && (
            <span className="text-[9px] bg-slate-100 dark:bg-black/40 px-1.5 py-0.5 rounded text-slate-500 uppercase tracking-wider">
              {edge.data.semanticLabel}
            </span>
          )}
        </div>
      ))}
      {items.length === 0 && <div className="text-[10px] text-slate-400 italic pl-2">None</div>}
    </div>
  </div>
);
