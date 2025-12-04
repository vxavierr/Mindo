import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { GraphSlice, createGraphSlice } from './slices/createGraphSlice';
import { ReviewSlice, createReviewSlice } from './slices/createReviewSlice';
import { UISlice, createUISlice } from './slices/createUISlice';

// Combined State Type
export type MindoState = GraphSlice & ReviewSlice & UISlice;

export const useMindoStore = create<MindoState>()(
  devtools(
    persist(
      (...a) => ({
        ...createGraphSlice(...a),
        ...createReviewSlice(...a),
        ...createUISlice(...a),
      }),
      {
        name: 'mindo-storage-v12-sliced', 
        partialize: (state) => ({ 
          nodes: state.nodes, 
          edges: state.edges, 
          theme: state.theme,
          metrics: state.metrics
        })
      }
    )
  )
);
