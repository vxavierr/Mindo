import { supabase } from '../lib/supabase';
import { EdgeDTO } from '../features/canvas/types';
import { Edge } from 'reactflow';

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
            label: edge.label as string || null,
            is_tentative: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('edges')
            .insert(edgeDTO)
            .select()
            .single();

        if (error) throw error;
        return data as EdgeDTO;
    },

    async updateEdge(id: string, updates: Partial<EdgeDTO>) {
        const { data, error } = await supabase
            .from('edges')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as EdgeDTO;
    },

    async deleteEdge(id: string) {
        const { error } = await supabase
            .from('edges')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
