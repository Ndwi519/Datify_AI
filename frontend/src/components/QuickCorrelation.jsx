import React, { useState } from 'react';
import { BarChart3, LineChart, PieChart, AreaChart, Play, Database } from 'lucide-react';
import { motion } from 'framer-motion';

const QuickCorrelation = ({ datasets, columns, onAnalyze, isQuerying }) => {
  const [config, setConfig] = useState({
    x_column: columns[0] || '',
    y_column: columns[1] || columns[0] || '',
    chart_type: 'bar',
    aggregation: 'sum'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (config.x_column && config.y_column) {
      onAnalyze(config);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 border-blue-100/50 dark:border-blue-900/40 relative overflow-hidden"
    >
      <div className="flex items-center space-x-2 mb-6 uppercase italic">
        <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-500">
           <Database className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-black text-slate-800 dark:text-white tracking-widest">Logic Correlator</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Target X (Categories)</label>
            <select 
              value={config.x_column}
              onChange={(e) => setConfig({...config, x_column: e.target.value})}
              className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            >
              {columns.map(col => <option key={col} value={col}>{col}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Target Y (Numeric)</label>
            <select 
              value={config.y_column}
              onChange={(e) => setConfig({...config, y_column: e.target.value})}
              className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            >
              {columns.map(col => <option key={col} value={col}>{col}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            {[
              { id: 'bar', icon: BarChart3 },
              { id: 'line', icon: LineChart },
              { id: 'area', icon: AreaChart },
              { id: 'pie', icon: PieChart }
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setConfig({...config, chart_type: t.id})}
                className={`p-2 rounded-xl transition-all ${config.chart_type === t.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-blue-500'}`}
              >
                <t.icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <select 
              value={config.aggregation}
              onChange={(e) => setConfig({...config, aggregation: e.target.value})}
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer"
            >
              <option value="sum">Sum</option>
              <option value="mean">Average</option>
              <option value="count">Count</option>
              <option value="min">Min</option>
              <option value="max">Max</option>
            </select>

            <button
              type="submit"
              disabled={isQuerying}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center space-x-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {isQuerying ? "Synthesizing..." : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span>Execute Engine</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default QuickCorrelation;
