import React, { memo, useMemo, useState, useCallback } from 'react';
import { NodeProps } from 'reactflow';
import { Video, Play } from 'lucide-react';
import { MindNodeData } from '../../types';
import { NeuralNodeWrapper } from './NeuralNodeWrapper';
import { NodePlaceholder } from './NodePlaceholder';
import { useMindoStore } from '../../../../store/useMindoStore';

/**
 * VideoNode - Renders video content inside NeuralNodeWrapper
 * 
 * Features:
 * - NO auto-scaling - respects container size
 * - NO autoplay - click to play for embeds
 * - Supports YouTube, Vimeo, and direct video files
 * - Can upload file OR paste YouTube URL
 */

/**
 * Helper: Convert various YouTube URL formats to embed URL
 */
function parseYouTubeUrl(url: string): { embedUrl: string; thumbnailUrl: string } | null {
    // Match various YouTube URL formats
    const patterns = [
        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,           // youtube.com/watch?v=ID
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,              // youtube.com/embed/ID
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,                        // youtu.be/ID
        /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,                  // youtube.com/v/ID
        /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,             // youtube.com/shorts/ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            const videoId = match[1];
            return {
                embedUrl: `https://www.youtube.com/embed/${videoId}`,
                thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            };
        }
    }
    return null;
}

export const VideoNode = memo((props: NodeProps<MindNodeData>) => {
    const { id, data, selected, isConnectable } = props;
    const updateNode = useMindoStore((state) => state.updateNode);
    const [showPlayer, setShowPlayer] = useState(false);

    const url = data.url || '';

    // Detect video type and generate appropriate embed URL
    const videoInfo = useMemo(() => {
        if (!url) return null;

        // Check if it's a YouTube URL
        const youtubeInfo = parseYouTubeUrl(url);
        if (youtubeInfo) {
            return {
                type: 'youtube' as const,
                embedUrl: youtubeInfo.embedUrl,
                thumbnailUrl: youtubeInfo.thumbnailUrl
            };
        }

        // Vimeo
        const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
        if (vimeoMatch) {
            return {
                type: 'vimeo' as const,
                embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
                thumbnailUrl: null
            };
        }

        // Direct video file or Supabase Storage
        if (url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || url.includes('mindo-assets')) {
            return {
                type: 'native' as const,
                embedUrl: url,
                thumbnailUrl: null
            };
        }

        // Unknown - treat as iframe embed
        return {
            type: 'embed' as const,
            embedUrl: url,
            thumbnailUrl: null
        };
    }, [url]);

    const hasValidUrl = !!videoInfo;

    // Handle upload completion
    const handleUploadComplete = useCallback((uploadedUrl: string) => {
        updateNode(id, { url: uploadedUrl });
    }, [id, updateNode]);

    // Handle link submission (YouTube URL)
    const handleLinkSubmit = useCallback((linkUrl: string) => {
        // Check if it's a valid YouTube URL and convert to embed
        const youtubeInfo = parseYouTubeUrl(linkUrl);
        if (youtubeInfo) {
            // Store the embed URL directly
            updateNode(id, { url: youtubeInfo.embedUrl });
        } else {
            // Store as-is (might be Vimeo or other)
            updateNode(id, { url: linkUrl });
        }
    }, [id, updateNode]);

    return (
        <NeuralNodeWrapper
            id={id}
            selected={selected ?? false}
            isConnectable={isConnectable}
            label={data.label || 'Vídeo'}
            nodeType={data.type}
            width={(props as any).width || 280}
            height={(props as any).height || 200}
        >
            <div className="flex flex-col h-full p-3">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2 flex-shrink-0">
                    <div className="p-1.5 rounded-lg bg-red-500/20">
                        <Video size={14} className="text-red-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-white truncate flex-1">
                        {data.label || 'Vídeo'}
                    </h3>
                </div>

                {/* Content: Empty State or Video Player */}
                <div className="flex-1 min-h-0 rounded-lg overflow-hidden bg-black/50">
                    {hasValidUrl ? (
                        <div className="relative w-full h-full">
                            {videoInfo.type === 'native' ? (
                                // Native HTML5 video - NO AUTOPLAY
                                <video
                                    src={videoInfo.embedUrl}
                                    className="w-full h-full object-contain"
                                    controls
                                    preload="metadata"
                                    playsInline
                                />
                            ) : showPlayer ? (
                                // Embedded player (YouTube/Vimeo) - shown after click
                                <iframe
                                    src={videoInfo.embedUrl}
                                    title={data.label || 'Video'}
                                    className="w-full h-full"
                                    frameBorder="0"
                                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                // Thumbnail with play button - click to load
                                <button
                                    onClick={() => setShowPlayer(true)}
                                    className="w-full h-full flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors group"
                                >
                                    {videoInfo.thumbnailUrl && (
                                        <img
                                            src={videoInfo.thumbnailUrl}
                                            alt="Video thumbnail"
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    )}
                                    <div className="relative z-10 w-14 h-14 rounded-full bg-red-500/80 flex items-center justify-center group-hover:bg-red-500 group-hover:scale-110 transition-all shadow-lg">
                                        <Play size={24} className="text-white ml-1" fill="white" />
                                    </div>
                                </button>
                            )}
                        </div>
                    ) : (
                        <NodePlaceholder
                            nodeId={id}
                            nodeType="video"
                            icon={<Video size={24} />}
                            label="Adicionar Vídeo"
                            onUploadComplete={handleUploadComplete}
                            onLinkSubmit={handleLinkSubmit}
                            showLinkOption={true}
                        />
                    )}
                </div>
            </div>
        </NeuralNodeWrapper>
    );
});

VideoNode.displayName = 'VideoNode';
