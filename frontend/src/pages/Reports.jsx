import React, { useState } from 'react';
import axios from 'axios';
import { FileText, Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const API_BASE = 'http://localhost:8001';

const Reports = ({ lastAnalytics }) => {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleDownload = async () => {
    if (!lastAnalytics) {
      setMsg({ type: 'error', text: 'No analytics session found. Please run a query from Analytics first.' });
      return;
    }
    setMsg(null);
    setLoading(true);
    try {
      const { question, insights, chartConfig } = lastAnalytics;
      const explanation = [
        insights?.key_insight,
        insights?.explanation,
        insights?.takeaway
      ].filter(Boolean).join('\n\n');

      const res = await axios.post(
        `${API_BASE}/download-report`,
        {
          question,
          explanation,
          chart_config: chartConfig || {},
          chart_image_base64: ''
        },
        { responseType: 'blob' }
      );
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Datify_Strategic_Briefing.pdf';
      link.click();
      URL.revokeObjectURL(url);
      setMsg({ type: 'success', text: 'Report downloaded successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to generate report. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const hasData = !!lastAnalytics;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="text-center md:text-left transition-all italic">
        <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">Data Summary</h2>
        <p className="text-blue-500 dark:text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Export your data discoveries as professional PDF reports.</p>
      </div>

      {/* Report Summary Card */}
      <div className="glass-card overflow-hidden transition-all duration-500 border border-white/10 shadow-2xl">
        <div className="flex items-center space-x-4 p-6 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-black text-lg text-slate-800 dark:text-white uppercase">Active Analytics Session</h3>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Snapshot of current data analysis</p>
          </div>
        </div>

        <div className="p-6 md:p-8">
        {hasData ? (
          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200/50 dark:border-slate-700/50">
              <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-[0.2em] mb-3">Primary Query</p>
              <p className="text-slate-800 dark:text-slate-200 font-bold text-lg leading-snug">"{lastAnalytics.question}"</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/40 dark:bg-slate-800/20 backdrop-blur-sm rounded-2xl p-5 border border-slate-100 dark:border-slate-800 transition-hover hover:border-indigo-500/30">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Key Insight</p>
                  <p className="text-slate-700 dark:text-slate-300 text-sm font-semibold italic">"{lastAnalytics.insights?.key_insight}"</p>
                </div>
                <div className="bg-white/40 dark:bg-slate-800/20 backdrop-blur-sm rounded-2xl p-5 border border-slate-100 dark:border-slate-800 transition-hover hover:border-emerald-500/30">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Core Conclusion</p>
                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{lastAnalytics.insights?.explanation}</p>
                </div>
            </div>

            {lastAnalytics.insights?.takeaway && (
              <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-2xl p-6 border border-indigo-100/50 dark:border-indigo-500/20">
                <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">Strategic Takeaway</p>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-sm font-medium leading-relaxed">{lastAnalytics.insights.takeaway}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-6 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center border border-slate-100 dark:border-slate-700 shadow-inner">
              <FileText className="w-10 h-10 text-slate-200 dark:text-slate-600" />
            </div>
            <p className="text-slate-800 dark:text-slate-200 text-lg font-bold">No Data Found</p>
            <p className="text-slate-500 dark:text-slate-500 text-sm mt-2 max-w-xs mx-auto">Please generate a chart or ask a question in the Analytics tab first.</p>
          </div>
        )}
        </div>
      </div>

      {/* Action area */}
      {msg && (
        <div className={`flex items-center space-x-2 text-sm font-medium p-4 rounded-xl ${msg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800'}`}>
          {msg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      <button
        onClick={handleDownload}
        disabled={loading || !hasData}
        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center space-x-3"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
        <span>Download PDF Report</span>
      </button>
    </div>
  );
};

export default Reports;
