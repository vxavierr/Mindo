import { Node, Edge } from 'reactflow';

export type NodeStatus = 'new' | 'learning' | 'review_due' | 'mastered' | 'inbox';
export type NodeType = 'text' | 'audio';

// Nova estrutura: Unidade de Memória (Flashcard interno)
export interface MemoryUnit {
  id: string;
  question: string;
  answer: string;
  textSegment: string; // O texto exato no conteúdo que serve de âncora
  status: 'new' | 'learning' | 'mastered';
}

export interface MindNodeData {
  label: string;
  type: NodeType;
  status: NodeStatus;
  content?: string; // HTML rico
  memoryUnits?: MemoryUnit[]; // Lista de flashcards associados
  tags?: string[];
  lastReview?: string;
  nextReview?: string;
  createdAt: string;
  weight?: number;
}

export type MindNode = Node<MindNodeData>;

// --- Edge Types ---
export type EdgeType = 'biologic' | 'socratic' | 'semantic';

export interface EdgeData {
  label?: string;
  semanticLabel?: string; // Ex: "Causa", "Contradiz"
  isTentative?: boolean;
}

export type MindEdge = Edge<EdgeData>;
