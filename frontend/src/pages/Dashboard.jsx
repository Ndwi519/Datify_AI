import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import UploadPanel from '../components/UploadPanel';
import QueryPanel from '../components/QueryPanel';
import ChartView from '../components/ChartView';
import ExplanationPanel from '../components/ExplanationPanel';
import DatasetTable from '../components/DatasetTable';
import HeroUpload from '../components/HeroUpload';
import MiniUploadButton from '../components/MiniUploadButton';
import axios from 'axios';
import Reports from './Reports';
import Settings from './Settings';
import Docs from './Docs';

import { motion, AnimatePresence } from 'framer-motion';
import { Database, FileText, Sparkles, Clock } from 'lucide-react';

import QuickCorrelation from '../components/QuickCorrelation';

const API_BASE_URL = 'http://localhost:8001';

const Dashboard = ({ user, onUserUpdate, onLogout }) => {
  const [datasets, setDatasets] = useState([]);
  const [previewData, setPreviewData] = useState({ columns: [], data: [] });
  const [chartConfig, setChartConfig] = useState(null);
  const [charts, setCharts] = useState([]); 
  const [insights, setInsights] = useState(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [globalSuccess, setGlobalSuccess] = useState('');
  const [lastAnalytics, setLastAnalytics] = useState(null);
  const [history, setHistory] = useState([]);
  const [analyticsSummary, setAnalyticsSummary] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const fetchPreview = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/dataset-preview`);
      setPreviewData(res.data);
    } catch (err) {
      console.error('Failed to fetch preview:', err);
    }
  };

  const fetchDatasets = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/datasets`);
      setDatasets(res.data.datasets || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const fetchAnalyticsSummary = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/analytics-summary`);
      setAnalyticsSummary(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics summary:', err);
    }
  };

  useEffect(() => {
    fetchDatasets();
    fetchPreview();
    fetchHistory();
    fetchAnalyticsSummary();
  }, []);

  const handleUpload = async (files) => {
    setIsUploading(true);
    setGlobalError('');
    setGlobalSuccess('');
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));

    try {
      await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchDatasets();
      await fetchPreview();
      await fetchAnalyticsSummary();
    } catch (error) {
      setGlobalError(error.response?.data?.detail || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearDatasets = async () => {
     try {
       await axios.delete(`${API_BASE_URL}/datasets`);
       setDatasets([]);
       setPreviewData({ columns: [], data: [] });
       setChartConfig(null);
       setCharts([]);
       setInsights(null);
       setAnalyticsSummary(null);
     } catch (err) {
       console.error(err);
     }
  };

  const handleDeleteFile = async (filename) => {
    try {
      await axios.delete(`${API_BASE_URL}/datasets/${filename}`);
      const res = await axios.get(`${API_BASE_URL}/datasets`);
      const updatedDatasets = res.data.datasets || [];
      setDatasets(updatedDatasets);
      if (updatedDatasets.length > 0) {
        await fetchPreview();
        await fetchAnalyticsSummary();
      } else {
        setPreviewData({ columns: [], data: [] });
        setAnalyticsSummary(null);
      }
    } catch (error) {
      setGlobalError(error.response?.data?.detail || `Failed to delete ${filename}.`);
    }
  };

  const handleAsk = async (question) => {
    setIsQuerying(true);
    setGlobalError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/ask`, { question }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newCharts = res.data.charts || [];
      setChartConfig(newCharts.length > 0 ? newCharts[0] : null);
      setCharts(newCharts);
      
      setInsights(res.data.insights);
      setLastAnalytics({ 
        question, 
        insights: res.data.insights, 
        charts: newCharts,
        chartConfig: newCharts.length > 0 ? newCharts[0] : null 
      });
      fetchHistory(); 
    } catch (error) {
      setGlobalError(error.response?.data?.detail || 'Query failed. Please try again.');
    } finally {
      setIsQuerying(false);
    }
  };

  const handleHistoryClick = (item) => {
    const historicalCharts = Array.isArray(item.chart_config) ? item.chart_config : [item.chart_config];
    setChartConfig(historicalCharts[0]);
    setCharts(historicalCharts);
    setInsights(item.answer);
    setLastAnalytics({ 
      question: item.question, 
      insights: item.answer, 
      charts: historicalCharts,
      chartConfig: historicalCharts[0] 
    });
  };

  const handleManualAnalyze = async (manualConfig) => {
    setIsQuerying(true);
    setGlobalError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/analyze-direct`, manualConfig, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const newCharts = res.data.charts || [];
      setChartConfig(newCharts.length > 0 ? newCharts[0] : null);
      setCharts(newCharts);
      setInsights(res.data.insights);
      
      setLastAnalytics({ 
        question: `Manual Analysis: ${manualConfig.x_column} vs ${manualConfig.y_column}`, 
        insights: res.data.insights, 
        charts: newCharts,
        chartConfig: newCharts.length > 0 ? newCharts[0] : null 
      });
    } catch (error) {
      setGlobalError(error.response?.data?.detail || 'Manual analysis failed.');
    } finally {
      setIsQuerying(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!lastAnalytics) {
      setGlobalError('No analytics session found to export.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const { question, insights, chartConfig } = lastAnalytics;
      const res = await axios.post(`${API_BASE_URL}/download-report`, {
        question,
        explanation: insights ? [insights.key_insight, insights.explanation, insights.takeaway].filter(Boolean).join('\n\n') : "",
        chart_config: chartConfig,
        chart_image_base64: ""
      }, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Analytics_Report_${new Date().getTime()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download PDF:', err);
      setGlobalError('Failed to generate PDF. Please try again.');
    }
  };

  const handleClearHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
      setGlobalError('Failed to clear history.');
    }
  };

  const handleDeleteHistoryItem = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete history item:', err);
      setGlobalError('Failed to delete query from history.');
    }
  };

  const handleExportAnalytics = async () => {
    setIsExporting(true);
    setGlobalError('');
    setGlobalSuccess('');
    try {
      const res = await axios.get(`${API_BASE_URL}/export-analytics`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'datify_analytics_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();

      const rows = analyticsSummary?.["Total Rows"] ?? 'N/A';
      const cols = analyticsSummary?.["Total Columns"] ?? 'N/A';
      const size = analyticsSummary?.["Dataset Size (KB)"] ?? 'N/A';
      setGlobalSuccess(`✓ Dataset Exported Successfully\n\nRows: ${rows}\nColumns: ${cols}\nFile Size: ${size} KB\nEncoding: UTF-8\nPower BI Compatible`);
    } catch (err) {
      setGlobalError('Failed to export analytics dataset.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadSummary = () => {
    if (!analyticsSummary) {
      setGlobalError('No analytics summary available. Please upload a dataset first.');
      return;
    }
    try {
      const blob = new Blob([JSON.stringify(analyticsSummary, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'analytics_summary.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setGlobalError('Failed to download analytics summary.');
    }
  };

  return (
    <div className="flex h-screen mesh-gradient text-slate-800 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-700 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ x: [0, 80, 0], y: [0, -40, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-200/30 dark:bg-indigo-600/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, -100, 0], y: [0, 60, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-rose-200/30 dark:bg-rose-600/10 rounded-full blur-[140px]" 
        />
      </div>

      <Sidebar 
        history={history} 
        onHistoryClick={handleHistoryClick} 
        onClearHistory={handleClearHistory}
        onDeleteHistoryItem={handleDeleteHistoryItem}
      />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        <Navbar user={user} onLogout={onLogout} />
        
        <AnimatePresence>
          {globalError && (
            <motion.div 
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              className="absolute top-4 left-1/2 z-50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 px-6 py-3 shadow-2xl rounded-2xl min-w-[300px] text-center"
            >
              <p className="font-bold text-sm whitespace-pre-wrap">{globalError}</p>
            </motion.div>
          )}
          {globalSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -20, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: -20, x: '-50%' }}
              className="absolute top-4 left-1/2 z-50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-green-200 dark:border-green-900/50 text-green-700 dark:text-green-400 px-6 py-4 shadow-2xl rounded-2xl min-w-[300px] text-left"
            >
              <p className="font-bold text-sm whitespace-pre-wrap">{globalSuccess}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8 custom-scrollbar">
          <Routes>
            <Route path="/" element={
              datasets.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-6xl mx-auto flex flex-col items-center justify-center min-h-[75vh] text-center"
                >
                  <div className="mb-10">
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-7xl font-black text-slate-800 dark:text-white tracking-tighter leading-none mb-6 italic"
                    >
                        Datify <span className="text-blue-600">AI</span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-blue-500/80 dark:text-cyan-400/80 text-xl font-black uppercase tracking-[0.4em]"
                    >
                        Data, Simplified.
                    </motion.p>
                  </div>
                  
                  <HeroUpload 
                    onUpload={handleUpload} 
                    isUploading={isUploading} 
                  />
                  
                </motion.div>
              ) : (
                <div className="max-w-[1600px] mx-auto space-y-8 animate-in">
                  <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12 space-y-4">
                      <QueryPanel onAsk={handleAsk} isQuerying={isQuerying} disabled={datasets.length === 0} />
                      
                      <ExplanationPanel insights={insights} onDownload={handleDownloadReport} />
                      
                      <div className="glass-card p-6 mt-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                          <div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
                              <Database className="w-5 h-5 mr-2 text-indigo-500" />
                              Business Intelligence
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Export cleaned datasets and summaries for external BI tools.</p>
                          </div>
                          
                          <div className="mt-4 md:mt-0 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl min-w-[220px]">
                            <p className="text-xs font-bold text-green-800 dark:text-green-400 mb-2 uppercase tracking-wider">Export Compatibility</p>
                            <div className="flex flex-col gap-1 text-xs text-green-700 dark:text-green-300">
                              <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Microsoft Power BI Desktop</span>
                              <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Microsoft Excel</span>
                              <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Tableau</span>
                              <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" /> Python</span>
                            </div>
                            <p className="text-[10px] text-green-600 dark:text-green-500 mt-2 italic">Supports CSV exports for downstream Business Intelligence workflows.</p>
                          </div>
                        </div>
                        
                        {analyticsSummary && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <StatCard
                              icon={<Database className="w-4 h-4 text-indigo-500" />}
                              label="Dataset"
                              value={analyticsSummary["Dataset Name"] ?? 'N/A'}
                              color="bg-indigo-100 dark:bg-indigo-900/30"
                            />
                            <StatCard
                              icon={<FileText className="w-4 h-4 text-blue-500" />}
                              label="Rows &amp; Columns"
                              value={`${analyticsSummary["Total Rows"] ?? 0} Rows`}
                              subtitle={`${analyticsSummary["Total Columns"] ?? 0} Columns`}
                              color="bg-blue-100 dark:bg-blue-900/30"
                            />
                            <StatCard
                              icon={<Clock className="w-4 h-4 text-amber-500" />}
                              label="Data Quality"
                              value={`${analyticsSummary["Missing Values"] ?? 0} Missing`}
                              subtitle={`${analyticsSummary["Duplicate Rows"] ?? 0} Duplicates`}
                              color="bg-amber-100 dark:bg-amber-900/30"
                            />
                            <StatCard
                              icon={<Sparkles className="w-4 h-4 text-emerald-500" />}
                              label="Status"
                              value={(analyticsSummary["Processing Status"] ?? 'SUCCESS').toUpperCase()}
                              subtitle="Ready for BI Export"
                              color="bg-emerald-100 dark:bg-emerald-900/30"
                            />
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-4">
                          <button 
                            onClick={handleExportAnalytics}
                            disabled={isExporting}
                            className={`flex items-center px-4 py-2 ${isExporting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} text-white text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-lg`}
                          >
                            <Database className={`w-4 h-4 mr-2 ${isExporting ? 'animate-pulse' : ''}`} />
                            {isExporting ? 'Exporting...' : 'Export Analytics Dataset'}
                          </button>
                          <button 
                            onClick={handleDownloadSummary}
                            className="flex items-center px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-sm font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Download Analytics Summary
                          </button>
                        </div>
                      </div>
                      
                      <DatasetTable 
                        previewData={previewData} 
                        rightElement={<MiniUploadButton onUpload={handleUpload} isUploading={isUploading} />}
                      />

                      <ChartView charts={charts} />
                    </div>
                  </div>
                </div>
              )
            } />

            <Route path="/datasets" element={
              <div className="max-w-[1200px] mx-auto space-y-8 animate-in">
                 <div className="glass-card p-8 mb-6">
                     <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2 tracking-tight">Uploaded Datasets</h2>
                     <p className="text-slate-500 dark:text-slate-400 font-medium">Upload and manage your CSV datasets for analysis.</p>
                 </div>
                 <div className="max-w-4xl mx-auto">
                    <UploadPanel 
                      onUpload={handleUpload} 
                      isUploading={isUploading} 
                      datasets={datasets} 
                      onClear={handleClearDatasets} 
                      onDeleteFile={handleDeleteFile}
                    />
                 </div>
                 <DatasetTable previewData={previewData} />
              </div>
            } />

            <Route path="/analytics" element={
              <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-8 animate-in">
                 <div className="col-span-12 space-y-4">
                    <QuickCorrelation 
                      datasets={datasets} 
                      columns={previewData.columns} 
                      onAnalyze={handleManualAnalyze} 
                      isQuerying={isQuerying} 
                    />
                    <QueryPanel onAsk={handleAsk} isQuerying={isQuerying} disabled={datasets.length === 0} />
                    <ExplanationPanel insights={insights} onDownload={handleDownloadReport} />
                    <ChartView charts={charts} />
                 </div>
              </div>
            } />

            <Route path="/reports" element={<Reports lastAnalytics={lastAnalytics} />} />
            <Route path="/settings" element={<Settings user={user} onUserUpdate={onUserUpdate} />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, subtitle, color }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="glass-card p-5 flex items-center space-x-4 border-white/60 dark:border-white/5"
  >
    <div className={`p-3 rounded-2xl ${color} shadow-sm transition-transform flex-shrink-0`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-tight mb-0.5">{label}</p>
      <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{value}</p>
      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>
      )}
    </div>
  </motion.div>
);

export default Dashboard;
