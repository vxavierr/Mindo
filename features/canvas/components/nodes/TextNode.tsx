import React, { memo } from 'react';
import { NodeProps } from 'reactflow';
import { FileText } from 'lucide-react';
import { MindNodeData } from '../../types';
import { NeuralNodeWrapper } from './NeuralNodeWrapper';

/**
 * TextNode - Renders text content inside NeuralNodeWrapper
 * 
 * Displays:
 * - Title as header
 * - Content preview (truncated)
 * - Status indicator
 */
export const TextNode = memo((props: NodeProps<MindNodeData>) => {
    const { id, data, selected } = props;

    // Truncate content for preview (strip HTML tags)
    const contentPreview = data.content
        ? data.content.replace(/<[^>]*>/g, '').slice(0, 100)
        : '';

    return (
        <NeuralNodeWrapper id={id} selected={selected ?? false}>
            <div className="p-3">
                {/* Header with icon */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/20">
                        <FileText size={14} className="text-purple-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-white truncate flex-1">
                        {data.label || 'Sem título'}
                    </h3>
                </div>

                {/* Content Preview */}
                {contentPreview && (
                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                        {contentPreview}
                        {contentPreview.length >= 100 && '...'}
                    </p>
                )}

                {/* Status Badge */}
                {data.status && (
                    <div className="mt-3 flex items-center gap-2">
                        <span className={`
                            text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-full
                            ${data.status === 'mastered' ? 'bg-green-500/20 text-green-400' :
                                data.status === 'learning' ? 'bg-yellow-500/20 text-yellow-400' :
                                    data.status === 'review_due' ? 'bg-red-500/20 text-red-400' :
                                        'bg-gray-500/20 text-gray-400'}
                        `}>
                            {data.status}
                        </span>
                    </div>
                )}
            </div>
        </NeuralNodeWrapper>
    );
});

TextNode.displayName = 'TextNode';
