import { supabase } from '../lib/supabase';
import { EdgeDTO } from '../features/canvas/types';
import { Edge } from 'reactflow';

/**
 * Edges API - Supabase CRUD operations for edges
 * 
 * Now includes source_handle and target_handle for persisting
 * which specific handles (Top/Bottom/Left/Right) each edge connects to.
 */
export const edgesApi = {
    async fetchEdges(userId: string) {
        const { data, error } = await supabase
            .from('edges')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        return data as EdgeDTO[];
    },

    async createEdge(edge: Edge, userId: string) {
        const edgeDTO: Partial<EdgeDTO> = {
            id: edge.id,
            user_id: userId,
            source_id: edge.source,
            target_id: edge.target,
            type: 'socratic', // Default type
            label: (edge.data?.semanticLabel || edge.data?.label || edge.label) as string || null,
            is_tentative: false,
            // Persist specific handles
            source_handle: edge.sourceHandle || null,
            target_handle: edge.targetHandle || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        console.log('[edgesApi.createEdge] Creating edge with handles:', {
            id: edge.id,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
        });

        const { data, error } = await supabase
            .from('edges')
            .insert(edgeDTO)
            .select()
            .single();

        if (error) throw error;
        return data as EdgeDTO;
    },

    async updateEdge(id: string, updates: Partial<EdgeDTO>) {
        console.log('[edgesApi.updateEdge] Updating edge:', id, updates);

        const { data, error } = await supabase
            .from('edges')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[edgesApi.updateEdge] Error:', error);
            throw error;
        }
        return data as EdgeDTO;
    },

    /**
     * Update edge handles specifically (for re-connection and layout)
     */
    async updateEdgeHandles(id: string, sourceHandle: string | null, targetHandle: string | null) {
        console.log('[edgesApi.updateEdgeHandles] Updating handles for edge:', id, { sourceHandle, targetHandle });

        const { error } = await supabase
            .from('edges')
            .update({
                source_handle: sourceHandle,
                target_handle: targetHandle,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            console.error('[edgesApi.updateEdgeHandles] Error:', error);
            throw error;
        }
    },

    async deleteEdge(id: string) {
        const { error } = await supabase
            .from('edges')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
