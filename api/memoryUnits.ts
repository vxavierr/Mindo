import { supabase } from '../lib/supabase';
import { MemoryUnit } from '../features/canvas/types';

export const memoryUnitsApi = {
    async fetchMemoryUnits(userId: string) {
        const { data, error } = await supabase
            .from('memory_units')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        return data as MemoryUnit[];
    },

    async createMemoryUnit(unit: MemoryUnit, nodeId: string, userId: string) {
        const { data, error } = await supabase
            .from('memory_units')
            .insert({
                id: unit.id,
                user_id: userId,
                node_id: nodeId,
                question: unit.question,
                answer: unit.answer,
                text_segment: unit.textSegment,
                status: unit.status,
                ease_factor: 2.5,
                interval: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateMemoryUnit(id: string, updates: Partial<MemoryUnit>) {
        const dbUpdates: any = { ...updates, updated_at: new Date().toISOString() };

        // Map camelCase to snake_case if necessary
        if (updates.textSegment) {
            dbUpdates.text_segment = updates.textSegment;
            delete dbUpdates.textSegment;
        }

        const { data, error } = await supabase
            .from('memory_units')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteMemoryUnit(id: string) {
        const { error } = await supabase
            .from('memory_units')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
