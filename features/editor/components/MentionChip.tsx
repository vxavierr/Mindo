import React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { FileText } from 'lucide-react';
import { useMindoStore } from '../../../store/useMindoStore';

interface MentionChipProps {
    node: {
        attrs: {
            id: string;
            label: string;
        };
    };
    selected: boolean;
}

export function MentionChip({ node, selected }: MentionChipProps) {
    const { openEditor, closeEditor } = useMindoStore();
    const { id, label } = node.attrs;

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Close current editor and open the mentioned node
        closeEditor();
        // Small delay to ensure clean transition
        setTimeout(() => {
            openEditor(id);
        }, 50);
    };

    return (
        <NodeViewWrapper
            as="span"
            className="inline-flex items-center"
        >
            <button
                type="button"
                onClick={handleClick}
                className={`
          inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5
          bg-slate-100 dark:bg-slate-700
          hover:bg-indigo-100 dark:hover:bg-indigo-900/50
          text-slate-700 dark:text-slate-200
          hover:text-indigo-600 dark:hover:text-indigo-300
          rounded-md text-sm font-medium
          transition-colors cursor-pointer
          border border-slate-200 dark:border-slate-600
          ${selected ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}
        `}
                contentEditable={false}
            >
                <FileText size={12} className="flex-shrink-0 opacity-60" />
                <span className="max-w-[120px] truncate">{label || 'Unknown'}</span>
            </button>
        </NodeViewWrapper>
    );
}
