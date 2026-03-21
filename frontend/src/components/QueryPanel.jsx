import React, { useState } from 'react';
import { Sparkles, Send, Loader2, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const QueryPanel = ({ onAsk, isQuerying, disabled }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isQuerying && !disabled) {
      onAsk(query);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      whileHover={{ y: -4 }}
      className="glass-card p-8 relative overflow-hidden flex flex-col justify-center transition-all"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 -m-16 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-2xl opacity-60"></div>

      <div className="flex items-center gap-2 mb-4 relative z-10">
        <div className="p-1.5 bg-blue-500/10 rounded-lg shadow-sm">
           <Sparkles className="w-4 h-4 text-blue-500 dark:text-cyan-400" />
        </div>
        <h2 className="font-black text-sm text-slate-800 dark:text-slate-100 tracking-widest uppercase italic">Data Query</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="relative z-10">
        <div className="relative flex items-center">
          <input
            type="text"
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 block p-4 pr-16 placeholder-slate-400 dark:placeholder-slate-500 transition-all shadow-inner"
            placeholder="e.g. Which region generated the highest revenue in 2021?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={disabled || isQuerying}
          />
          <button
            type="submit"
            disabled={disabled || isQuerying || !query.trim()}
            className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-slate-400 dark:disabled:bg-slate-600 transition-colors shadow-lg shadow-blue-500/20"
          >
            {isQuerying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </button>
        </div>
        {disabled && (
          <p className="text-xs text-amber-600 dark:text-amber-500 mt-2 flex items-center gap-1">
             Please upload at least one dataset before asking a question.
          </p>
        )}
      </form>
      
      <div className="mt-4 flex gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400 relative z-10">
         <span className="font-medium text-slate-400 dark:text-slate-500">Suggestions:</span>
         <button onClick={()=>setQuery("Show revenue trends across all years")} className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors">Revenue trends</button>
         <span>&bull;</span>
         <button onClick={()=>setQuery("Compare profit by item type")} className="hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors">Profit by item</button>
      </div>
    </motion.div>
  );
};

export default QueryPanel;
