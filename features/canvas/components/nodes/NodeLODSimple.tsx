import React, { memo } from 'react';
import { FileText, Code, Video, Image, FileIcon } from 'lucide-react';
import { NodeType } from '../../types';

export interface NodeLODSimpleProps {
    label: string;
    type: NodeType;
}

/**
 * Type configuration for icons and colors
 */
const TYPE_CONFIG: Record<NodeType, { icon: React.ElementType; bgColor: string; iconColor: string }> = {
    text: { icon: FileText, bgColor: 'bg-blue-500/20', iconColor: 'text-blue-400' },
    code: { icon: Code, bgColor: 'bg-slate-500/20', iconColor: 'text-slate-400' },
    video: { icon: Video, bgColor: 'bg-red-500/20', iconColor: 'text-red-400' },
    image: { icon: Image, bgColor: 'bg-emerald-500/20', iconColor: 'text-emerald-400' },
    pdf: { icon: FileIcon, bgColor: 'bg-orange-500/20', iconColor: 'text-orange-400' },
};

/**
 * NodeLODSimple - Lightweight simplified node view for medium zoom levels
 * 
 * Shows:
 * - Type icon with color coding
 * - Truncated title
 * - Subtle background color based on type
 * 
 * Used when: 40px <= visibleHeight < 150px
 */
export const NodeLODSimple = memo(({ label, type }: NodeLODSimpleProps) => {
    const config = TYPE_CONFIG[type] || TYPE_CONFIG.text;
    const Icon = config.icon;

    return (
        <div
            className={`
        w-full h-full flex items-center gap-2 p-2
        rounded-lg ${config.bgColor}
        overflow-hidden
      `}
        >
            {/* Type Icon */}
            <div className="flex-shrink-0">
                <Icon size={16} className={config.iconColor} />
            </div>

            {/* Title - truncated */}
            <span className="text-xs font-medium text-white/80 truncate flex-1">
                {label}
            </span>
        </div>
    );
});

NodeLODSimple.displayName = 'NodeLODSimple';
