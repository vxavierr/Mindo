import React, { useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { EditorDrawer } from '../../features/editor/components/EditorDrawer';
import { useMindoStore } from '../../store/useMindoStore';
import { GlobalSpotlight } from '../ui/GlobalSpotlight';
import { QuickCapture } from '../../features/canvas/components/QuickCapture';
import { AuthProvider, useAuth } from '../../features/auth/AuthContext';
import { Loader2 } from 'lucide-react';

export function AppLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const {
    isEditorOpen,
    closeEditor,
    activeNodeId,
    isCopilotOpen,
    toggleQuickCapture
  } = useMindoStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggleQuickCapture();
      }
      if (e.key === 'Escape' && isEditorOpen) {
        closeEditor();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleQuickCapture, isEditorOpen, closeEditor]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F8FAFC] dark:bg-mindo-void">
        <Loader2 className="w-8 h-8 animate-spin text-mindo-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <LayoutGroup>
      <div className="flex h-screen w-full bg-[#F8FAFC] dark:bg-mindo-void overflow-hidden text-slate-800 dark:text-slate-200 selection:bg-mindo-primary selection:text-white font-sans transition-colors duration-500">
        <GlobalSpotlight />

        <QuickCapture />

        <Sidebar />

        <motion.main
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex-1 relative overflow-hidden flex flex-col m-3 ml-0 rounded-3xl border border-white/40 dark:border-white/5 bg-white/40 dark:bg-mindo-depth/20 shadow-inner z-10 backdrop-blur-sm"
        >
          <Outlet />
        </motion.main>

        <AnimatePresence>
          {isEditorOpen && activeNodeId && (
            <EditorDrawer nodeId={activeNodeId} onClose={closeEditor} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isCopilotOpen && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-6 right-6 w-80 z-50"
            >
              <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-mindo-depth/80 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-2xl p-4">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-300 dark:via-white/20 to-transparent" />

                <h3 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-mindo-glow animate-pulse shadow-[0_0_10px_#38bdf8]" />
                  Neural Copilot
                </h3>
                <div className="h-40 bg-slate-100 dark:bg-black/20 rounded-xl p-3 text-sm text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/5 font-mono">
                  &gt; System online.<br />
                  &gt; Bio-metrics stable.<br />
                  &gt; Awaiting input...
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  );
}