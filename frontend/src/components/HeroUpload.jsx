import React from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';

const HeroUpload = ({ onUpload, isUploading }) => {
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
    <div className="flex flex-col items-center justify-center space-y-4 py-4">
      <div {...getRootProps()} className="relative cursor-pointer group outline-none">
        <input {...getInputProps()} />
        
        {/* Outer Glowing Orbit */}
        <div className="absolute inset-[-25px] rounded-full border border-blue-200/40 dark:border-blue-500/20 animate-spin-slow pointer-events-none group-hover:border-blue-400/60 transition-colors" />
        <div className="absolute inset-[-12px] rounded-full border border-cyan-200/40 dark:border-cyan-500/20 animate-reverse-spin-slow pointer-events-none group-hover:border-cyan-400/60 transition-colors" />
        
        {/* Pulsing Core */}
        <motion.div
           animate={{ 
             scale: isDragActive ? 1.05 : 1,
             boxShadow: isDragActive 
               ? "0 0 60px rgba(59, 130, 246, 0.4)" 
               : "0 0 40px rgba(59, 130, 246, 0.2)" 
           }}
           className={`relative w-56 h-56 rounded-full flex flex-col items-center justify-center transition-all bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.05)] group-hover:bg-white/60 dark:group-hover:bg-slate-800/60 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
            <div className="text-center px-8">
              <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight leading-tight uppercase italic">
                Upload CSV Files
              </h3>
            </div>
        </motion.div>

      </div>
    </div>
  );
};

export default HeroUpload;
