
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, Tag, Play, Clock, ArrowRight } from 'lucide-react';
import { useMindoStore } from '../../../store/useMindoStore';
import { ReviewMode } from '../../review/types';
import { PageWrapper, AnimatedCard } from '../../../components/ui/PageTransition';

export function ReviewLobby() {
  const navigate = useNavigate();
  const { nodes, startReviewSession } = useMindoStore();
  const [selectedMode, setSelectedMode] = useState<ReviewMode>('daily');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const reviewDueCount = nodes.filter(n => n.data.status === 'review_due').length;
  const allTags = Array.from(new Set(nodes.flatMap(n => n.data.tags || []))) as string[];

  const handleStart = () => {
    startReviewSession(selectedMode, selectedTags);
    navigate('/review/session');
  };

  return (
    <PageWrapper className="flex items-center justify-center min-h-full">
      <div className="max-w-2xl w-full">
        <AnimatedCard className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 dark:bg-mindo-surface border border-indigo-100 dark:border-mindo-glow/30 rounded-3xl mb-6 shadow-xl shadow-indigo-500/20 dark:shadow-[0_0_30px_rgba(107,33,168,0.4)] relative">
            <div className="absolute inset-0 bg-indigo-400/20 dark:bg-mindo-glow blur-xl opacity-20 rounded-3xl" />
            <BrainCircuit size={40} className="text-indigo-600 dark:text-mindo-accent relative z-10" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
            Neural Review
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            Strengthen connections via Active Recall.
          </p>
        </AnimatedCard>

        {/* Mode Selection */}
        <AnimatedCard className="space-y-4 mb-10">
          
          <button
            onClick={() => setSelectedMode('daily')}
            className={`w-full p-5 rounded-2xl border transition-all duration-300 group ${
              selectedMode === 'daily'
                ? 'bg-indigo-50 dark:bg-mindo-primary/20 border-indigo-200 dark:border-mindo-glow/50 shadow-lg dark:shadow-[0_0_20px_rgba(107,33,168,0.2)]'
                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:bg-white/10 dark:hover:border-white/20 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${selectedMode === 'daily' ? 'bg-indigo-600 dark:bg-mindo-primary text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'}`}>
                <Clock size={24} />
              </div>
              <div className="text-left flex-1">
                <div className="font-bold text-slate-800 dark:text-white text-lg">
                  Daily Review
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {reviewDueCount} items overdue
                </div>
              </div>
              {reviewDueCount > 0 && (
                <span className="bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 text-sm font-bold px-3 py-1 rounded-full animate-pulse">
                  {reviewDueCount} Due
                </span>
              )}
            </div>
          </button>

          <button
            onClick={() => setSelectedMode('custom_tags')}
            className={`w-full p-5 rounded-2xl border transition-all duration-300 ${
              selectedMode === 'custom_tags'
                 ? 'bg-indigo-50 dark:bg-mindo-primary/20 border-indigo-200 dark:border-mindo-glow/50 shadow-lg dark:shadow-[0_0_20px_rgba(107,33,168,0.2)]'
                : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:bg-white/10 dark:hover:border-white/20 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${selectedMode === 'custom_tags' ? 'bg-indigo-600 dark:bg-mindo-primary text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'}`}>
                <Tag size={24} />
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-800 dark:text-white text-lg">
                  By Tags
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Specific topics focus
                </div>
              </div>
            </div>
          </button>

          {selectedMode === 'custom_tags' && allTags.length > 0 && (
            <div className="ml-20 flex flex-wrap gap-2 animate-fade-in">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setSelectedTags(prev =>
                      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                    );
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                    selectedTags.includes(tag)
                      ? 'bg-indigo-600 dark:bg-mindo-accent text-white dark:text-mindo-depth border-indigo-600 dark:border-mindo-accent'
                      : 'bg-white dark:bg-black/30 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </AnimatedCard>

        <AnimatedCard>
          <button
            onClick={handleStart}
            disabled={selectedMode === 'custom_tags' && selectedTags.length === 0}
            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-mindo-primary dark:to-indigo-600 hover:to-indigo-500 disabled:opacity-50 disabled:grayscale text-white font-bold text-lg rounded-2xl shadow-xl shadow-indigo-500/30 dark:shadow-[0_0_40px_rgba(107,33,168,0.5)] transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Play size={24} fill="currentColor" />
            <span className="relative z-10">Start Session</span>
            <ArrowRight className="group-hover:translate-x-1 transition-transform relative z-10" />
          </button>
        </AnimatedCard>
      </div>
    </PageWrapper>
  );
}
