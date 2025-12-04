
import React, { useState } from 'react';
import { useMindoStore } from '../../../store/useMindoStore';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function FeynmanGuardian() {
  const { isFeynmanModalOpen, cancelNodeMastery, confirmNodeMastery, feynmanTargetNodeId, nodes } = useMindoStore();
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');

  const node = nodes.find(n => n.id === feynmanTargetNodeId);

  const handleSubmit = () => {
    if (explanation.length < 20) {
      setError("Too brief. Explain it like you're teaching a 12-year-old.");
      return;
    }
    confirmNodeMastery(feynmanTargetNodeId!, explanation);
    setExplanation('');
    setError('');
  };

  return (
    <AnimatePresence>
      {isFeynmanModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={cancelNodeMastery}
          />
          
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative bg-[#0F172A] border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-6 border-b border-white/5 flex items-center gap-4">
               <div className="p-3 bg-amber-500/20 rounded-xl border border-amber-500/30 text-amber-400">
                 <GraduationCap size={24} />
               </div>
               <div>
                 <h2 className="text-xl font-bold text-white">The Feynman Gate</h2>
                 <p className="text-amber-200/60 text-xs uppercase tracking-widest font-bold">Verifying Mastery</p>
               </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-slate-300">
                To mark <span className="text-white font-bold">"{node?.data.label}"</span> as Mastered, you must prove you understand it.
              </p>
              
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">Your Simple Explanation</label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain this concept simply, without using jargon..."
                  className="w-full h-32 bg-transparent text-white resize-none outline-none placeholder-slate-600"
                  autoFocus
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm flex items-center gap-2 bg-red-500/10 p-2 rounded-lg">
                  <AlertTriangle size={14} /> {error}
                </div>
              )}
            </div>

            <div className="p-4 bg-black/20 flex justify-end gap-3">
              <button 
                onClick={cancelNodeMastery}
                className="px-4 py-2 text-slate-400 hover:text-white transition font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
              >
                <CheckCircle2 size={16} /> Confirm Mastery
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
