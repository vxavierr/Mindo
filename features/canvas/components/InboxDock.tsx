import React, { useRef, useMemo } from 'react';
import { useMindoStore } from '../../../store/useMindoStore';
import { Inbox, GripVertical, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function InboxDock() {
  const { nodes, deleteNode } = useMindoStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const inboxNodes = useMemo(() =>
    nodes.filter(n => n.data.status === 'inbox'),
    [nodes]);

  const onDragStart = (event: React.DragEvent, nodeId: string) => {
    event.dataTransfer.setData('application/reactflow', nodeId);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNode(id);
  };

  return (
    <div className="absolute right-6 top-20 z-20 pointer-events-none flex flex-col items-end w-80">
      <div className="pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/10 p-3 rounded-xl mb-4 flex items-center gap-2 shadow-lg select-none">
        <Inbox size={16} className="text-mindo-glow" />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
          Entrada ({inboxNodes.length})
        </span>
      </div>

      <div
        ref={scrollRef}
        className={`
            w-full flex flex-col space-y-3 pb-12 overflow-y-auto pr-2 pl-14
            transition-all duration-300 scrollbar-hide
            ${inboxNodes.length > 0 ? 'pointer-events-auto' : 'pointer-events-none'}
        `}
        style={{
          maxHeight: 'calc(100vh - 25rem)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 85%, transparent 100%)'
        }}
      >
        <AnimatePresence mode='popLayout'>
          {inboxNodes.map((node) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              layoutId={node.id}
              draggable
              onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, node.id)}
              className="group relative w-full cursor-grab active:cursor-grabbing"
            >
              <button
                onClick={(e) => handleDelete(e, node.id)}
                className="absolute -left-10 top-1/2 -translate-y-1/2 
                           p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white 
                           rounded-full opacity-0 group-hover:opacity-100 
                           transition-all duration-200 shadow-sm border border-red-500/20 pointer-events-auto z-20"
                title="Remover da Entrada"
              >
                <Trash2 size={14} />
              </button>

              <div className="bg-mindo-depth/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-lg group-hover:border-mindo-glow/40 group-hover:shadow-[0_0_15px_rgba(56,189,248,0.2)] transition-all relative z-10">
                <div className="flex items-start gap-3">
                  <GripVertical size={16} className="text-slate-600 mt-0.5 group-hover:text-mindo-glow transition-colors shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white line-clamp-3 leading-snug break-words">
                      {node.data.label}
                    </p>
                    <span className="text-[10px] text-slate-500 mt-1 block font-mono">
                      Arraste para plantar
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {inboxNodes.length === 0 && (
          <div className="w-full text-center p-6 border-2 border-dashed border-white/5 rounded-2xl text-slate-600 text-xs select-none pointer-events-none ml-[-20px]">
            Nenhum pensamento flutuante.<br />
            Pressione <span className="font-bold text-slate-400">Cmd+K</span> para capturar.
          </div>
        )}
      </div>
    </div>
  );
}