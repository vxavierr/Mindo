import { supabase } from '../lib/supabase';
import { NodeDTO, MindNodeData } from '../features/canvas/types';
import { Node } from 'reactflow';

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
        const nodeDTO: Partial<NodeDTO> = {
            id: node.id,
            user_id: userId,
            title: node.data.label,
            content: node.data.content,
            type: node.data.type || 'text',
            status: node.data.status || 'new',
            tags: node.data.tags || [],
            position_x: node.position.x,
            position_y: node.position.y,
            weight: node.data.weight || 1,
            created_at: node.data.created_at,
            updated_at: node.data.updated_at,
        };

        const { data, error } = await supabase
            .from('nodes')
            .insert(nodeDTO)
            .select()
            .single();

        if (error) throw error;
        return data as NodeDTO;
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

    async deleteNode(id: string) {
        const { error } = await supabase
            .from('nodes')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
