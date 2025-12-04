import React from 'react';
import { Lock, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMindoStore } from '../../../store/useMindoStore';
import { calculateNodeHealth } from '../../../utils/bioMechanics';

interface CompetenceBlurProps {
  nodeId: string;
  children?: React.ReactNode;
}

export function CompetenceBlur({ nodeId, children }: CompetenceBlurProps) {
  const { nodes, unlockNodeContent } = useMindoStore();
  const node = nodes.find(n => n.id === nodeId);
  
  const health = calculateNodeHealth(node?.data.lastReview, node?.data.status);
  const isLocked = health === 'petrified';

  const handleUnlock = () => {
    unlockNodeContent(nodeId);
  };

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full h-full min-h-[300px]">
      <div className="absolute inset-0 blur-[12px] opacity-30 pointer-events-none select-none overflow-hidden">
        {children}
      </div>

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-black/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl max-w-sm"
        >
          <div className="w-16 h-16 bg-mindo-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-mindo-primary/30">
            <Lock size={32} className="text-mindo-glow" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">Neural Pathway Decayed</h3>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            This memory has petrified due to lack of use. Reactivate the pathway to access the content.
          </p>

          <button 
            onClick={handleUnlock}
            className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <BrainCircuit size={18} />
            Reactivate Pathway
          </button>
        </motion.div>
      </div>
    </div>
  );
}