import React, { memo, ReactNode } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';
import { motion } from 'framer-motion';

export interface NeuralNodeWrapperProps {
    id: string;
    selected: boolean;
    children: ReactNode;
    isConnectable?: boolean;
}

/**
 * HandleZone - Individual proximity zone with animated dot handle
 * 
 * Features:
 * - Invisible trigger zone extends outside node
 * - Dot slides OUT from node on hover (emergence effect)
 * - All handles are type="source" for connectionMode="loose"
 */
interface HandleZoneProps {
    id: string;
    position: Position;
    isConnectable: boolean;
}

function HandleZone({ id, position, isConnectable }: HandleZoneProps) {
    // Zone positioning - extends outside node to create hover area
    const zoneClasses: Record<Position, string> = {
        [Position.Top]: 'absolute -top-6 left-1/2 -translate-x-1/2 w-20 h-8 flex items-start justify-center pt-1',
        [Position.Bottom]: 'absolute -bottom-6 left-1/2 -translate-x-1/2 w-20 h-8 flex items-end justify-center pb-1',
        [Position.Left]: 'absolute -left-6 top-1/2 -translate-y-1/2 w-8 h-20 flex items-center justify-start pl-1',
        [Position.Right]: 'absolute -right-6 top-1/2 -translate-y-1/2 w-8 h-20 flex items-center justify-end pr-1',
    };

    // Dot animation: slides OUT away from node
    const dotBaseClasses: Record<Position, string> = {
        [Position.Top]: 'translate-y-2',    // Hidden: closer to node
        [Position.Bottom]: '-translate-y-2',
        [Position.Left]: 'translate-x-2',
        [Position.Right]: '-translate-x-2',
    };

    const dotHoverClasses: Record<Position, string> = {
        [Position.Top]: 'group-hover:-translate-y-1',    // Visible: slides out
        [Position.Bottom]: 'group-hover:translate-y-1',
        [Position.Left]: 'group-hover:-translate-x-1',
        [Position.Right]: 'group-hover:translate-x-1',
    };

    return (
        <div className={`${zoneClasses[position]} z-50 group pointer-events-auto`}>
            {/* The visible animated dot */}
            <div
                className={`
          w-3.5 h-3.5 rounded-full
          bg-white border-2 border-purple-400
          shadow-lg shadow-purple-500/20
          transition-all duration-200 ease-out
          opacity-0 scale-50
          group-hover:opacity-100 group-hover:scale-100
          ${dotBaseClasses[position]}
          ${dotHoverClasses[position]}
          pointer-events-none
        `}
            />

            {/* The actual React Flow handle - positioned at the dot location */}
            <Handle
                type="source"
                position={position}
                id={`${id}-${position}`}
                isConnectable={isConnectable}
                className={`
          !absolute !w-5 !h-5 !bg-transparent !border-0 !rounded-full
          cursor-crosshair
        `}
                style={{
                    // Position handle at center of zone
                    top: position === Position.Top ? '0' : position === Position.Bottom ? '100%' : '50%',
                    left: position === Position.Left ? '0' : position === Position.Right ? '100%' : '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            />
        </div>
    );
}

/**
 * NeuralNodeWrapper - Single Source of Truth for Node Frame/Handle Logic
 * 
 * Features:
 * - Glassmorphism visual style
 * - Framer Motion entry animations
 * - Selection glow (purple neon)
 * - Proportional resize (keeps aspect ratio)
 * - 4 Animated handle zones with "emergence" effect
 * - All handles are connectable as sources
 */
export const NeuralNodeWrapper = memo(({
    id,
    selected,
    children,
    isConnectable = true
}: NeuralNodeWrapperProps) => {
    // Selection glow styles
    const selectionGlow = selected
        ? 'shadow-[0_0_25px_rgba(168,85,247,0.6)] border-purple-500/50'
        : 'border-white/10';

    return (
        <>
            {/* Proportional Resize - Visible dots when selected */}
            <NodeResizer
                minWidth={150}
                minHeight={100}
                keepAspectRatio={true}
                isVisible={selected}
                lineClassName="!border-transparent"
                handleClassName="!w-3 !h-3 !bg-white !border-2 !border-purple-400 !rounded-full !shadow-lg"
            />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{ width: '100%', height: '100%' }}
            >
                {/* Main Glassmorphism Container */}
                <div
                    className={`
            relative
            bg-black/40 backdrop-blur-md
            border ${selectionGlow}
            rounded-xl
            w-full h-full min-w-[150px] min-h-[100px]
            overflow-hidden
            transition-shadow duration-300
          `}
                >
                    {/* Content Area */}
                    <div className="relative z-10 w-full h-full">
                        {children}
                    </div>
                </div>
            </motion.div>

            {/* 4 Animated Handle Zones - Emergence Effect */}
            <HandleZone id={id} position={Position.Top} isConnectable={isConnectable} />
            <HandleZone id={id} position={Position.Bottom} isConnectable={isConnectable} />
            <HandleZone id={id} position={Position.Left} isConnectable={isConnectable} />
            <HandleZone id={id} position={Position.Right} isConnectable={isConnectable} />
        </>
    );
});

NeuralNodeWrapper.displayName = 'NeuralNodeWrapper';
