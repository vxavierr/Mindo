import React, { useCallback, useState, useEffect, useRef } from 'react';
import ReactFlow, {
  Controls,
  MiniMap,
  NodeTypes,
  EdgeTypes,
  Connection,
  ConnectionMode,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
  NodeMouseHandler,
  PanOnScrollMode,
  Background,
  OnConnectEnd,
  Edge,
  updateEdge as rfUpdateEdge,
} from 'reactflow';
import { LayoutTemplate, BrainCircuit, Share2, MousePointerClick } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import { useMindoStore } from '../../../store/useMindoStore';
import { useAuth } from '../../auth/AuthContext';
import { TextNode } from './nodes/TextNode';
import { CodeNode } from './nodes/CodeNode';
import { VideoNode } from './nodes/VideoNode';
import { ImageNode } from './nodes/ImageNode';
import { PdfNode } from './nodes/PdfNode';
import { BiologicEdge } from './BiologicEdge';
import { SocraticEdge } from './edges/SocraticEdge';
import { SemanticEdge } from './edges/SemanticEdge';
import { InboxDock } from './InboxDock';
import { ContextMenu } from './ContextMenu';
import { CreationDock } from './ui/CreationDock';
import { MindNode } from '../types';
import { useCanvasShortcuts } from '../hooks/useCanvasShortcuts';

const nodeTypes: NodeTypes = {
  text: TextNode,
  code: CodeNode,
  video: VideoNode,
  image: ImageNode,
  pdf: PdfNode,
};

const edgeTypes: EdgeTypes = {
  biologic: BiologicEdge,
  socratic: SocraticEdge,
  semantic: SemanticEdge,
};

function CanvasContent() {
  useCanvasShortcuts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { nodes, edges, theme, interactionMode, isSelectingForReview, selectionDraft, activeNodeId } = useMindoStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
      theme: state.theme,
      interactionMode: state.interactionMode,
      isSelectingForReview: state.isSelectingForReview,
      selectionDraft: state.selectionDraft,
      activeNodeId: state.activeNodeId,
    }))
  );

  const {
    onNodesChange, onEdgesChange, onConnect, openEditor, activateNodeFromInbox,
    organizeGraph, deleteNodes, toggleSelectionDraft, updateNodePosition, addNode, loadGraph, onResizeEnd,
    updateEdge, setEdges
  } = useMindoStore(state => ({
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    openEditor: state.openEditor,
    activateNodeFromInbox: state.activateNodeFromInbox,
    organizeGraph: state.organizeGraph,
    deleteNodes: state.deleteNodes,
    toggleSelectionDraft: state.toggleSelectionDraft,
    updateNodePosition: state.updateNodePosition,
    addNode: state.addNode,
    loadGraph: state.loadGraph,
    onResizeEnd: state.onResizeEnd,
    updateEdge: state.updateEdge,
    setEdges: state.setEdges,
  }));

  const isGraphLoaded = useMindoStore(state => state.isGraphLoaded);

  useEffect(() => {
    if (user && !isGraphLoaded) {
      loadGraph(user.id);
    }
  }, [user, loadGraph, isGraphLoaded]);

  // Read nodeId from URL params
  const { nodeId: urlNodeId } = useParams<{ nodeId?: string }>();

  // Auto-open editor if nodeId is in URL - only after graph is loaded
  useEffect(() => {
    if (urlNodeId && isGraphLoaded) {
      const nodeExists = nodes.some(n => n.id === urlNodeId);
      if (nodeExists) {
        openEditor(urlNodeId);
      }
    }
  }, [urlNodeId, isGraphLoaded, nodes, openEditor]);

  // Bidirectional sync: if editor closes but URL still has node, navigate back to /canvas
  useEffect(() => {
    if (!activeNodeId && location.pathname.includes('/node/')) {
      navigate('/canvas', { replace: true });
    }
  }, [activeNodeId, location.pathname, navigate]);

  const { project, screenToFlowPosition } = useReactFlow();
  const [menu, setMenu] = useState<{ nodeIds: string[]; x: number; y: number } | null>(null);

  const canvasNodes = React.useMemo(() =>
    nodes.filter(n => n.data.status !== 'inbox').map(n => ({
      ...n,
      selected: isSelectingForReview ? selectionDraft.includes(n.id) : n.selected,
      style: {
        ...n.style, // Preserve original style (width, height from resize)
        ...(isSelectingForReview && !selectionDraft.includes(n.id) ? { opacity: 0.3, filter: 'grayscale(1)' } : {})
      }
    })),
    [nodes, isSelectingForReview, selectionDraft]
  );

  const handleNodeClick = useCallback((_: React.MouseEvent, node: MindNode) => {
    if (isSelectingForReview) {
      toggleSelectionDraft(node.id);
    }
  }, [isSelectingForReview, toggleSelectionDraft]);

  const handleNodeDoubleClick = useCallback((_: React.MouseEvent, node: MindNode) => {
    if (!isSelectingForReview) {
      openEditor(node.id);
    }
  }, [openEditor, isSelectingForReview]);

  const handleNodeContextMenu: NodeMouseHandler = useCallback((event, node) => {
    event.preventDefault();
    if (isSelectingForReview) return;

    const isSelected = node.selected;
    const targetIds = isSelected ? nodes.filter(n => n.selected).map(n => n.id) : [node.id];
    if (!targetIds.includes(node.id)) targetIds.push(node.id);

    setMenu({ nodeIds: targetIds, x: event.clientX, y: event.clientY });
  }, [nodes, isSelectingForReview]);

  const onConnectWrapper = useCallback((params: Connection) => onConnect(params), [onConnect]);

  // Drop-to-Create: When connection ends on empty canvas, create a new draft node
  const onConnectEnd: OnConnectEnd = useCallback((event) => {
    const target = event.target as HTMLElement;
    // Only trigger if dropped on the canvas pane (not on a node)
    if (target.classList.contains('react-flow__pane')) {
      const mouseEvent = event as MouseEvent;
      const position = screenToFlowPosition({ x: mouseEvent.clientX, y: mouseEvent.clientY });

      // Create a new draft node at the cursor position
      // The node will be created with a tentative edge via the store's addNode logic
      addNode('Novo Pensamento', 'text', undefined, 'new');
      // Note: Full draft/tentative logic with modal requires store updates
    }
  }, [screenToFlowPosition, addNode]);
  const onDragOver = useCallback((event: React.DragEvent) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }, []);
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const nodeId = event.dataTransfer.getData('application/reactflow');
    if (!nodeId) return;
    const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
    if (reactFlowBounds) {
      const position = project({ x: event.clientX - reactFlowBounds.left, y: event.clientY - reactFlowBounds.top });
      activateNodeFromInbox(nodeId, position);
    }
  }, [project, activateNodeFromInbox]);

  const onNodeDragStop = useCallback((_: React.MouseEvent, node: MindNode) => {
    updateNodePosition(node.id, node.position);
  }, [updateNodePosition]);

  // Handle node resize end - persist new dimensions to Supabase
  const handleResizeEnd = useCallback((_: unknown, params: { id: string; style?: React.CSSProperties }) => {
    if (params.style?.width && params.style?.height) {
      const width = typeof params.style.width === 'number'
        ? params.style.width
        : parseFloat(String(params.style.width));
      const height = typeof params.style.height === 'number'
        ? params.style.height
        : parseFloat(String(params.style.height));

      if (!isNaN(width) && !isNaN(height)) {
        onResizeEnd(params.id, { width, height });
      }
    }
  }, [onResizeEnd]);

  // Edge re-connection handlers
  const edgeUpdateSuccessful = useRef(true);

  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  const onEdgeUpdate = useCallback((oldEdge: Edge, newConnection: Connection) => {
    edgeUpdateSuccessful.current = true;
    // Update edges locally using React Flow's helper and persist
    const updatedEdges = rfUpdateEdge(oldEdge, newConnection, edges);
    setEdges(updatedEdges);
    // Persist to store/Supabase
    updateEdge(oldEdge, newConnection);
  }, [edges, setEdges, updateEdge]);

  const onEdgeUpdateEnd = useCallback((_: MouseEvent | TouchEvent, edge: Edge) => {
    if (!edgeUpdateSuccessful.current) {
      // Edge update was cancelled (dropped on empty space) - optionally delete the edge
      console.log('[onEdgeUpdateEnd] Edge update cancelled');
    }
    edgeUpdateSuccessful.current = true;
  }, []);

  const handleAddChildNode = useCallback((parentId: string) => {
    const parentNode = nodes.find(n => n.id === parentId);
    if (!parentNode) return;

    // Create child with offset
    addNode('Novo Conceito', 'text', parentId, 'new');
  }, [nodes, addNode]);

  const isHandMode = interactionMode === 'hand';
  const rfProps = {
    panOnDrag: true,
    selectionOnDrag: !isHandMode && !isSelectingForReview,
    nodesDraggable: !isHandMode && !isSelectingForReview,
    elementsSelectable: !isHandMode,
    panOnScroll: true,
    zoomOnScroll: true,
    panOnScrollMode: PanOnScrollMode.Free,
  };

  return (
    <div className={`h-full w-full relative bg-[#F1F5F9] dark:bg-mindo-void overflow-hidden transition-colors duration-500 ${isHandMode ? 'cursor-grab active:cursor-grabbing' : ''}`} onClick={() => setMenu(null)}>

      <AnimatePresence>
        {isSelectingForReview && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 z-10 pointer-events-none flex items-center justify-center"
          >
            <div className="mt-[-20%] px-6 py-3 bg-black/80 rounded-full border border-mindo-glow text-mindo-glow font-bold flex items-center gap-3 shadow-[0_0_30px_rgba(56,189,248,0.4)]">
              <MousePointerClick size={20} className="animate-bounce" />
              Selecione neurônios para revisar
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <InboxDock />

      <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none flex justify-center z-20 items-center gap-4">
        <div className="flex items-center gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-2 rounded-full border border-slate-200 dark:border-white/10 shadow-sm pointer-events-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
            <BrainCircuit size={14} className="text-mindo-primary" />
            <span>{canvasNodes.length} Neurônios</span>
          </div>
          <div className="w-px h-3 bg-slate-300 dark:bg-white/20" />
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
            <Share2 size={14} className="text-mindo-accent" />
            <span>{edges.length} Sinapses</span>
          </div>
        </div>
        <button
          onClick={organizeGraph}
          className="pointer-events-auto bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-full border border-slate-200 dark:border-white/10 flex items-center gap-2 font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
        >
          <LayoutTemplate size={14} /> Organizar
        </button>
      </div>

      <ReactFlow
        nodes={canvasNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnectWrapper}
        onConnectEnd={onConnectEnd}
        onEdgeUpdate={onEdgeUpdate}
        onEdgeUpdateStart={onEdgeUpdateStart}
        onEdgeUpdateEnd={onEdgeUpdateEnd}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onNodeContextMenu={handleNodeContextMenu}
        onNodeDragStop={onNodeDragStop}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={{
          type: 'semantic',
          markerEnd: { type: MarkerType.ArrowClosed, color: '#9ca3af' }
        }}
        fitView
        className="z-0 react-flow transition-all duration-700"
        minZoom={0.02}
        maxZoom={4}
        {...rfProps}
      >
        <Background
          color={theme === 'dark' ? '#334155' : '#cbd5e1'}
          gap={40}
          size={1}
          className="opacity-40"
        />
        <Controls className="!bg-white dark:!bg-slate-800 !border-slate-200 dark:border-white/10 !mb-24" />
        <MiniMap className="!bg-white dark:!bg-slate-800 !border-slate-200 dark:border-white/10 !rounded-lg !mb-24" />
      </ReactFlow>

      <CreationDock />

      {menu && (
        <ContextMenu
          {...menu}
          onDelete={(ids) => { deleteNodes(ids); setMenu(null); }}
          onEdit={(id) => { openEditor(id); setMenu(null); }}
          onRename={() => setMenu(null)}
          onAddChild={(id) => { handleAddChildNode(id); setMenu(null); }}
          onClose={() => setMenu(null)}
        />
      )}
    </div>
  );
}

export function CanvasPage() {
  return (
    <ReactFlowProvider>
      <CanvasContent />
    </ReactFlowProvider>
  );
}