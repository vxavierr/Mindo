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

export interface GraphSlice {
  nodes: MindNode[];
  edges: Edge<EdgeData>[];
  
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  
  addNode: (label: string, type: 'text' | 'audio', parentId?: string, status?: NodeStatus) => string;
  updateNode: (nodeId: string, data: Partial<MindNodeData>) => void;
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
  nodes: initialNodes,
  edges: [],

  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) as MindNode[] });
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) as Edge<EdgeData>[] });
  },

  addNode: (label, type, parentId, status = 'new') => {
    const newNodeId = `node-${Date.now()}`;
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
         createdAt: new Date().toISOString(), 
         weight: 1,
         content: `<p>${label}</p>`,
         memoryUnits: []
       },
       type: 'mindNode'
    };

    set(state => {
       let newEdges = state.edges;
       if (parentId) {
         const edgeId = `e-${parentId}-${newNodeId}`;
         const newEdge: Edge<EdgeData> = { 
           id: edgeId,
           source: parentId, 
           target: newNodeId, 
           type: 'socratic', 
           data: { isTentative: true } 
         };
         newEdges = addEdge(newEdge, state.edges);
       }
       return { nodes: [...state.nodes, newNode], edges: newEdges };
    });
    return newNodeId;
  },

  updateNode: (nodeId, data) => set(state => ({
      nodes: state.nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n)
  })),

  activateNodeFromInbox: (nodeId, pos) => { 
     set(state => ({
       nodes: state.nodes.map(n => n.id === nodeId 
         ? { ...n, position: pos, data: { ...n.data, status: 'new' } }
         : n
       )
     }));
  },

  deleteNode: (id) => set(state => ({
      nodes: state.nodes.filter(n => n.id !== id),
      edges: state.edges.filter(e => e.source !== id && e.target !== id)
  })),

  deleteNodes: (ids) => set(state => ({
      nodes: state.nodes.filter(n => !ids.includes(n.id)),
      edges: state.edges.filter(e => !ids.includes(e.source) && !ids.includes(e.target))
  })),
  
  onConnect: (params) => {
     const edgeId = `e-${params.source}-${params.target}`;
     const newConnection = { ...params, id: edgeId, type: 'socratic', data: { isTentative: true } };
     set(state => ({
         edges: addEdge(newConnection, state.edges)
     }));
  },

  solidifyEdge: (edgeId, label) => {
    set((state) => ({
      edges: state.edges.map(e => {
        if (e.id === edgeId) {
          const sourceNode = state.nodes.find(n => n.id === e.source);
          const targetNode = state.nodes.find(n => n.id === e.target);
          
          if(sourceNode) get().updateNode(sourceNode.id, { weight: (sourceNode.data.weight || 0) + 1 });
          if(targetNode) get().updateNode(targetNode.id, { weight: (targetNode.data.weight || 0) + 1 });

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

  cancelEdge: (id) => set(state => ({ edges: state.edges.filter(e => e.id !== id) })),

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
  },
  
  unlockNodeContent: (id) => { 
     set(state => ({
       nodes: state.nodes.map(n => n.id === id ? { ...n, data: { ...n.data, lastReview: new Date().toISOString(), status: 'learning' }} : n)
     }));
  },

  addMemoryUnit: (nodeId, unit) => {
      set(state => ({
          nodes: state.nodes.map(n => n.id === nodeId ? {
              ...n,
              data: {
                  ...n.data,
                  memoryUnits: [...(n.data.memoryUnits || []), unit]
              }
          } : n)
      }));
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
  },

  suggestTags: async (nodeId) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const tags = ['#Cognition', '#DeepLearning', '#Structure', '#System', '#Logic'];
      return tags[Math.floor(Math.random() * tags.length)];
  },
});
