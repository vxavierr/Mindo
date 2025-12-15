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
// @ts-ignore
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';
import { MindNode, EdgeData, MindNodeData, NodeStatus, MemoryUnit } from '../../types';
import { initialNodes } from '../../data/initialGraph';
import { MindoState } from '../useMindoStore';
import { nodesApi } from '../../api/nodes';
import { edgesApi } from '../../api/edges';
import { memoryUnitsApi } from '../../api/memoryUnits';

export interface GraphSlice {
  userId: string | null;
  nodes: MindNode[];
  edges: Edge<EdgeData>[];

  setUserId: (id: string) => void;
  loadGraph: (userId: string) => Promise<void>;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  addNode: (label: string, type: 'text' | 'audio', parentId?: string, status?: NodeStatus) => string;
  updateNode: (nodeId: string, data: Partial<MindNodeData>) => void;
  updateNodePosition: (nodeId: string, position: { x: number, y: number }) => void;
  activateNodeFromInbox: (nodeId: string, position: { x: number, y: number }) => void;
  deleteNode: (nodeId: string) => void;
  deleteNodes: (nodeIds: string[]) => void;
  organizeGraph: () => void;

  // Socratic/Synapse Logic
  solidifyEdge: (edgeId: string, label: string) => void;
  cancelEdge: (edgeId: string) => void;

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

  setUserId: (id) => set({ userId: id }),

  loadGraph: async (userId) => {
    set({ userId });
    try {
      const [nodesDTO, edgesDTO] = await Promise.all([
        nodesApi.fetchNodes(userId),
        edgesApi.fetchEdges(userId)
      ]);

      const nodes: MindNode[] = nodesDTO.map(dto => ({
        id: dto.id,
        position: { x: dto.position_x, y: dto.position_y },
        data: {
          label: dto.title,
          content: dto.content,
          type: dto.type,
          status: dto.status,
          tags: dto.tags,
          weight: dto.weight,
          lastReview: dto.last_review,
          nextReview: dto.next_review,
          created_at: dto.created_at,
          updated_at: dto.updated_at,
          user_id: dto.user_id,
          memoryUnits: dto.memory_units?.map((mu: any) => ({
            id: mu.id,
            question: mu.question,
            answer: mu.answer,
            textSegment: mu.text_segment,
            status: mu.status
          })) || []
        },
        type: 'mindNode'
      }));

      const edges: Edge<EdgeData>[] = edgesDTO.map(dto => ({
        id: dto.id,
        source: dto.source_id,
        target: dto.target_id,
        type: dto.type,
        data: {
          label: dto.label,
          isTentative: dto.is_tentative
        }
      }));

      set({ nodes, edges });
    } catch (error) {
      console.error('Failed to load graph:', error);
    }
  },

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as MindNode[] });

    // Persist position changes
    changes.forEach(change => {
      if (change.type === 'position' && change.position && !change.dragging) {
        // Only save when dragging stops (or explicit position set)
        // Note: reactflow 'position' change with dragging=false means drag ended
        const node = get().nodes.find(n => n.id === change.id);
        if (node) {
          nodesApi.updateNode(node.id, {
            position_x: node.position.x,
            position_y: node.position.y
          }).catch(console.error);
        }
      }
    });
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) as Edge<EdgeData>[] });
  },

  addNode: (label, type, parentId, status = 'new') => {
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

    const newNode: MindNode = {
      id: newNodeId,
      position: { x: baseX + offset, y: baseY + 150 },
      data: {
        label,
        type,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId,
        weight: 1,
        content: `<p>${label}</p>`,
        memoryUnits: []
      },
      type: 'mindNode'
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
          data: { isTentative: true }
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

  updateNode: (nodeId, data) => {
    set(state => ({
      nodes: state.nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n)
    }));

    // Map MindNodeData to NodeDTO partial
    const updates: any = {};
    if (data.label) updates.title = data.label;
    if (data.content) updates.content = data.content;
    if (data.status) updates.status = data.status;

    if (Object.keys(updates).length > 0) {
      nodesApi.updateNode(nodeId, updates).catch(console.error);
    }
  },

  updateNodePosition: (nodeId, position) => {
    set(state => ({
      nodes: state.nodes.map(n => n.id === nodeId ? { ...n, position, positionAbsolute: position } : n)
    }));
    nodesApi.updateNode(nodeId, { position_x: position.x, position_y: position.y }).catch(console.error);
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
    set(state => ({
      nodes: state.nodes.filter(n => n.id !== id),
      edges: state.edges.filter(e => e.source !== id && e.target !== id)
    }));
    nodesApi.deleteNode(id).catch(console.error);
  },

  deleteNodes: (ids) => {
    set(state => ({
      nodes: state.nodes.filter(n => !ids.includes(n.id)),
      edges: state.edges.filter(e => !ids.includes(e.source) && !ids.includes(e.target))
    }));
    ids.forEach(id => nodesApi.deleteNode(id).catch(console.error));
  },

  onConnect: (params) => {
    const userId = get().userId;
    if (!userId) return;

    const edgeId = crypto.randomUUID();
    const newConnection = { ...params, id: edgeId, type: 'socratic', data: { isTentative: true } };

    set(state => ({
      edges: addEdge(newConnection, state.edges)
    }));

    // We need to construct a proper Edge object to pass to createEdge
    const edge: Edge = {
      id: edgeId,
      source: params.source!,
      target: params.target!,
      type: 'socratic',
      data: { isTentative: true }
    };
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

  organizeGraph: () => {
    const { nodes, edges } = get();

    const d3Nodes = nodes.map(n => ({ ...n })) as SimulationNode[];
    const d3Edges = edges.map(e => ({ ...e }));

    const simulation = forceSimulation<SimulationNode>(d3Nodes)
      .force('charge', forceManyBody<SimulationNode>().strength((d) => -500 - (d.data.weight || 1) * 50))
      .force('center', forceCenter(0, 0))
      .force('collide', forceCollide<SimulationNode>().radius((d) => 100 + (d.data.weight || 1) * 10).iterations(3))
      .force('link', forceLink(d3Edges).id((d: any) => d.id).distance(200))
      .stop();

    for (let i = 0; i < 300; ++i) simulation.tick();

    const updatedNodes = nodes.map(originalNode => {
      const simulatedNode = d3Nodes.find(d => d.id === originalNode.id);
      if (simulatedNode && simulatedNode.x !== undefined && simulatedNode.y !== undefined) {
        return {
          ...originalNode,
          position: { x: simulatedNode.x, y: simulatedNode.y }
        };
      }
      return originalNode;
    });

    set({ nodes: updatedNodes });
    // Bulk update positions? For MVP, let's just update them locally. 
    // Syncing 100+ nodes at once might hit rate limits. 
    // Ideally we'd have a bulkUpdate endpoint.
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
