import { Node, Edge } from 'reactflow';

// --- Domain / Database Types (The Truth) ---

export interface BaseEntity {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export type NodeStatus = 'new' | 'learning' | 'review_due' | 'mastered' | 'inbox';
export type NodeType = 'text' | 'code' | 'video' | 'image' | 'pdf';

export interface MemoryUnit {
  id: string;
  question: string;
  answer: string;
  textSegment: string;
  status: 'new' | 'learning' | 'mastered';
}

// DTO: The shape of a Node in the Database (Supabase)
export interface NodeDTO extends BaseEntity {
  title: string;
  content?: string;  // Legacy column, now uses data.content
  type: NodeType;
  status: NodeStatus;
  tags: string[];

  // Visual State - Legacy columns (for migration support)
  position_x?: number;
  position_y?: number;

  // NEW: JSONB columns for polymorphic architecture
  position?: { x: number; y: number };  // JSONB position
  data?: Record<string, unknown>;       // JSONB polymorphic data

  // SRS / Meta
  last_review: string | null;
  next_review: string | null;
  weight: number;

  memory_units?: MemoryUnit[];
}

// --- Application Types (React Flow & UI) ---

export interface MindNodeData {
  // Core Data
  label: string; // Mapped from title
  content?: string;
  type: NodeType;
  status: NodeStatus;
  tags?: string[];
  memoryUnits?: MemoryUnit[];
  weight?: number;

  // Polymorphic Fields (JSONB in DB)
  url?: string;          // For video, image, pdf nodes
  code?: string;         // For code nodes
  language?: string;     // For code nodes (e.g., 'javascript', 'python')

  // Audit (New fields)
  user_id?: string;
  created_at?: string;
  updated_at?: string;

  // SRS
  lastReview?: string;
  nextReview?: string;
}

export type MindNode = Node<MindNodeData>;

// --- Edge Types ---

export type EdgeType = 'biologic' | 'socratic' | 'semantic';

export interface EdgeDTO extends BaseEntity {
  source_id: string;
  target_id: string;
  type: EdgeType;
  label: string | null;
  is_tentative: boolean;
  source_handle?: string | null;
  target_handle?: string | null;
}

export interface EdgeData {
  label?: string;
  semanticLabel?: string; // Ex: "Causa", "Contradiz"
  isTentative?: boolean;

  // Audit
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export type MindEdge = Edge<EdgeData>;
