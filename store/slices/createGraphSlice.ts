import { StateCreator } from 'zustand';
import {
  Edge,
  Connection,
  addEdge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges
} from 'reactflow';
import dagre from 'dagre';
// @ts-ignore
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';
import { MindNode, EdgeData, MindNodeData, NodeStatus, MemoryUnit, NodeType } from '../../types';
import { initialNodes } from '../../data/initialGraph';
import { MindoState } from '../useMindoStore';
import { nodesApi } from '../../api/nodes';
import { edgesApi } from '../../api/edges';
import { memoryUnitsApi } from '../../api/memoryUnits';
import { supabase } from '../../lib/supabase';

const STORAGE_BUCKET = 'mindo-assets';

/**
 * Helper: Extract file path from Supabase Storage URL and delete the file
 * URL format: https://xxx.supabase.co/storage/v1/object/public/mindo-assets/images/file.jpg
 */
async function deleteFileFromStorage(url: string): Promise<void> {
  try {
    // Extract path after bucket name
    const bucketMarker = `${STORAGE_BUCKET}/`;
    const bucketIndex = url.indexOf(bucketMarker);

    if (bucketIndex === -1) {
      console.warn('[deleteFileFromStorage] URL does not contain bucket path:', url);
      return;
    }

    // Get the file path (e.g., "images/file-123.jpg")
    const filePath = url.substring(bucketIndex + bucketMarker.length);

    if (!filePath) {
      console.warn('[deleteFileFromStorage] Could not extract file path from URL');
      return;
    }

    console.log('[deleteFileFromStorage] Deleting:', filePath);

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath]);

    if (error) {
      throw error;
    }

    console.log('[deleteFileFromStorage] Successfully deleted:', filePath);
  } catch (err) {
    console.error('[deleteFileFromStorage] Error:', err);
    throw err;
  }
}

export interface GraphSlice {
  userId: string | null;
  nodes: MindNode[];
  edges: Edge<EdgeData>[];
  isGraphLoaded: boolean;

  setUserId: (id: string) => void;
  loadGraph: (userId: string) => Promise<void>;

  // Direct setters for layout
  setNodes: (nodes: MindNode[]) => void;
  setEdges: (edges: Edge<EdgeData>[]) => void;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  addNode: (label: string, type: NodeType, parentId?: string, status?: NodeStatus, connectionLabel?: string, initialData?: Partial<MindNodeData>) => string;
  addNodeByType: (type: NodeType, position?: { x: number, y: number }) => string;
  updateNode: (nodeId: string, data: Partial<MindNodeData>) => void;
  updateNodePosition: (nodeId: string, position: { x: number, y: number }) => void;
  onResizeEnd: (nodeId: string, dimensions: { width: number, height: number }) => void;
  activateNodeFromInbox: (nodeId: string, position: { x: number, y: number }) => void;
  deleteNode: (nodeId: string) => void;
  deleteNodes: (nodeIds: string[]) => void;
  organizeGraph: () => void;

  // Edge manipulation
  updateEdge: (oldEdge: Edge<EdgeData>, newConnection: Connection) => void;
  updateEdgeHandles: (edgeId: string, sourceHandle: string, targetHandle: string) => void;

  // Socratic/Synapse Logic
  solidifyEdge: (edgeId: string, label: string) => void;
  cancelEdge: (edgeId: string) => void;
  createSolidEdge: (sourceId: string, targetId: string, label: string) => void;

  // Content Logic (Partial)
  unlockNodeContent: (nodeId: string) => void;
  addMemoryUnit: (nodeId: string, unit: MemoryUnit) => void;
  updateMemoryUnit: (nodeId: string, unitId: string, data: Partial<MemoryUnit>) => void;
  suggestTags: (nodeId: string) => Promise<string>;
}

// Type intersection for D3 simulation
type SimulationNode = MindNode & {
  x?: number; y?: number; vx?: number; vy?: number;
};

export const createGraphSlice: StateCreator<MindoState, [], [], GraphSlice> = (set, get) => ({
  userId: null,
  nodes: [], // Start empty, load from DB
  edges: [],
  isGraphLoaded: false,

  setUserId: (id) => set({ userId: id }),

  loadGraph: async (userId) => {
    console.log('[loadGraph] Starting for user:', userId);
    set({ userId });
    try {
      console.log('[loadGraph] Fetching nodes and edges...');
      const [nodesDTO, edgesDTO] = await Promise.all([
        nodesApi.fetchNodes(userId),
        edgesApi.fetchEdges(userId)
      ]);
      console.log('[loadGraph] Fetched', nodesDTO?.length || 0, 'nodes and', edgesDTO?.length || 0, 'edges');

      const nodes: MindNode[] = nodesDTO.map(dto => {
        // Read position from JSONB (fallback to old columns for migration)
        const position = dto.position
          ? { x: (dto.position as any).x || 0, y: (dto.position as any).y || 0 }
          : { x: dto.position_x || 0, y: dto.position_y || 0 };

        // Read polymorphic data from JSONB
        const nodeData = (dto.data as Record<string, any>) || {};

        // Read saved style dimensions from data.style
        const savedStyle = nodeData.style as { width?: number; height?: number } | undefined;

        return {
          id: dto.id,
          position,
          // Apply saved dimensions if they exist
          ...(savedStyle && { style: savedStyle }),
          data: {
            label: dto.title,
            type: dto.type,
            status: dto.status,
            tags: dto.tags,
            weight: dto.weight,
            lastReview: dto.last_review,
            nextReview: dto.next_review,
            created_at: dto.created_at,
            updated_at: dto.updated_at,
            user_id: dto.user_id,
            // Polymorphic fields from data JSONB
            content: nodeData.content || dto.content,  // Fallback to old column
            url: nodeData.url,
            code: nodeData.code,
            language: nodeData.language,
            // Memory units
            memoryUnits: dto.memory_units?.map((mu: any) => ({
              id: mu.id,
              question: mu.front || mu.question,  // Support both old and new column names
              answer: mu.back || mu.answer,
              textSegment: mu.anchor?.segment || mu.text_segment,
              status: mu.status
            })) || []
          },
          type: dto.type || 'text'
        };
      });

      const edges: Edge<EdgeData>[] = edgesDTO.map(dto => ({
        id: dto.id,
        source: dto.source_id,
        target: dto.target_id,
        type: dto.type,
        // Load persisted handles from DB
        sourceHandle: dto.source_handle || undefined,
        targetHandle: dto.target_handle || undefined,
        data: {
          label: dto.label,
          semanticLabel: dto.label || undefined, // Map DB label to semanticLabel
          isTentative: dto.is_tentative
        }
      }));

      set({ nodes, edges, isGraphLoaded: true });
    } catch (error) {
      console.error('Failed to load graph:', error);
      set({ isGraphLoaded: true }); // Set true even on error to prevent infinite loading
    }
  },

  // Direct setters for layout operations
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as MindNode[] });

    // NOTE: Position changes are persisted via onNodeDragStop callback (uses JSONB position column)
    // Do NOT persist position here as it fires on every pixel during drag

    // Persist dimension changes from NodeResizer
    changes.forEach(change => {
      // React Flow emits 'dimensions' changes when resizing
      if (change.type === 'dimensions' && !change.resizing) {
        // resizing: false means resize ended - save to DB
        const node = get().nodes.find(n => n.id === change.id);
        if (node?.style?.width && node?.style?.height) {
          const width = typeof node.style.width === 'number'
            ? node.style.width
            : parseFloat(String(node.style.width));
          const height = typeof node.style.height === 'number'
            ? node.style.height
            : parseFloat(String(node.style.height));

          if (!isNaN(width) && !isNaN(height)) {
            console.log('[onNodesChange] Saving dimensions for node:', change.id, { width, height });
            nodesApi.updateNodeStyle(change.id, { width, height }).catch(console.error);
          }
        }
      }
    });
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) as Edge<EdgeData>[] });
  },

  // Update edge when user drags endpoint to new handle
  updateEdge: (oldEdge, newConnection) => {
    console.log('[updateEdge] Updating edge:', oldEdge.id, 'to:', newConnection);
    set(state => ({
      edges: state.edges.map(e => {
        if (e.id === oldEdge.id) {
          return {
            ...e,
            source: newConnection.source || e.source,
            target: newConnection.target || e.target,
            sourceHandle: newConnection.sourceHandle,
            targetHandle: newConnection.targetHandle,
          };
        }
        return e;
      })
    }));

    // Persist to Supabase
    edgesApi.updateEdge(oldEdge.id, {
      source_id: newConnection.source || oldEdge.source,
      target_id: newConnection.target || oldEdge.target,
      source_handle: newConnection.sourceHandle || null,
      target_handle: newConnection.targetHandle || null,
    }).catch(console.error);
  },

  // Update edge handles (for layout organization)
  updateEdgeHandles: (edgeId, sourceHandle, targetHandle) => {
    set(state => ({
      edges: state.edges.map(e => {
        if (e.id === edgeId) {
          return { ...e, sourceHandle, targetHandle };
        }
        return e;
      })
    }));

    // Persist to Supabase
    edgesApi.updateEdge(edgeId, {
      source_handle: sourceHandle,
      target_handle: targetHandle,
    }).catch(console.error);
  },

  addNode: (label, type, parentId, status = 'new', connectionLabel, initialData) => {
    const userId = get().userId;
    if (!userId) {
      console.error("Cannot create node: No user ID");
      return '';
    }

    const newNodeId = crypto.randomUUID();
    const offset = (Math.random() - 0.5) * 200;

    const parentNode = parentId ? get().nodes.find(n => n.id === parentId) : null;
    const baseX = parentNode ? parentNode.position.x : 0;
    const baseY = parentNode ? parentNode.position.y : 0;

    // Generate type-specific initial data - EMPTY by default to trigger placeholder UI
    const typeDefaults: Record<NodeType, Partial<MindNodeData>> = {
      text: {
        content: initialData?.content || ''
      },
      code: {
        code: initialData?.code || '',
        language: initialData?.language || 'javascript'
      },
      video: {
        url: initialData?.url || ''  // Empty = shows upload placeholder
      },
      image: {
        url: initialData?.url || ''  // Empty = shows upload placeholder
      },
      pdf: {
        url: initialData?.url || ''  // Empty = shows upload placeholder
      }
    };

    // Default dimensions for media nodes (prevents huge auto-sizes)
    const defaultStyles: Record<NodeType, React.CSSProperties | undefined> = {
      text: undefined,  // Auto-size based on content
      code: undefined,  // Auto-size based on content
      video: { width: 320, height: 220 },
      image: { width: 280, height: 200 },
      pdf: { width: 300, height: 420 }  // Vertical A4 ratio for portrait documents
    };

    const newNode: MindNode = {
      id: newNodeId,
      position: { x: baseX + offset, y: baseY + 150 },
      style: defaultStyles[type],  // Add default dimensions
      data: {
        label,
        type,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId,
        weight: 1,
        memoryUnits: [],
        ...typeDefaults[type],
        ...initialData  // Allow overrides
      },
      type: type  // ReactFlow node type - CRITICAL for component selection
    };

    // Optimistic Update
    set(state => {
      let newEdges = state.edges;
      if (parentId) {
        const edgeId = crypto.randomUUID();
        const newEdge: Edge<EdgeData> = {
          id: edgeId,
          source: parentId,
          target: newNodeId,
          type: 'socratic',
          data: {
            isTentative: !connectionLabel, // If label provided, it's not tentative
            semanticLabel: connectionLabel,
            label: connectionLabel
          }
        };
        newEdges = addEdge(newEdge, state.edges);

        // Async create edge
        edgesApi.createEdge(newEdge, userId).catch(console.error);
      }
      return { nodes: [...state.nodes, newNode], edges: newEdges };
    });

    // Async create node
    nodesApi.createNode(newNode, userId).catch(console.error);

    return newNodeId;
  },

  addNodeByType: (type, position) => {
    // Default labels for each type
    const typeLabels: Record<NodeType, string> = {
      text: 'Nova Ideia',
      code: 'Snippet de Código',
      video: 'Vídeo do YouTube',
      image: 'Imagem',
      pdf: 'Documento PDF'
    };

    const label = typeLabels[type] || 'Novo Nó';
    const pos = position || { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 };

    // Call the main addNode with type-specific label
    return get().addNode(label, type, undefined, 'new', undefined, undefined);
  },

  updateNode: (nodeId, data) => {
    // Update local state
    set(state => ({
      nodes: state.nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n)
    }));

    // Persist to Supabase - separate title/status from data JSONB fields
    const nodeUpdates: any = {};
    if (data.label) nodeUpdates.title = data.label;
    if (data.status) nodeUpdates.status = data.status;
    if (data.tags) nodeUpdates.tags = data.tags;

    // Pack polymorphic fields into data JSONB
    const dataUpdates: Partial<MindNodeData> = {};
    if (data.content !== undefined) dataUpdates.content = data.content;
    if (data.url !== undefined) dataUpdates.url = data.url;
    if (data.code !== undefined) dataUpdates.code = data.code;
    if (data.language !== undefined) dataUpdates.language = data.language;

    // Update node metadata if changed
    if (Object.keys(nodeUpdates).length > 0) {
      nodesApi.updateNode(nodeId, nodeUpdates).catch(console.error);
    }

    // Update data JSONB if any polymorphic fields changed
    if (Object.keys(dataUpdates).length > 0) {
      nodesApi.updateNodeData(nodeId, dataUpdates).catch(console.error);
    }
  },

  updateNodePosition: (nodeId, position) => {
    set(state => ({
      nodes: state.nodes.map(n => n.id === nodeId ? { ...n, position, positionAbsolute: position } : n)
    }));
    // Use JSONB position column
    nodesApi.updateNodePosition(nodeId, position).catch(console.error);
  },

  onResizeEnd: (nodeId, dimensions) => {
    console.log('[onResizeEnd] Saving dimensions for node:', nodeId, dimensions);

    // Update local state with new dimensions
    set(state => ({
      nodes: state.nodes.map(n => n.id === nodeId
        ? { ...n, style: { ...n.style, width: dimensions.width, height: dimensions.height } }
        : n
      )
    }));

    // Persist to Supabase
    nodesApi.updateNodeStyle(nodeId, {
      width: dimensions.width,
      height: dimensions.height
    }).catch(err => {
      console.error('[onResizeEnd] Failed to save dimensions:', err);
    });
  },

  activateNodeFromInbox: (nodeId, pos) => {
    set(state => ({
      nodes: state.nodes.map(n => n.id === nodeId
        ? { ...n, position: pos, data: { ...n.data, status: 'new' } }
        : n
      )
    }));
    nodesApi.updateNode(nodeId, {
      position_x: pos.x,
      position_y: pos.y,
      status: 'new'
    }).catch(console.error);
  },

  deleteNode: (id) => {
    // Get the node before deleting to check for files
    const node = get().nodes.find(n => n.id === id);

    // Optimistic UI update - delete from local state immediately
    set(state => ({
      nodes: state.nodes.filter(n => n.id !== id),
      edges: state.edges.filter(e => e.source !== id && e.target !== id)
    }));

    // Delete file from storage if exists (async, non-blocking)
    if (node?.data?.url && node.data.url.includes(STORAGE_BUCKET)) {
      deleteFileFromStorage(node.data.url).catch(err => {
        console.warn('[deleteNode] Failed to delete file from storage:', err);
        // Don't block node deletion - file cleanup is best-effort
      });
    }

    // Delete node from database
    nodesApi.deleteNode(id).catch(console.error);
  },

  deleteNodes: (ids) => {
    // Get nodes before deleting to check for files
    const nodesToDelete = get().nodes.filter(n => ids.includes(n.id));

    // Optimistic UI update
    set(state => ({
      nodes: state.nodes.filter(n => !ids.includes(n.id)),
      edges: state.edges.filter(e => !ids.includes(e.source) && !ids.includes(e.target))
    }));

    // Delete files from storage (async, non-blocking)
    nodesToDelete.forEach(node => {
      if (node?.data?.url && node.data.url.includes(STORAGE_BUCKET)) {
        deleteFileFromStorage(node.data.url).catch(err => {
          console.warn('[deleteNodes] Failed to delete file from storage:', err);
        });
      }
    });

    // Delete nodes from database
    ids.forEach(id => nodesApi.deleteNode(id).catch(console.error));
  },

  onConnect: (params) => {
    const userId = get().userId;
    if (!userId) return;

    const edgeId = crypto.randomUUID();
    const newConnection = {
      ...params,
      id: edgeId,
      type: 'socratic',
      data: { isTentative: true }
    };

    set(state => ({
      edges: addEdge(newConnection, state.edges)
    }));

    // Construct proper Edge object including handle information
    const edge: Edge = {
      id: edgeId,
      source: params.source!,
      target: params.target!,
      sourceHandle: params.sourceHandle || undefined,
      targetHandle: params.targetHandle || undefined,
      type: 'socratic',
      data: { isTentative: true }
    };

    console.log('[onConnect] Creating edge with handles:', {
      id: edgeId,
      sourceHandle: params.sourceHandle,
      targetHandle: params.targetHandle,
    });

    edgesApi.createEdge(edge, userId).catch(console.error);
  },

  solidifyEdge: (edgeId, label) => {
    set((state) => ({
      edges: state.edges.map(e => {
        if (e.id === edgeId) {
          const sourceNode = state.nodes.find(n => n.id === e.source);
          const targetNode = state.nodes.find(n => n.id === e.target);

          if (sourceNode) get().updateNode(sourceNode.id, { weight: (sourceNode.data.weight || 0) + 1 });
          if (targetNode) get().updateNode(targetNode.id, { weight: (targetNode.data.weight || 0) + 1 });

          // Async update DB
          edgesApi.updateEdge(edgeId, {
            label: label,
            is_tentative: false,
            type: 'semantic'
          }).catch(console.error);

          return {
            ...e,
            type: 'semantic',
            animated: false,
            data: { ...e.data, semanticLabel: label, isTentative: false }
          };
        }
        return e;
      })
    }));
  },

  cancelEdge: (id) => {
    set(state => ({ edges: state.edges.filter(e => e.id !== id) }));
    edgesApi.deleteEdge(id).catch(console.error);
  },

  createSolidEdge: (sourceId, targetId, label) => {
    const userId = get().userId;
    if (!userId) return;

    const edgeId = crypto.randomUUID();
    const newEdge: Edge<EdgeData> = {
      id: edgeId,
      source: sourceId,
      target: targetId,
      type: 'semantic',
      data: {
        isTentative: false,
        semanticLabel: label,
        label: label
      }
    };

    set(state => ({
      edges: addEdge(newEdge, state.edges)
    }));

    // Update weights
    const sourceNode = get().nodes.find(n => n.id === sourceId);
    const targetNode = get().nodes.find(n => n.id === targetId);
    if (sourceNode) get().updateNode(sourceId, { weight: (sourceNode.data.weight || 0) + 1 });
    if (targetNode) get().updateNode(targetId, { weight: (targetNode.data.weight || 0) + 1 });

    // Persist to DB
    edgesApi.createEdge(newEdge, userId).catch(console.error);
  },

  organizeGraph: () => {
    const { nodes, edges } = get();
    if (nodes.length === 0) return;

    // Create dagre graph
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({
      rankdir: 'LR',  // Left-to-Right layout
      nodesep: 60,
      ranksep: 100,
      marginx: 50,
      marginy: 50,
    });

    // Add nodes with their dimensions
    nodes.forEach((node) => {
      const width = (node.style?.width as number) || 280;
      const height = (node.style?.height as number) || 150;
      dagreGraph.setNode(node.id, { width, height });
    });

    // Add edges
    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    // Run layout
    dagre.layout(dagreGraph);

    // Update node positions
    const updatedNodes = nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      const width = (node.style?.width as number) || 280;
      const height = (node.style?.height as number) || 150;

      return {
        ...node,
        position: {
          x: nodeWithPosition.x - width / 2,
          y: nodeWithPosition.y - height / 2,
        },
      };
    });

    // Update edge handles for LR direction
    const updatedEdges = edges.map((edge) => ({
      ...edge,
      sourceHandle: `${edge.source}-right`,
      targetHandle: `${edge.target}-left`,
    }));

    console.log('[organizeGraph] Applied dagre layout. Nodes:', updatedNodes.length, 'Edges:', updatedEdges.length);
    set({ nodes: updatedNodes, edges: updatedEdges });

    // Persist positions
    updatedNodes.forEach(node => {
      nodesApi.updateNodePosition(node.id, node.position).catch(console.error);
    });

    // Persist edge handles
    updatedEdges.forEach(edge => {
      edgesApi.updateEdge(edge.id, {
        source_handle: edge.sourceHandle || null,
        target_handle: edge.targetHandle || null,
      }).catch(console.error);
    });
  },

  unlockNodeContent: (id) => {
    set(state => ({
      nodes: state.nodes.map(n => n.id === id ? { ...n, data: { ...n.data, lastReview: new Date().toISOString(), status: 'learning' } } : n)
    }));
    // Sync status update
    nodesApi.updateNode(id, { status: 'learning', last_review: new Date().toISOString() }).catch(console.error);
  },

  addMemoryUnit: (nodeId, unit) => {
    const userId = get().userId;
    set(state => ({
      nodes: state.nodes.map(n => n.id === nodeId ? {
        ...n,
        data: {
          ...n.data,
          memoryUnits: [...(n.data.memoryUnits || []), unit]
        }
      } : n)
    }));

    if (userId) {
      memoryUnitsApi.createMemoryUnit(unit, nodeId, userId).catch(console.error);
    }
  },

  updateMemoryUnit: (nodeId, unitId, data) => {
    set(state => ({
      nodes: state.nodes.map(n => n.id === nodeId ? {
        ...n,
        data: {
          ...n.data,
          memoryUnits: (n.data.memoryUnits || []).map(u => u.id === unitId ? { ...u, ...data } : u)
        }
      } : n)
    }));

    memoryUnitsApi.updateMemoryUnit(unitId, data).catch(console.error);
  },

  suggestTags: async (nodeId) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const tags = ['#Cognition', '#DeepLearning', '#Structure', '#System', '#Logic'];
    return tags[Math.floor(Math.random() * tags.length)];
  },
});
