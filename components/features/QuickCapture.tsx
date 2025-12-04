import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMindoStore } from '../../store/useMindoStore';
import { Plus, ArrowRight } from 'lucide-react';

export function QuickCapture() {
  const { isQuickCaptureOpen, setQuickCapture, addNode } = useMindoStore();
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isQuickCaptureOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isQuickCaptureOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      // Add node with 'inbox' status - it goes to the Inbox Dock
      addNode(input.trim(), 'text', undefined, 'inbox');
      setInput('');
      setQuickCapture(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setQuickCapture(false);
    }
  };

  return (
    <AnimatePresence>
      {isQuickCaptureOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQuickCapture(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-2xl px-4"
          >
            <form onSubmit={handleSubmit} className="relative group">
              {/* Glowing Border */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-mindo-primary via-mindo-glow to-mindo-primary rounded-2xl opacity-75 blur-md group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt" />
              
              <div className="relative bg-[#0a0a0a] rounded-2xl flex items-center p-2 shadow-2xl ring-1 ring-white/10">
                <div className="p-4 text-mindo-glow">
                  <Plus size={28} />
                </div>
                
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Capture a thought for the inbox..."
                  className="w-full bg-transparent text-2xl font-medium text-white placeholder-slate-600 focus:outline-none py-4"
                />

                <div className="pr-4">
                  <span className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-500 border border-white/10 px-2 py-1 rounded">
                    <span className="text-white">ENTER</span> to save
                  </span>
                  <button 
                    type="submit"
                    className="md:hidden p-2 bg-mindo-primary rounded-lg text-white"
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </form>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mt-4 text-slate-400 text-sm"
            >
              Captured thoughts go to the <span className="text-white font-bold">Inbox Dock</span>. Drag them to the canvas to link.
            </motion.p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}