import { useMemo } from 'react';
import { useViewport } from 'reactflow';

export type LODLevel = 'detail' | 'simple' | 'blob';

interface UseNodeLODOptions {
    /** Minimum visible height (in screen pixels) to show full detail */
    detailThreshold?: number;
    /** Minimum visible height (in screen pixels) to show simple view */
    simpleThreshold?: number;
}

/**
 * useNodeLOD - Per-Node Level of Detail based on screen-space size
 * 
 * Game Engine style LOD:
 * - Uses ApparentHeight = NodeHeight * CurrentZoom
 * - Large nodes stay detailed longer when zooming out
 * - Small nodes turn into blobs quickly
 * 
 * @param width Node width in flow units
 * @param height Node height in flow units
 * @param options Optional thresholds
 * @returns Current LOD level and calculated visible height
 */
export function useNodeLOD(
    width: number = 280,
    height: number = 150,
    options: UseNodeLODOptions = {}
): { lodLevel: LODLevel; visibleHeight: number; visibleWidth: number; zoom: number } {
    const { zoom } = useViewport();

    const { detailThreshold = 150, simpleThreshold = 40 } = options;

    return useMemo(() => {
        const visibleHeight = height * zoom;
        const visibleWidth = width * zoom;

        let lodLevel: LODLevel;

        if (visibleHeight > detailThreshold) {
            // Large enough to show full content (TipTap, Video, Code)
            lodLevel = 'detail';
        } else if (visibleHeight >= simpleThreshold) {
            // Medium size: show simplified view (Title + Icon)
            lodLevel = 'simple';
        } else {
            // Too small: show just a colored dot
            lodLevel = 'blob';
        }

        return { lodLevel, visibleHeight, visibleWidth, zoom };
    }, [height, width, zoom, detailThreshold, simpleThreshold]);
}
