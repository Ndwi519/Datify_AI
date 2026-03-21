import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart as ReAreaChart, Area } from 'recharts';
import { Presentation, BarChart3, AreaChart, PieChart as PieChartIcon, LineChart as LineChartIcon, Download, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = [
  '#3b82f6', // Electric Blue
  '#a855f7', // Purple
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899'  // Pink
];

const ChartCard = ({ config, index }) => {
  if (!config || !config.chart_data || config.chart_data.length === 0) return null;

  const { chart_type: type, chart_data: data, metadata } = config;
  const xKey = metadata?.x_column;
  const yKey = metadata?.y_column;

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
              <XAxis dataKey={xKey} hide={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: '#1e293b', fontWeight: 600, fontSize: '12px' }}
              />
              <Line type="monotone" dataKey={yKey} stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <ReAreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <defs>
                <linearGradient id={`colorGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
              <XAxis dataKey={xKey} hide={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Area type="monotone" dataKey={yKey} stroke="#8b5cf6" fillOpacity={1} fill={`url(#colorGrad-${index})`} />
            </ReAreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                dataKey={yKey}
                nameKey={xKey}
              >
                {data.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        );
      case 'bar':
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
              <XAxis dataKey={xKey} hide={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip cursor={{ fill: 'rgba(241, 245, 249, 0.2)' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Bar dataKey={yKey} radius={[4, 4, 0, 0]}>
                {data.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="glass-card p-4 flex flex-col h-[320px] hover:shadow-xl transition-all border border-white/10"
    >
      <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 overflow-hidden">
              <div className="p-1.5 bg-indigo-500/10 rounded-lg text-indigo-500">
                  {type === 'bar' && <BarChart3 className="w-3 h-3" />}
                  {type === 'line' && <LineChartIcon className="w-3 h-3" />}
                  {type === 'pie' && <PieChartIcon className="w-3 h-3" />}
                  {type === 'area' && <AreaChart className="w-3 h-3" />}
              </div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate pr-2 uppercase tracking-wide">
                {metadata?.aggregation} of {yKey}
              </h4>
          </div>
          <div className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">
            {type}
          </div>
      </div>
      <div className="flex-1 w-full min-h-0">
        {renderChart()}
      </div>
    </motion.div>
  );
};

const ChartView = ({ charts = [] }) => {
  if (!charts || charts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 glass-card p-6 flex flex-col items-center justify-center min-h-[440px] transition-all"
      >
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-full border border-slate-100 dark:border-slate-700 mb-4 shadow-inner">
           <Presentation className="w-12 h-12 text-slate-300 dark:text-slate-600" />
        </div>
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">Intelligent Visualization Ready</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center max-w-sm">
           Ask complex questions to generate a multi-perspective analytical dashboard.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      {charts.map((config, idx) => (
        <div key={idx} className={charts.length === 1 ? "md:col-span-2" : ""}>
          <ChartCard config={config} index={idx} />
        </div>
      ))}
    </div>
  );
};

export default ChartView;
