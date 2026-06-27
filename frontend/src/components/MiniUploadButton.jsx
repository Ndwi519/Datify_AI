import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Plus } from 'lucide-react';

const MiniUploadButton = ({ onUpload, isUploading }) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles);
      }
    },
    accept: { 'text/csv': ['.csv'] },
    multiple: false
  });

  return (
    <div {...getRootProps()} className={`inline-block ${isUploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}>
      <input {...getInputProps()} />
      <button className="flex items-center space-x-2 py-1.5 px-4 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-widest rounded-full transition-colors border border-blue-500/20">
        <Plus className="w-3 h-3" />
        <span>{isUploading ? 'Ingesting...' : 'Replace CSV'}</span>
      </button>
    </div>
  );
};

export default MiniUploadButton;
