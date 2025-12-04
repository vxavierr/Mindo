import React from 'react';
import { X, Share2, BrainCircuit, GripVertical, ArrowUpRight, ArrowDownLeft, Clock, Tag, Sparkles } from 'lucide-react';
import { NeuralEditor } from './NeuralEditor';
import { useMindoStore } from '../../../store/useMindoStore';
import { CompetenceBlur } from './CompetenceBlur';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { EditorProvider, useEditorContext } from './EditorContext';
import { MemoryUnitCard } from './MemoryUnitCard';
import { EdgeListSection } from './EdgeListSection';

interface EditorDrawerProps {
  nodeId: string;
  onClose: () => void;
}

function EditorDrawerContent({ nodeId, onClose }: EditorDrawerProps) {
  const { nodes, edges, updateNode, suggestTags } = useMindoStore();
  const { isSuggesting, setIsSuggesting } = useEditorContext();
  
  const node = nodes.find((n) => n.id === nodeId);

  if (!node) return null;

  const memoryUnits = node.data.memoryUnits || [];
  
  const incomingEdges = edges
    .filter(e => e.target === nodeId)
    .map(e => ({ edge: e, partnerNode: nodes.find(n => n.id === e.source) }));
    
  const outgoingEdges = edges
    .filter(e => e.source === nodeId)
    .map(e => ({ edge: e, partnerNode: nodes.find(n => n.id === e.target) }));

  const handleSuggestTag = async () => {
      setIsSuggesting(true);
      const tag = await suggestTags(nodeId);
      if(tag && !node.data.tags?.includes(tag)) {
          updateNode(nodeId, { tags: [...(node.data.tags || []), tag] });
      }
      setIsSuggesting(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-mindo-void overflow-hidden"
    >
      
      <div className="h-16 border-b border-slate-200 dark:border-white/5 flex justify-between items-center px-8 bg-white dark:bg-[#050505]">
         <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-mindo-glow shadow-[0_0_8px_#6366f1]" />
             <span className="text-sm font-bold text-slate-700 dark:text-white tracking-tight">Active Neural Pathway</span>
         </div>
         <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 font-mono hidden md:block">Press ESC to close</span>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition text-slate-400 hover:text-slate-800 dark:hover:text-white">
                <X size={24} />
            </button>
         </div>
      </div>

      <div className="flex-1 flex min-h-0">
         <div className="flex-[0.7] flex flex-col border-r border-slate-200 dark:border-white/5 bg-white dark:bg-transparent overflow-y-auto custom-scrollbar">
             <div className="max-w-4xl w-full mx-auto p-10 pb-4">
                 <input
                    type="text"
                    value={node.data.label}
                    onChange={(e) => updateNode(nodeId, { label: e.target.value })}
                    className="text-5xl font-extrabold text-slate-800 dark:text-white w-full outline-none bg-transparent placeholder-slate-300 dark:placeholder-slate-700 leading-tight mb-6"
                    placeholder="Untitled Neuron"
                 />
                 
                 <div className="flex flex-wrap gap-2 items-center mb-6">
                    {node.data.tags?.map((tag) => (
                        <span key={tag} className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-medium border border-slate-200 dark:border-white/5 flex items-center gap-1.5">
                            <Tag size={10} className="opacity-50" /> {tag}
                        </span>
                    ))}
                    <button 
                        onClick={handleSuggestTag}
                        disabled={isSuggesting}
                        className="text-indigo-500 dark:text-mindo-glow hover:bg-indigo-50 dark:hover:bg-mindo-primary/10 text-xs font-medium flex items-center gap-1 transition-colors px-3 py-1 rounded-full border border-dashed border-indigo-200 dark:border-mindo-glow/30"
                    >
                        {isSuggesting ? <span className="animate-spin">⏳</span> : <Sparkles size={10} />}
                        {isSuggesting ? 'Thinking...' : 'Add Tag'}
                    </button>
                 </div>
             </div>

             <div className="flex-1 px-4 max-w-4xl w-full mx-auto">
                 <CompetenceBlur nodeId={nodeId}>
                    <NeuralEditor
                        nodeId={nodeId}
                        initialContent={node.data.content || '<p>Start linking your thoughts...</p>'}
                        memoryUnits={memoryUnits}
                    />
                 </CompetenceBlur>
             </div>
         </div>

         <div className="flex-[0.3] bg-slate-50/80 dark:bg-[#02040A] flex flex-col min-h-0 overflow-y-auto border-l border-white/5">
             
             <div className="p-6 border-b border-slate-200 dark:border-white/5">
                 <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                         <BrainCircuit size={14} /> Memory Units
                     </h3>
                     <span className="text-[10px] bg-slate-200 dark:bg-white/10 px-1.5 py-0.5 rounded text-slate-500">{memoryUnits.length}</span>
                 </div>
                 
                 <div className="space-y-3">
                     {memoryUnits.length > 0 ? (
                         memoryUnits.map(unit => (
                            <MemoryUnitCard 
                                key={unit.id} 
                                unit={unit} 
                                nodeId={nodeId} 
                            />
                         ))
                     ) : (
                         <div className="py-6 px-4 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-xl text-center">
                             <p className="text-xs text-slate-400">No memory units detected.</p>
                             <p className="text-[10px] text-slate-500 mt-1">Select text in editor to create.</p>
                         </div>
                     )}
                 </div>
             </div>

             <div className="p-6 border-b border-slate-200 dark:border-white/5">
                 <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Share2 size={14} /> Synaptic Network
                 </h3>
                 
                 <div className="mb-4">
                   <EdgeListSection label="INCOMING" icon={ArrowDownLeft} items={incomingEdges} />
                 </div>

                 <div>
                   <EdgeListSection label="OUTGOING" icon={ArrowUpRight} items={outgoingEdges} />
                 </div>
             </div>

             <div className="p-6 mt-auto bg-slate-100/50 dark:bg-white/[0.02]">
                 <div className="flex flex-col gap-2 text-[10px] text-slate-400 font-mono mb-4">
                     <div className="flex items-center gap-2"><Clock size={10} /> Created: {format(new Date(node.data.createdAt), 'MMM d, yyyy HH:mm')}</div>
                     <div className="flex items-center gap-2"><GripVertical size={10} /> ID: {node.id}</div>
                 </div>
                 <button className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-3 rounded-xl text-sm font-bold shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2">
                    <Sparkles size={16} className="fill-white/20" /> AI Enhance
                </button>
             </div>
         </div>
      </div>
    </motion.div>
  );
}

export function EditorDrawer(props: EditorDrawerProps) {
  return (
    <EditorProvider>
      <EditorDrawerContent {...props} />
    </EditorProvider>
  );
}