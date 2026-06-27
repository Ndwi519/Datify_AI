import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Database, UploadCloud, X, FileSpreadsheet, Trash2, FileText, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UploadPanel = ({ onUpload, isUploading, datasets, onClear, onDeleteFile }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles);
      }
    },
    accept: { 'text/csv': ['.csv'] },
    multiple: false
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center mb-4">
          <Database className="w-8 h-8 text-blue-500/50 mx-auto mb-2" />
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter uppercase italic">Source Ingestion</h2>
          <p className="text-[10px] font-black text-blue-500 dark:text-cyan-400 uppercase tracking-[0.4em] mt-1">Datify Multi-Node Link</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Ingestion Portal */}
        <div {...getRootProps()} className="relative group cursor-pointer">
          <input {...getInputProps()} />
          
          <div className="absolute inset-[-20px] rounded-full border border-blue-200/30 dark:border-blue-500/20 group-hover:scale-105 transition-transform duration-700" />
          
          <motion.div
            animate={{ 
              scale: isDragActive ? 1.05 : 1,
            }}
            className={`relative w-48 h-48 mx-auto rounded-full flex flex-col items-center justify-center transition-all bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/5 shadow-2xl group-hover:shadow-blue-500/20 ${isUploading ? 'opacity-50' : ''}`}
          >
             <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
             
             <motion.div
               animate={{ y: [0, -5, 0] }}
               transition={{ duration: 3, repeat: Infinity }}
             >
                <UploadCloud className={`w-8 h-8 ${isDragActive ? 'text-blue-500' : 'text-slate-400 group-hover:text-blue-500'} transition-colors`} />
             </motion.div>
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-3">
               {isDragActive ? "Injest" : "Upload"}
             </p>
          </motion.div>
        </div>

        {/* File Registry */}
        <div className="glass-card p-6 min-h-[220px] flex flex-col border-white/60">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                 <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                 <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Live Registry</span>
              </div>
              {datasets.length > 0 && (
                <button onClick={onClear} className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest transition-colors flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Delete All
                </button>
              )}
           </div>

           <div className="space-y-3">
              {datasets.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Active Nodes</p>
                </div>
              ) : (
                datasets.map((file, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={idx} 
                    className="flex items-center justify-between bg-white/60 dark:bg-slate-800/60 p-4 rounded-2xl border border-white/80 dark:border-white/5 shadow-sm"
                  >
                    <div className="flex items-center space-x-4 overflow-hidden">
                       <div className="w-8 h-8 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                          <FileText className="w-4 h-4 text-emerald-500" />
                       </div>
                       <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{file}</span>
                    </div>
                    {onDeleteFile && (
                      <button 
                         onClick={() => onDeleteFile(file)}
                         className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                         title="Remove Dataset"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                ))
              )}
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default UploadPanel;
