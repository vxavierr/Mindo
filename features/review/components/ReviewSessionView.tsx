import React from 'react';
import { X, Mic, Send, Sparkles, AlertCircle } from 'lucide-react';
import { ReviewGrade } from '../../review/types';

export interface ReviewSessionViewProps {
  questionData: {
    question: string;
    sourceText: string;
    relevantSegment: string;
    relatedNodes: string[];
  };
  step: 'question' | 'feedback';
  currentQuestionIndex: number;
  totalQuestions: number;
  userAnswer: string;
  onAnswerChange: (value: string) => void;
  onSubmitAnswer: () => void;
  onGrade: (grade: ReviewGrade) => void;
  onExit: () => void;
}

interface GradeOption {
  id: ReviewGrade;
  label: string;
  colorClass: string;
}

const GRADE_OPTIONS: GradeOption[] = [
  { 
    id: 'fail', 
    label: 'Forgot', 
    colorClass: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20' 
  },
  { 
    id: 'hard', 
    label: 'Hard', 
    colorClass: 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-500/20' 
  },
  { 
    id: 'good', 
    label: 'Good', 
    colorClass: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20' 
  },
  { 
    id: 'easy', 
    label: 'Easy', 
    colorClass: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20' 
  },
];

export function ReviewSessionView({
  questionData,
  step,
  currentQuestionIndex,
  totalQuestions,
  userAnswer,
  onAnswerChange,
  onSubmitAnswer,
  onGrade,
  onExit
}: ReviewSessionViewProps) {
  
  const renderRedactedText = () => {
    const { sourceText, relevantSegment } = questionData;
    const parts = sourceText.split(relevantSegment);

    return (
      <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg font-medium">
        {parts[0] && (
          <span className={`transition-all duration-700 ${
            step === 'feedback' ? 'blur-[0px] opacity-100' : 'blur-[8px] opacity-20 select-none'
          }`}>
            {parts[0]}
          </span>
        )}
        
        <span className={`transition-all duration-500 px-1 rounded mx-1 ${
          step === 'feedback'
            ? 'bg-mindo-primary/20 text-indigo-700 dark:text-mindo-accent font-bold shadow-[0_0_15px_rgba(167,139,250,0.3)]'
            : 'bg-slate-200 dark:bg-white/10 text-transparent select-none blur-sm'
        }`}>
          {relevantSegment}
        </span>

        {parts[1] && (
          <span className={`transition-all duration-700 ${
            step === 'feedback' ? 'blur-[0px] opacity-100' : 'blur-[8px] opacity-20 select-none'
          }`}>
            {parts[1]}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-[#030014] flex flex-col items-center overflow-y-auto transition-colors duration-500">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      <div className="w-full max-w-5xl p-8 flex justify-between items-center z-10">
        <div className="flex gap-2">
           {Array.from({ length: totalQuestions }).map((_, i) => (
             <div key={i} className={`h-1.5 w-10 rounded-full transition-all duration-500 ${
               i < currentQuestionIndex 
                ? 'bg-mindo-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]' 
                : i === currentQuestionIndex 
                  ? 'bg-slate-400 dark:bg-white animate-pulse' 
                  : 'bg-slate-200 dark:bg-white/10'
             }`} />
           ))}
        </div>
        <button onClick={onExit} className="p-3 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/5 shadow-sm">
          <X size={20} />
        </button>
      </div>

      <main className="flex-1 w-full max-w-5xl p-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start z-10">
        <div className="space-y-8 flex flex-col h-full justify-center">
          <div className="space-y-4">
             <div className="flex gap-2">
                {questionData.relatedNodes.map(tag => (
                  <span key={tag} className="text-[10px] font-bold text-indigo-600 dark:text-mindo-accent uppercase tracking-widest bg-indigo-50 dark:bg-mindo-surface px-3 py-1 rounded border border-indigo-100 dark:border-mindo-glow/20">
                    {tag}
                  </span>
                ))}
             </div>
             <h2 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-slate-400 leading-tight">
               {questionData.question}
             </h2>
          </div>

          {step === 'question' ? (
            <div className="space-y-6 animate-fade-in-up">
              <div className="relative group">
                <textarea
                  value={userAnswer}
                  onChange={(e) => onAnswerChange(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full h-64 p-6 rounded-3xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-mindo-primary/50 focus:ring-4 focus:ring-mindo-primary/10 transition-all resize-none text-xl text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 outline-none shadow-xl shadow-slate-200/50 dark:shadow-none"
                  autoFocus
                />
                <button className="absolute bottom-6 right-6 p-3 bg-slate-100 dark:bg-mindo-primary/20 rounded-full hover:bg-slate-200 dark:hover:bg-mindo-primary/40 text-indigo-600 dark:text-mindo-accent transition border border-slate-200 dark:border-mindo-primary/30">
                  <Mic size={20} />
                </button>
              </div>
              <button
                onClick={onSubmitAnswer}
                disabled={!userAnswer}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:grayscale font-bold text-lg rounded-2xl shadow-xl shadow-indigo-500/30 transition-all flex items-center justify-center gap-3 transform active:scale-[0.98]"
              >
                <Send size={20} /> Check Answer
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in-up">
              <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-none">
                <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-3 tracking-wider">Your Answer</h3>
                <p className="text-lg text-slate-700 dark:text-slate-200">{userAnswer}</p>
              </div>

              <div className="bg-amber-50 dark:bg-gradient-to-r dark:from-amber-500/10 dark:to-orange-500/10 p-5 rounded-2xl border border-amber-200 dark:border-amber-500/20 flex gap-4">
                 <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg h-fit text-amber-600 dark:text-amber-400">
                    <Sparkles size={20} />
                 </div>
                 <div>
                   <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase mb-1">AI Insight</p>
                   <p className="text-sm text-amber-800 dark:text-amber-100/80">You mentioned "noise", which is correct! You missed specifically mentioning "generalization".</p>
                 </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {GRADE_OPTIONS.map((option) => (
                  <button 
                    key={option.id}
                    onClick={() => onGrade(option.id)} 
                    className={`p-4 rounded-xl font-bold transition text-sm shadow-sm border ${option.colorClass}`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="hidden lg:block h-full min-h-[500px] bg-white/60 dark:bg-mindo-depth/40 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[40px] p-10 relative overflow-hidden group shadow-2xl dark:shadow-none">
           <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 dark:bg-mindo-primary/20 rounded-full blur-[100px] group-hover:bg-indigo-200 dark:group-hover:bg-mindo-glow/20 transition-colors duration-1000" />
           <div className="relative z-10">
             <div className="flex items-center gap-3 mb-8 opacity-50 text-slate-800 dark:text-white">
               <AlertCircle size={16} />
               <h3 className="text-xs font-bold uppercase tracking-[0.2em]">Source Neuron</h3>
             </div>
             {renderRedactedText()}
           </div>
        </div>

      </main>
    </div>
  );
}