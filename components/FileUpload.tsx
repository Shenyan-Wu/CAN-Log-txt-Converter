import React, { useCallback } from 'react';
import { Upload, FileText, Files } from 'lucide-react';

interface FileUploadProps {
  onFilesSelect: (files: File[]) => void;
  selectedFiles: File[];
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelect, selectedFiles }) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileList: File[] = Array.from(e.dataTransfer.files);
      // Filter for text files
      const validFiles = fileList.filter(f => f.type === "text/plain" || f.name.endsWith('.txt'));
      
      if (validFiles.length !== fileList.length) {
        alert("Some files were ignored because they are not .txt files.");
      }
      
      if (validFiles.length > 0) {
        onFilesSelect(validFiles);
      }
    }
  }, [onFilesSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelect(Array.from(e.target.files));
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
          flex flex-col items-center justify-center w-full min-h-[12rem]
          border-2 border-dashed rounded-xl cursor-pointer 
          transition-all duration-200 ease-in-out p-6
          ${selectedFiles.length > 0 
            ? 'border-indigo-500/50 bg-indigo-500/10' 
            : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-500'
          }
        `}
      >
        <div className="flex flex-col items-center justify-center text-center">
          {selectedFiles.length > 0 ? (
            <>
              <div className="relative mb-3">
                 <Files className="w-10 h-10 text-indigo-400" />
                 <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full border border-slate-900">
                   {selectedFiles.length}
                 </span>
              </div>
              <p className="mb-2 text-sm text-indigo-300 font-semibold">
                {selectedFiles.length === 1 ? '1 file selected' : `${selectedFiles.length} files selected`}
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-md mt-2">
                {selectedFiles.slice(0, 5).map((f, i) => (
                  <span key={i} className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-2 py-1 rounded-md truncate max-w-[150px]">
                    {f.name}
                  </span>
                ))}
                {selectedFiles.length > 5 && (
                  <span className="text-xs text-slate-500 py-1">
                    +{selectedFiles.length - 5} more
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-400/60 mt-4">Click or drag to replace selection</p>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 mb-3 text-slate-400" />
              <p className="mb-2 text-sm text-slate-300">
                <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-slate-500">Select up to 10 .txt files</p>
            </>
          )}
        </div>
        <input 
          id="file-upload" 
          type="file" 
          accept=".txt" 
          multiple
          className="hidden" 
          onChange={handleChange} 
        />
      </label>
    </div>
  );
};