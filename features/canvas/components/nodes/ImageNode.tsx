import React, { memo, useState } from 'react';
import { NodeProps } from 'reactflow';
import { Image as ImageIcon, ImageOff } from 'lucide-react';
import { MindNodeData } from '../../types';
import { NeuralNodeWrapper } from './NeuralNodeWrapper';
import { NodePlaceholder } from './NodePlaceholder';
import { useMindoStore } from '../../../../store/useMindoStore';

/**
 * ImageNode - Renders an image inside NeuralNodeWrapper
 * 
 * Features:
 * - NO auto-scaling - respects container size from React Flow
 * - Uses object-contain to scale without cropping
 * - Default size set in addNode (300x200)
 * - User resize persists via style prop
 */
export const ImageNode = memo((props: NodeProps<MindNodeData>) => {
    const { id, data, selected, isConnectable } = props;
    const updateNode = useMindoStore((state) => state.updateNode);
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const url = data.url || '';
    const hasValidUrl = url.length > 0;

    // Handle upload completion
    const handleUploadComplete = (uploadedUrl: string) => {
        setHasError(false);
        setIsLoading(true);
        updateNode(id, { url: uploadedUrl });
    };

    return (
        <NeuralNodeWrapper id={id} selected={selected ?? false} isConnectable={isConnectable}>
            <div className="flex flex-col h-full p-3">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2 flex-shrink-0">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20">
                        <ImageIcon size={14} className="text-emerald-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-white truncate flex-1">
                        {data.label || 'Imagem'}
                    </h3>
                </div>

                {/* Content: Empty State or Image */}
                <div className="flex-1 min-h-0 rounded-lg overflow-hidden bg-black/30">
                    {hasValidUrl && !hasError ? (
                        <div className="relative w-full h-full">
                            {isLoading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                                </div>
                            )}
                            <img
                                src={url}
                                alt={data.label || 'Image'}
                                className={`
                  w-full h-full object-contain
                  transition-opacity duration-300
                  ${isLoading ? 'opacity-0' : 'opacity-100'}
                `}
                                onLoad={() => setIsLoading(false)}
                                onError={() => {
                                    setHasError(true);
                                    setIsLoading(false);
                                }}
                            />
                        </div>
                    ) : hasError ? (
                        <div className="flex flex-col items-center justify-center h-full py-4 text-gray-500">
                            <ImageOff size={24} className="mb-2 opacity-50" />
                            <span className="text-xs">Falha ao carregar</span>
                            <button
                                onClick={() => {
                                    setHasError(false);
                                    setIsLoading(true);
                                }}
                                className="text-xs text-emerald-400 hover:underline mt-1"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    ) : (
                        <NodePlaceholder
                            nodeId={id}
                            nodeType="image"
                            icon={<ImageIcon size={24} />}
                            label="Adicionar Imagem"
                            onUploadComplete={handleUploadComplete}
                        />
                    )}
                </div>
            </div>
        </NeuralNodeWrapper>
    );
});

ImageNode.displayName = 'ImageNode';
