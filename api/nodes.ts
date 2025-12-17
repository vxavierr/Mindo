import { supabase } from '../lib/supabase';
import { NodeDTO, MindNodeData } from '../features/canvas/types';
import { Node } from 'reactflow';

/**
 * Nodes API - Supabase CRUD operations for nodes
 * 
 * CRITICAL: Uses JSONB columns for position and data:
 * - position: {"x": number, "y": number}
 * - data: {content?, url?, code?, language?, ...}
 */
export const nodesApi = {
    async fetchNodes(userId: string) {
        const { data, error } = await supabase
            .from('nodes')
            .select('*, memory_units(*)')
            .eq('user_id', userId);

        if (error) throw error;
        return data as NodeDTO[];
    },

    async createNode(node: Node<MindNodeData>, userId: string) {
        // Pack all type-specific fields into the data JSONB column
        const nodeData: Record<string, unknown> = {};

        // Common fields
        if (node.data.content) nodeData.content = node.data.content;
        if (node.data.url) nodeData.url = node.data.url;
        if (node.data.code) nodeData.code = node.data.code;
        if (node.data.language) nodeData.language = node.data.language;

        // Persist style dimensions if present
        if (node.style) {
            nodeData.style = {
                width: node.style.width,
                height: node.style.height
            };
        }

        // Prepare the DTO with JSONB columns
        const nodeDTO = {
            id: node.id,
            user_id: userId,
            title: node.data.label,
            type: node.data.type || 'text',
            status: node.data.status || 'new',
            tags: node.data.tags || [],
            weight: node.data.weight || 1,
            // JSONB columns
            position: { x: node.position.x, y: node.position.y },
            data: nodeData,
            // Timestamps
            created_at: node.data.created_at || new Date().toISOString(),
            updated_at: node.data.updated_at || new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('nodes')
            .insert(nodeDTO)
            .select()
            .single();

        if (error) throw error;
        return data as NodeDTO;
    },

    /**
     * Update node dimensions (width/height) - persisted in data.style
     */
    async updateNodeStyle(id: string, style: { width?: number; height?: number }) {
        // First fetch current data to merge
        const { data: currentNode, error: fetchError } = await supabase
            .from('nodes')
            .select('data')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        // Merge new style with existing data
        const currentData = (currentNode?.data as Record<string, unknown>) || {};
        const mergedData = {
            ...currentData,
            style: {
                ...(currentData.style as Record<string, unknown> || {}),
                ...style
            }
        };

        const { error } = await supabase
            .from('nodes')
            .update({
                data: mergedData,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;
    },

    async updateNode(id: string, updates: Partial<NodeDTO>) {
        const { data, error } = await supabase
            .from('nodes')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as NodeDTO;
    },

    /**
     * Update only the data JSONB field of a node
     * Used for updating content, url, code, etc.
     */
    async updateNodeData(id: string, newData: Partial<MindNodeData>) {
        // First fetch current data to merge
        const { data: currentNode, error: fetchError } = await supabase
            .from('nodes')
            .select('data')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        // Merge new data with existing
        const currentData = (currentNode?.data as Record<string, unknown>) || {};
        const mergedData = {
            ...currentData,
            ...newData
        };

        const { data, error } = await supabase
            .from('nodes')
            .update({
                data: mergedData,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as NodeDTO;
    },

    async updateNodePosition(id: string, position: { x: number; y: number }) {
        console.log('[updateNodePosition] Saving position for node:', id, position);
        const { error } = await supabase
            .from('nodes')
            .update({
                position,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            console.error('[updateNodePosition] Error:', error);
            throw error;
        }
        console.log('[updateNodePosition] Success!');
    },

    async deleteNode(id: string) {
        const { error } = await supabase
            .from('nodes')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
