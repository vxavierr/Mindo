import { StateCreator } from 'zustand';
import { MindoState } from '../useMindoStore';

export type InteractionMode = 'cursor' | 'hand';

export interface UISlice {
  theme: 'dark' | 'light';
  isEditorOpen: boolean;
  activeNodeId: string | null;
  isSidebarCollapsed: boolean;
  isCopilotOpen: boolean;
  isQuickCaptureOpen: boolean;
  interactionMode: InteractionMode;

  toggleTheme: () => void;
  openEditor: (nodeId: string) => void;
  closeEditor: () => void;
  toggleCopilot: () => void;
  toggleSidebar: () => void;
  toggleQuickCapture: () => void;
  setQuickCapture: (isOpen: boolean) => void;
  setInteractionMode: (mode: InteractionMode) => void;
}

export const createUISlice: StateCreator<MindoState, [], [], UISlice> = (set) => ({
  theme: 'dark',
  isEditorOpen: false,
  activeNodeId: null,
  isSidebarCollapsed: false,
  isCopilotOpen: false,
  isQuickCaptureOpen: false,
  interactionMode: 'cursor',

  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  openEditor: (nodeId) => set({ isEditorOpen: true, activeNodeId: nodeId }),
  closeEditor: () => set({ isEditorOpen: false, activeNodeId: null }),
  toggleCopilot: () => set(s => ({ isCopilotOpen: !s.isCopilotOpen })),
  toggleSidebar: () => set(s => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
  toggleQuickCapture: () => set(s => ({ isQuickCaptureOpen: !s.isQuickCaptureOpen })),
  setQuickCapture: (v) => set({ isQuickCaptureOpen: v }),
  setInteractionMode: (mode) => set({ interactionMode: mode }),
});
