import React, { useRef, useState } from 'react';
import { Loader2, Upload, Link as LinkIcon, Plus } from 'lucide-react';
import { useFileUpload, FILE_ACCEPT_TYPES, STORAGE_FOLDERS } from '../../../../hooks/useFileUpload';
import { NodeType } from '../../types';

interface NodePlaceholderProps {
    nodeId: string;
    nodeType: NodeType;
    icon: React.ReactNode;
    label: string;
    onUploadComplete: (url: string) => void;
    /** Optional: Allow pasting a URL (for video/image nodes) */
    onLinkSubmit?: (url: string) => void;
    /** Show link input option */
    showLinkOption?: boolean;
}

/**
 * NodePlaceholder - Empty state UI for media nodes
 * 
 * Displays a dashed border placeholder with upload functionality.
 * Optionally shows a link input for YouTube/external URLs.
 */
export function NodePlaceholder({
    nodeId,
    nodeType,
    icon,
    label,
    onUploadComplete,
    onLinkSubmit,
    showLinkOption = false
}: NodePlaceholderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploadFile, isUploading, error } = useFileUpload();
    const [isDragging, setIsDragging] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [showLinkInput, setShowLinkInput] = useState(false);

    const handleClick = () => {
        if (!showLinkInput) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Reset input for next use
        event.target.value = '';

        await processFile(file);
    };

    const processFile = async (file: File) => {
        const folder = STORAGE_FOLDERS[nodeType] || 'misc';
        const publicUrl = await uploadFile(file, folder);

        if (publicUrl) {
            onUploadComplete(publicUrl);
        }
    };

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            await processFile(file);
        }
    };

    const handleLinkSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (linkUrl.trim() && onLinkSubmit) {
            onLinkSubmit(linkUrl.trim());
            setLinkUrl('');
            setShowLinkInput(false);
        }
    };

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept={FILE_ACCEPT_TYPES[nodeType] || '*/*'}
                className="hidden"
                onChange={handleFileChange}
            />

            <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    flex flex-col items-center justify-center
                    w-full h-full min-h-[120px]
                    border-2 border-dashed rounded-lg
                    transition-all duration-200
                    ${isDragging
                        ? 'border-purple-400 bg-purple-500/10'
                        : 'border-gray-500/30 hover:border-gray-400/50 hover:bg-white/5'
                    }
                    ${isUploading ? 'pointer-events-none' : ''}
                    ${showLinkInput ? 'cursor-default' : 'cursor-pointer'}
                `}
            >
                {isUploading ? (
                    <>
                        <Loader2 size={32} className="text-gray-400 animate-spin mb-2" />
                        <span className="text-xs text-gray-400">Enviando...</span>
                    </>
                ) : showLinkInput ? (
                    // Link input mode
                    <form
                        onSubmit={handleLinkSubmit}
                        onClick={(e) => e.stopPropagation()}
                        className="flex flex-col items-center gap-2 p-3 w-full"
                    >
                        <div className="flex items-center gap-1 text-gray-400 mb-1">
                            <LinkIcon size={14} />
                            <span className="text-xs">Colar URL</span>
                        </div>
                        <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            placeholder="https://youtube.com/..."
                            className="w-full px-2 py-1 text-xs bg-black/30 border border-gray-600 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-400"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={!linkUrl.trim()}
                                className="flex items-center gap-1 px-3 py-1 text-xs bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors"
                            >
                                <Plus size={12} />
                                Adicionar
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowLinkInput(false)}
                                className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                ) : (
                    // Default upload mode
                    <>
                        <div className="text-gray-400 mb-2">
                            {icon}
                        </div>
                        <span className="text-xs text-gray-400 text-center mb-1">
                            {label}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <Upload size={10} />
                            <span>Clique ou arraste</span>
                        </div>

                        {/* Link option divider */}
                        {showLinkOption && onLinkSubmit && (
                            <>
                                <div className="flex items-center gap-2 my-2 w-full px-4">
                                    <div className="flex-1 h-px bg-gray-600" />
                                    <span className="text-[10px] text-gray-500 uppercase">ou</span>
                                    <div className="flex-1 h-px bg-gray-600" />
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowLinkInput(true);
                                    }}
                                    className="flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 transition-colors"
                                >
                                    <LinkIcon size={10} />
                                    <span>Colar URL do YouTube</span>
                                </button>
                            </>
                        )}
                    </>
                )}

                {error && (
                    <span className="text-xs text-red-400 mt-2">{error}</span>
                )}
            </div>
        </>
    );
}
