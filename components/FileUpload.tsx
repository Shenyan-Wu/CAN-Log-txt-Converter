import React, { useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFileName?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, selectedFileName }) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "text/plain" || file.name.endsWith('.txt')) {
        onFileSelect(file);
      } else {
        alert("Please upload a .txt file");
      }
    }
  }, [onFileSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      className="w-full"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <label 
        htmlFor="file-upload"
        className={`
          flex flex-col items-center justify-center w-full h-48 
          border-2 border-dashed rounded-xl cursor-pointer 
          transition-all duration-200 ease-in-out
          ${selectedFileName 
            ? 'border-indigo-500/50 bg-indigo-500/10' 
            : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-500'
          }
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          {selectedFileName ? (
            <>
              <FileText className="w-10 h-10 mb-3 text-indigo-400" />
              <p className="mb-2 text-sm text-indigo-300 font-semibold truncate max-w-full">
                {selectedFileName}
              </p>
              <p className="text-xs text-indigo-400/60">Click or drag to replace</p>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 mb-3 text-slate-400" />
              <p className="mb-2 text-sm text-slate-300">
                <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-slate-500">Only .txt files are supported</p>
            </>
          )}
        </div>
        <input 
          id="file-upload" 
          type="file" 
          accept=".txt" 
          className="hidden" 
          onChange={handleChange} 
        />
      </label>
    </div>
  );
};
