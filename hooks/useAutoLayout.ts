import { useCallback } from 'react';
import dagre from 'dagre';
import { Node, Edge } from 'reactflow';
import { useMindoStore } from '../store/useMindoStore';
import { MindNode, EdgeData } from '../features/canvas/types';

type LayoutDirection = 'TB' | 'LR';

// Default node dimensions if not set
const DEFAULT_NODE_WIDTH = 280;
const DEFAULT_NODE_HEIGHT = 150;

/**
 * useAutoLayout - Hook for organizing graph using Dagre algorithm
 * 
 * Features:
 * - Hierarchical layout (Top-to-Bottom or Left-to-Right)
 * - Uses saved node dimensions from style
 * - SMART: Updates edge handles to match direction
 *   - LR: source=right, target=left
 *   - TB: source=bottom, target=top
 */
export function useAutoLayout() {
    const nodes = useMindoStore(state => state.nodes);
    const edges = useMindoStore(state => state.edges);
    const setNodes = useMindoStore(state => state.setNodes);
    const setEdges = useMindoStore(state => state.setEdges);

    const organizeGraph = useCallback((direction: LayoutDirection = 'LR') => {
        if (nodes.length === 0) return;

        // Create a new dagre graph
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));

        // Configure layout
        dagreGraph.setGraph({
            rankdir: direction,
            nodesep: 60,   // Horizontal spacing between nodes
            ranksep: 100,  // Vertical spacing between ranks
            marginx: 50,
            marginy: 50,
        });

        // Add nodes to dagre
        nodes.forEach((node) => {
            // Get dimensions from style or use defaults
            const width = (node.style?.width as number) || DEFAULT_NODE_WIDTH;
            const height = (node.style?.height as number) || DEFAULT_NODE_HEIGHT;

            dagreGraph.setNode(node.id, { width, height });
        });

        // Add edges to dagre
        edges.forEach((edge) => {
            dagreGraph.setEdge(edge.source, edge.target);
        });

        // Run the layout algorithm
        dagre.layout(dagreGraph);

        // Map calculated positions back to React Flow nodes
        const layoutedNodes: MindNode[] = nodes.map((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            const width = (node.style?.width as number) || DEFAULT_NODE_WIDTH;
            const height = (node.style?.height as number) || DEFAULT_NODE_HEIGHT;

            return {
                ...node,
                position: {
                    // Dagre gives center position, React Flow needs top-left
                    x: nodeWithPosition.x - width / 2,
                    y: nodeWithPosition.y - height / 2,
                },
            };
        });

        // SMART: Update edge handles based on direction
        const layoutedEdges: Edge<EdgeData>[] = edges.map((edge) => {
            let sourceHandle: string;
            let targetHandle: string;

            if (direction === 'LR') {
                // Left-to-Right: connections go from right side to left side
                sourceHandle = `${edge.source}-right`;
                targetHandle = `${edge.target}-left`;
            } else {
                // Top-to-Bottom: connections go from bottom to top
                sourceHandle = `${edge.source}-bottom`;
                targetHandle = `${edge.target}-top`;
            }

            return {
                ...edge,
                sourceHandle,
                targetHandle,
            };
        });

        // Apply the layout
        console.log('[useAutoLayout] Applying layout:', direction, 'Nodes:', layoutedNodes.length, 'Edges:', layoutedEdges.length);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        // Persist positions to database
        layoutedNodes.forEach(node => {
            useMindoStore.getState().updateNodePosition(node.id, node.position);
        });

        // Persist edge handle updates to database
        layoutedEdges.forEach(edge => {
            useMindoStore.getState().updateEdgeHandles(edge.id, edge.sourceHandle || '', edge.targetHandle || '');
        });

    }, [nodes, edges, setNodes, setEdges]);

    return { organizeGraph };
}
