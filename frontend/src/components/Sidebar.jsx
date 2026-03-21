import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Database, BarChart2, FileText, Settings, HelpCircle, Clock, ChevronRight, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ history, onHistoryClick, onClearHistory, onDeleteHistoryItem }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <motion.aside 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-64 bg-white/60 dark:bg-slate-950/60 backdrop-blur-3xl border-r border-white/80 dark:border-white/5 flex flex-col h-full shadow-[20px_0_50px_rgba(0,0,0,0.02)] z-20 flex-shrink-0 transition-all duration-700"
    >
      <div className="h-20 flex items-center px-6 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="h-10 w-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-xl shadow-blue-500/20">
            <BarChart2 className="w-6 h-6 text-white" />
        </div>
        <div>
           <span className="font-black text-xl text-slate-800 dark:text-white tracking-tighter uppercase italic">Datify</span>
           <p className="text-[8px] font-black text-blue-500 dark:text-cyan-400 uppercase tracking-widest leading-none">AI Analytics</p>
        </div>
      </div>

      <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        <NavItem icon={<Home className="w-5 h-5" />} label="Dashboard" to="/" active={currentPath === '/'} />
        <NavItem icon={<Database className="w-5 h-5" />} label="Datasets" to="/datasets" active={currentPath === '/datasets'} />
        <NavItem icon={<BarChart2 className="w-5 h-5" />} label="Analytics" to="/analytics" active={currentPath === '/analytics'} />
        <NavItem icon={<FileText className="w-5 h-5" />} label="Reports" to="/reports" active={currentPath === '/reports'} />
        <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" to="/settings" active={currentPath === '/settings'} />

        {/* Recent Activity Section */}
        {history && history.length > 0 && (
          <div className="mt-10 pt-6 border-t border-slate-200/30 dark:border-slate-800/50">
            <div className="flex items-center justify-between px-3 mb-4">
               <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.15em]">Recent Activity</span>
               <div className="flex items-center space-x-2">
                   <button 
                     onClick={onClearHistory}
                     className="p-1 hover:bg-rose-500/10 rounded-md text-slate-400 hover:text-rose-500 transition-colors"
                     title="Clear History"
                   >
                       <Trash2 className="w-3 h-3" />
                   </button>
                   <Clock className="w-3 h-3 text-slate-400 dark:text-slate-600" />
               </div>
            </div>
            <div className="space-y-1.5">
              {history.map((item) => (
                <div key={item.id} className="w-full flex items-center group relative border border-transparent hover:bg-slate-100/50 dark:hover:bg-white/5 rounded-xl transition-all duration-300 pr-8">
                  <button
                     onClick={() => onHistoryClick(item)}
                     className="flex-1 flex items-center px-3 py-2.5 text-left"
                  >
                    <div className="mr-3 w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-indigo-300 transition-colors"></div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white truncate font-medium flex-1">{item.question}</span>
                  </button>
                  {onDeleteHistoryItem && (
                    <button
                      onClick={() => onDeleteHistoryItem(item.id)}
                      className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-all duration-300"
                      title="Delete query"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="bg-blue-600/10 rounded-2xl p-4 border border-blue-500/20 shadow-sm group">
             <div className="flex items-center space-x-2 text-blue-500 mb-2">
                 <HelpCircle className="w-4 h-4" />
                 <span className="font-bold text-xs uppercase tracking-widest">Knowledge Base</span>
             </div>
             <p className="text-[10px] text-slate-400 mb-3 font-medium leading-relaxed group-hover:text-slate-300 transition-colors">Learn how to upload files and generate clean data reports.</p>
             <Link 
               to="/docs" 
               className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl text-center shadow-lg shadow-blue-600/20 block transition-all active:scale-95"
             >
                 Explore Docs
             </Link>
        </div>
      </div>
    </motion.aside>
  );
};

const NavItem = ({ icon, label, to, active }) => {
  return (
    <Link to={to} className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-300 cursor-pointer group ${
        active 
          ? 'bg-white shadow-xl shadow-blue-200/50 dark:bg-blue-600 dark:shadow-blue-900/40 text-blue-600 dark:text-white font-bold translate-x-1' 
          : 'text-slate-500 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-blue-400 font-medium'
    }`}>
        <span className={`${active ? 'text-blue-500 dark:text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-blue-400 transition-colors'} flex items-center`}>{icon}</span>
        <span className="text-sm tracking-tight">{label}</span>
        {active && <span className="ml-auto w-1 h-4 bg-blue-400 dark:bg-white rounded-full"></span>}
    </Link>
  );
};

export default Sidebar;
