import React, { memo, useCallback } from 'react';
import { NodeProps } from 'reactflow';
import { FileText } from 'lucide-react';
import { MindNodeData } from '../../types';
import { NeuralNodeWrapper } from './NeuralNodeWrapper';
import { NodePlaceholder } from './NodePlaceholder';
import { useMindoStore } from '../../../../store/useMindoStore';

/**
 * PdfNode - Renders a PDF preview inside NeuralNodeWrapper
 * 
 * Features:
 * - Empty State: Shows upload placeholder
 * - Filled State: Embeds PDF with fallback to download link
 * - Vertical A4 portrait geometry (300x420 default)
 * - Full height content to match container
 */
export const PdfNode = memo((props: NodeProps<MindNodeData>) => {
    const { id, data, selected, isConnectable } = props;
    const updateNode = useMindoStore((state) => state.updateNode);

    const url = data.url || '';
    const hasValidUrl = url.length > 0;

    // Extract filename from URL for display
    const filename = url.split('/').pop()?.split('?')[0] || 'documento.pdf';

    // Handle upload completion
    const handleUploadComplete = useCallback((uploadedUrl: string) => {
        updateNode(id, { url: uploadedUrl });
    }, [id, updateNode]);

    return (
        <NeuralNodeWrapper id={id} selected={selected ?? false} isConnectable={isConnectable}>
            <div className="flex flex-col h-full p-3">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2 flex-shrink-0">
                    <div className="p-1.5 rounded-lg bg-orange-500/20">
                        <FileText size={14} className="text-orange-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-white truncate flex-1">
                        {data.label || 'Documento PDF'}
                    </h3>
                </div>

                {/* Content: Empty State or PDF Preview - takes remaining height */}
                <div className="flex-1 min-h-0 rounded-lg overflow-hidden">
                    {hasValidUrl ? (
                        <div className="relative w-full h-full bg-black/30">
                            {/* PDF Embed - full height of container */}
                            <object
                                data={url}
                                type="application/pdf"
                                className="w-full h-full"
                            >
                                {/* Fallback for browsers that can't embed */}
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <FileText size={32} className="mb-2 opacity-50" />
                                    <p className="text-xs mb-2">Preview não disponível</p>
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-orange-400 hover:text-orange-300 underline"
                                    >
                                        Abrir {filename}
                                    </a>
                                </div>
                            </object>

                            {/* Filename overlay */}
                            <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60 text-[10px] text-gray-400 truncate">
                                {filename}
                            </div>
                        </div>
                    ) : (
                        <NodePlaceholder
                            nodeId={id}
                            nodeType="pdf"
                            icon={<FileText size={24} />}
                            label="Adicionar PDF"
                            onUploadComplete={handleUploadComplete}
                        />
                    )}
                </div>
            </div>
        </NeuralNodeWrapper>
    );
});

PdfNode.displayName = 'PdfNode';
