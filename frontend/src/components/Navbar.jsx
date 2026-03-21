import React from 'react';
import { Sparkles, Moon, Sun } from 'lucide-react';
import useDarkMode from '../hooks/useDarkMode';

const Navbar = ({ user, onLogout }) => {
  const [isDarkMode, toggleTheme] = useDarkMode();
  const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 1);

  return (
    <nav className="bg-white/40 dark:bg-slate-900/40 border-b border-white/80 dark:border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur-3xl transition-all duration-700 w-full shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 p-2 rounded-xl shadow-lg shadow-blue-500/20 text-white animate-pulse-slow">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tighter text-slate-800 dark:text-white leading-tight uppercase italic decoration-blue-500">Datify AI</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-blue-500 dark:text-cyan-400 font-black">Data, simplified.</p>
        </div>
      </div>
      <div className="flex items-center space-x-5">
        <button 
           onClick={toggleTheme} 
           className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/50 text-slate-400 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:shadow-xl hover:scale-105 transition-all duration-300 ring-1 ring-slate-100 dark:ring-slate-700/50"
           title="Toggle Theme"
        >
           {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <div className="flex items-center space-x-3 border-l border-slate-100 dark:border-slate-800/80 pl-5">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">{user?.name}</p>
            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-tighter font-bold font-mono">Executive ID: 00{user?.id || 1}</p>
          </div>
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-300 to-purple-300 shadow-xl shadow-indigo-200/40 flex items-center justify-center text-sm font-black text-white border border-white/40">
            {initials}
          </div>
          <button 
            onClick={onLogout}
            className="text-[10px] font-black text-slate-300 dark:text-slate-600 hover:text-rose-400 dark:hover:text-rose-400 transition-colors uppercase tracking-widest pl-1"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
