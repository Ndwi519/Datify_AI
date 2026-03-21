import React from 'react';
import { Lightbulb, CheckCircle2, ArrowRight, Download, BrainCircuit, Target, TrendingUp, Zap, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ExplanationPanel = ({ insights, onDownload }) => {
  if (!insights) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="flex flex-col glass-card overflow-hidden transition-all duration-500"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 dark:bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>
      
      <div className="flex items-center space-x-3 mb-6 relative z-10 border-b border-slate-200 dark:border-slate-800/50 pb-4 pl-3">
        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl shadow-lg border border-blue-400/50">
            <Lightbulb className="w-6 h-6 absolute opacity-70 blur-md text-white" />
            <Lightbulb className="w-6 h-6 relative z-10" />
        </div>
        <div>
          <h2 className="font-black text-2xl text-slate-800 dark:text-white tracking-tight leading-tight uppercase italic drop-shadow-md">AI Insights</h2>
          <p className="text-xs uppercase tracking-[0.2em] text-blue-500 dark:text-cyan-400 font-black">Analysis Report</p>
        </div>
      </div>

      <div className="flex-1 relative z-10 overflow-y-auto custom-scrollbar pr-1">
        {!insights ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 space-y-4 opacity-70 py-10">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-full shadow-inner border border-slate-100 dark:border-slate-800">
                <Info className="w-8 h-8 text-blue-300 dark:text-blue-700/50" />
            </div>
            <p className="text-sm text-center font-medium max-w-[200px]">Insights will appear here automatically after query generation.</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-5">
            {/* Key Insight */}
            <div className="group bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-100/60 dark:border-blue-800/40 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300">
               <div className="flex items-center space-x-2 mb-2.5">
                   <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                   <h3 className="text-xs font-bold text-blue-900/60 dark:text-blue-300/60 uppercase tracking-widest">Main Insight</h3>
               </div>
               <p className="text-lg text-slate-800 dark:text-slate-200 font-bold leading-snug">{insights.key_insight}</p>
            </div>
            
            {/* Explanation */}
            <div className="bg-white/80 dark:bg-slate-800/80 border border-slate-100/80 dark:border-slate-700/80 rounded-xl p-4 shadow-sm hover:bg-white dark:hover:bg-slate-800 transition-colors duration-300">
               <div className="flex items-center space-x-2 mb-2.5">
                   <TrendingUp className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                   <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Data Explanation</h3>
               </div>
               <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{insights.explanation}</p>
            </div>

            {/* Takeaway */}
            <div className="bg-gradient-to-r from-purple-50/80 to-blue-50/80 dark:from-purple-900/30 dark:to-blue-900/30 border border-purple-100/60 dark:border-purple-800/40 rounded-xl p-4 shadow-sm relative overflow-hidden group">
               <div className="absolute -top-4 -right-4 p-2 opacity-5 transform group-hover:scale-110 group-hover:opacity-10 transition-all duration-500">
                   <Zap className="w-24 h-24 text-purple-600 dark:text-purple-500" />
               </div>
               <div className="flex items-center space-x-2 mb-2.5 relative z-10">
                   <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                   <h3 className="text-xs font-bold text-purple-800/60 dark:text-purple-300/60 uppercase tracking-widest">Key Takeaway</h3>
               </div>
               <p className="text-base text-purple-900 dark:text-purple-100 font-semibold leading-relaxed relative z-10">{insights.takeaway}</p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100/80 dark:border-slate-800/80">
               <button 
                  onClick={onDownload}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 bg-slate-900 dark:bg-slate-100 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white dark:text-slate-900 dark:hover:text-white rounded-lg text-sm font-semibold transition-all duration-300 shadow-md shadow-slate-900/10 hover:shadow-indigo-500/20 active:scale-[0.98]"
               >
                 <span>Download PDF Report</span>
               </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ExplanationPanel;
