import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer2, Hand, Plus, PlayCircle, Clock, Tag, MousePointerClick } from 'lucide-react';
import { useMindoStore } from '../../../store/useMindoStore';
import { useNavigate } from 'react-router-dom';

export function CanvasToolbar() {
  const navigate = useNavigate();
  const {
    interactionMode,
    setInteractionMode,
    addNode,
    nodes,
    isSelectingForReview,
    startReviewSelection,
    confirmReviewSelection,
    selectionDraft
  } = useMindoStore();

  const [activeMenu, setActiveMenu] = useState<'create' | 'review' | null>(null);
  const [showTagMenu, setShowTagMenu] = useState(false);

  const uniqueTags = Array.from(new Set(nodes.flatMap(n => n.data.tags || []))).slice(0, 5);

  const handleCreateNode = () => {
    addNode("Novo Pensamento", "text");
    setActiveMenu(null);
  };

  const handleReview = (type: 'daily' | 'tags' | 'selection', tag?: string) => {
    if (type === 'daily') {
      navigate('/review');
    } else if (type === 'tags' && tag) {
      navigate('/review');
    } else if (type === 'selection') {
      startReviewSelection();
    }
    setActiveMenu(null);
  };

  const toggleMenu = (menu: 'create' | 'review') => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  if (isSelectingForReview) {
    return (
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-black/80 backdrop-blur-xl border border-mindo-glow/50 p-4 rounded-2xl flex items-center gap-4 shadow-2xl"
        >
          <span className="text-white font-bold text-sm">
            {selectionDraft.length} Selecionados
          </span>
          <button
            onClick={confirmReviewSelection}
            disabled={selectionDraft.length === 0}
            className="bg-mindo-glow text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-white transition disabled:opacity-50"
          >
            Confirmar Revisão
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4">

      <AnimatePresence>
        {activeMenu === 'create' && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-16 bg-white dark:bg-mindo-depth border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl p-2 min-w-[180px] flex flex-col gap-1"
          >
            <button
              onClick={() => { addNode("Nova Ideia", "text"); setActiveMenu(null); }}
              className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-sm text-slate-700 dark:text-slate-200 transition-colors text-left"
            >
              <div className="p-1 bg-purple-500/20 rounded text-purple-500"><Plus size={14} /></div>
              Texto
            </button>
            <button
              onClick={() => { addNode("Snippet de Código", "code"); setActiveMenu(null); }}
              className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-sm text-slate-700 dark:text-slate-200 transition-colors text-left"
            >
              <div className="p-1 bg-cyan-500/20 rounded text-cyan-500"><Plus size={14} /></div>
              Código
            </button>
            <button
              onClick={() => { addNode("Vídeo do YouTube", "video"); setActiveMenu(null); }}
              className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-sm text-slate-700 dark:text-slate-200 transition-colors text-left"
            >
              <div className="p-1 bg-red-500/20 rounded text-red-500"><Plus size={14} /></div>
              Vídeo
            </button>
            <button
              onClick={() => { addNode("Imagem", "image"); setActiveMenu(null); }}
              className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-sm text-slate-700 dark:text-slate-200 transition-colors text-left"
            >
              <div className="p-1 bg-emerald-500/20 rounded text-emerald-500"><Plus size={14} /></div>
              Imagem
            </button>
            <button
              onClick={() => { addNode("Documento PDF", "pdf"); setActiveMenu(null); }}
              className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-sm text-slate-700 dark:text-slate-200 transition-colors text-left"
            >
              <div className="p-1 bg-orange-500/20 rounded text-orange-500"><Plus size={14} /></div>
              PDF
            </button>
          </motion.div>
        )}

        {activeMenu === 'review' && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-16 bg-white dark:bg-mindo-depth border border-slate-200 dark:border-white/10 rounded-xl shadow-2xl p-2 min-w-[200px] flex flex-col gap-1"
          >
            <button
              onClick={() => handleReview('daily')}
              className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-sm text-slate-700 dark:text-slate-200 transition-colors text-left"
            >
              <div className="p-1 bg-emerald-500/10 rounded text-emerald-500"><Clock size={14} /></div>
              Revisão Diária
            </button>

            <div
              className="relative"
              onMouseEnter={() => setShowTagMenu(true)}
              onMouseLeave={() => setShowTagMenu(false)}
            >
              <button
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-sm text-slate-700 dark:text-slate-200 transition-colors text-left"
              >
                <div className="p-1 bg-purple-500/10 rounded text-purple-500"><Tag size={14} /></div>
                Por Tags
              </button>
              <AnimatePresence>
                {showTagMenu && uniqueTags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="absolute bottom-0 left-full ml-2 bg-white dark:bg-mindo-depth border border-slate-200 dark:border-white/10 rounded-xl shadow-xl p-2 min-w-[150px] z-50"
                  >
                    {uniqueTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleReview('tags', tag)}
                        className="block w-full text-left px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded"
                      >
                        {tag}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => handleReview('selection')}
              className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-sm text-slate-700 dark:text-slate-200 transition-colors text-left"
            >
              <div className="p-1 bg-blue-500/10 rounded text-blue-500"><MousePointerClick size={14} /></div>
              Por Seleção
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 p-2 bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(0,0,0,0.5)]">

        <button
          onClick={() => setInteractionMode('cursor')}
          className={`p-3 rounded-xl transition-all duration-300 relative group ${interactionMode === 'cursor'
            ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          title="Cursor"
        >
          <MousePointer2 size={20} className={interactionMode === 'cursor' ? 'fill-current' : ''} />
          {interactionMode === 'cursor' && <motion.div layoutId="dock-active" className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 dark:bg-mindo-glow rounded-full" />}
        </button>

        <button
          onClick={() => setInteractionMode('hand')}
          className={`p-3 rounded-xl transition-all duration-300 relative group ${interactionMode === 'hand'
            ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          title="Hand Tool"
        >
          <Hand size={20} className={interactionMode === 'hand' ? 'fill-current' : ''} />
          {interactionMode === 'hand' && <motion.div layoutId="dock-active" className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 dark:bg-mindo-glow rounded-full" />}
        </button>

        <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1" />

        <button
          onClick={() => toggleMenu('create')}
          className={`p-3 rounded-xl transition-all duration-300 relative hover:bg-slate-100 dark:hover:bg-white/10 ${activeMenu === 'create' ? 'bg-slate-100 dark:bg-white/10 text-indigo-600' : 'text-slate-500 dark:text-slate-400'}`}
        >
          <Plus size={20} />
        </button>

        <button
          onClick={() => toggleMenu('review')}
          className={`p-3 rounded-xl transition-all duration-300 relative hover:bg-slate-100 dark:hover:bg-white/10 ${activeMenu === 'review' ? 'bg-slate-100 dark:bg-white/10 text-indigo-600' : 'text-slate-500 dark:text-slate-400'}`}
        >
          <PlayCircle size={20} />
        </button>

      </div>
    </div>
  );
}