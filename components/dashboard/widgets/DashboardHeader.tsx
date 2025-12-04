import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Zap } from 'lucide-react';
import { useMindoStore } from '../../../store/useMindoStore';
import { AnimatedCard } from '../../ui/PageTransition';

export function DashboardHeader() {
  const navigate = useNavigate();
  const { addNode } = useMindoStore();
  const reviewDueCount = 3; // In a real app, this would come from store selector

  const handleCreateNode = () => {
    addNode("New Thought", "text");
    navigate('/canvas');
  };

  return (
    <AnimatedCard className="flex-none mb-4 flex flex-row justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
          Neural Overview
          <span className="text-xs font-mono font-normal py-1 px-2 rounded-full border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-white/5">
            SYNCED
          </span>
        </h1>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleCreateNode}
          className="flex items-center gap-2 bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition"
        >
          <Plus size={16} /> New Neuron
        </button>
        <button
          onClick={() => navigate('/review')}
          className="group flex items-center gap-2 bg-mindo-primary text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-mindo-glow shadow-[0_0_15px_rgba(107,33,168,0.4)] transition-all"
        >
          <Zap size={16} className="fill-current group-hover:text-white" />
          Review {reviewDueCount}
        </button>
      </div>
    </AnimatedCard>
  );
}