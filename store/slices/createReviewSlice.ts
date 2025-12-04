import { StateCreator } from 'zustand';
import { MindoState } from '../useMindoStore';
import { 
  ReviewSession, 
  ReviewMode, 
  ReviewGrade, 
  UserMetrics, 
  ObesityLevel, 
  RadarDataPoint 
} from '../../types';
import { initialMetrics } from '../../data/initialGraph';

export interface ReviewSlice {
  // Review Session State
  reviewSession: ReviewSession | null;
  metrics: UserMetrics;
  
  // Selection State
  isSelectingForReview: boolean;
  selectionDraft: string[];

  // Feynman
  isFeynmanModalOpen: boolean;
  feynmanTargetNodeId: string | null;

  // Actions
  attemptNodeMastery: (nodeId: string) => void;
  confirmNodeMastery: (nodeId: string, explanation: string) => void;
  cancelNodeMastery: () => void;

  startReviewSelection: () => void;
  toggleSelectionDraft: (nodeId: string) => void;
  confirmReviewSelection: () => void;
  cancelReviewSelection: () => void;

  startReviewSession: (mode: ReviewMode, tags?: string[], nodeIds?: string[]) => void;
  startPathReview: () => void;
  submitReviewGrade: (nodeId: string, grade: ReviewGrade) => void;
  nextReviewQuestion: () => void;
  prevReviewQuestion: () => void;
  endReviewSession: () => void;

  updateMetrics: (newMetrics: Partial<UserMetrics>) => void;
  calculateObesity: () => ObesityLevel;
  getRadarData: () => RadarDataPoint[];
}

export const createReviewSlice: StateCreator<MindoState, [], [], ReviewSlice> = (set, get) => ({
  reviewSession: null,
  metrics: initialMetrics,
  isSelectingForReview: false,
  selectionDraft: [],
  isFeynmanModalOpen: false,
  feynmanTargetNodeId: null,

  attemptNodeMastery: (id) => set({ isFeynmanModalOpen: true, feynmanTargetNodeId: id }),
  cancelNodeMastery: () => set({ isFeynmanModalOpen: false }),
  
  confirmNodeMastery: (id, text) => {
     set(state => ({
         isFeynmanModalOpen: false,
         nodes: state.nodes.map(n => n.id === id ? { ...n, data: { ...n.data, status: 'mastered' }} : n)
     }));
  },

  startReviewSelection: () => set({ isSelectingForReview: true, selectionDraft: [] }),
  toggleSelectionDraft: (nodeId) => set(state => {
     const exists = state.selectionDraft.includes(nodeId);
     return {
         selectionDraft: exists 
           ? state.selectionDraft.filter(id => id !== nodeId)
           : [...state.selectionDraft, nodeId]
     };
  }),
  confirmReviewSelection: () => {
     const { selectionDraft } = get();
     if (selectionDraft.length > 0) {
        get().startReviewSession('custom_cluster', undefined, selectionDraft);
     }
     set({ isSelectingForReview: false, selectionDraft: [] });
  },
  cancelReviewSelection: () => set({ isSelectingForReview: false, selectionDraft: [] }),

  // Placeholders for complex review logic - in a real app these would be populated
  startReviewSession: (mode, tags, nodeIds) => { 
      // Simplified mock start
      console.log('Starting Review:', mode, tags, nodeIds);
  },
  startPathReview: () => { },
  submitReviewGrade: (nodeId, grade) => { },
  nextReviewQuestion: () => { },
  prevReviewQuestion: () => { },
  endReviewSession: () => set({ reviewSession: null }),

  updateMetrics: (m) => set(s => ({ metrics: { ...s.metrics, ...m } })),
  calculateObesity: () => 'healthy',
  getRadarData: () => []
});
