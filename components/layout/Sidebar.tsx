import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, BrainCircuit, Settings, Activity, ChevronLeft, ChevronRight, Hexagon, Zap, Sun, Moon, LucideIcon } from 'lucide-react';
import { useMindoStore } from '../../store/useMindoStore';

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  collapsed: boolean;
}

const NavItem = ({ to, icon: Icon, label, collapsed }: NavItemProps) => (
  <NavLink to={to} className="relative group w-full block mb-2 shrink-0">
    {({ isActive }) => (
      <div className={`
        flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 border
        ${isActive 
          ? 'bg-mindo-primary/20 dark:bg-mindo-primary/30 border-mindo-glow/50 text-indigo-600 dark:text-white shadow-[0_0_15px_rgba(56,189,248,0.1)] dark:shadow-[0_0_15px_rgba(56,189,248,0.2)]' 
          : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'
        }
      `}>
        {/* Icon Glow */}
        <div className={`relative z-10 transition-colors ${isActive ? 'text-mindo-glow dark:drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]' : ''}`}>
          <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        </div>

        {/* Label */}
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className={`font-medium text-sm whitespace-nowrap overflow-hidden ${isActive ? 'text-indigo-900 dark:text-white font-semibold' : ''}`}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Active Pill Indicator */}
        {isActive && (
          <motion.div 
            layoutId="active-nav"
            className="absolute left-0 top-2 bottom-2 w-1 bg-mindo-glow rounded-r-full shadow-[0_0_12px_#38bdf8]"
          />
        )}
      </div>
    )}
  </NavLink>
);

export function Sidebar() {
  const { isSidebarCollapsed, toggleSidebar, toggleQuickCapture, theme, toggleTheme } = useMindoStore();

  return (
    <motion.aside
      layout 
      initial={false}
      animate={{ width: isSidebarCollapsed ? 80 : 260 }}
      className="h-full bg-white dark:bg-[#02040A] border-r border-slate-200 dark:border-white/5 relative z-20 flex flex-col py-6 px-3 shadow-2xl shrink-0 overflow-hidden transition-colors duration-500"
    >
      {/* Top Border Highlight */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-300 dark:via-white/10 to-transparent" />

      {/* Header */}
      <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-2'} mb-8 h-10 shrink-0`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-mindo-primary to-indigo-100 dark:to-mindo-void rounded-xl border border-white/20 dark:border-white/10 flex items-center justify-center shadow-lg relative overflow-hidden shrink-0">
             <Hexagon size={22} className="text-white fill-mindo-primary/50" />
          </div>
          {!isSidebarCollapsed && (
            <motion.span 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="font-bold text-xl tracking-tight text-slate-800 dark:text-white whitespace-nowrap"
            >
              MINDO
            </motion.span>
          )}
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar min-h-0">
        <NavItem to="/" icon={Activity} label="Overview" collapsed={isSidebarCollapsed} />
        <NavItem to="/canvas" icon={LayoutGrid} label="Neural Canvas" collapsed={isSidebarCollapsed} />
        <NavItem to="/review" icon={BrainCircuit} label="Daily Review" collapsed={isSidebarCollapsed} />
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-slate-200 dark:border-white/5 pt-4 space-y-2 shrink-0">
         {/* Quick Capture Button */}
         <button 
           onClick={toggleQuickCapture}
           className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3 px-3'} py-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-mindo-primary/10 dark:hover:bg-mindo-primary/20 hover:border-mindo-glow/30 transition-all group shrink-0`}
           title="Quick Capture (Cmd+K)"
         >
            <Zap size={20} className="text-mindo-glow group-hover:scale-110 transition-transform" />
            {!isSidebarCollapsed && <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-indigo-900 dark:group-hover:text-white">Quick Capture</span>}
         </button>

         <NavItem to="/settings" icon={Settings} label="Settings" collapsed={isSidebarCollapsed} />
         
         {/* Theme Toggle */}
         <button 
           onClick={toggleTheme}
           className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors shrink-0 gap-2"
           title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
         >
           {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
           {!isSidebarCollapsed && <span className="text-xs font-bold uppercase tracking-wider">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
         </button>
         
         <button 
           onClick={toggleSidebar}
           className="w-full mt-2 flex items-center justify-center p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors shrink-0"
         >
           {isSidebarCollapsed 
             ? <ChevronRight size={16} /> 
             : <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-60"><ChevronLeft size={14}/> Collapse</div>
           }
         </button>
      </div>
    </motion.aside>
  );
}