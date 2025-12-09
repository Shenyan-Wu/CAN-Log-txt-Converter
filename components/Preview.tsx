import React from 'react';
import { ArrowRight } from 'lucide-react';

interface PreviewProps {
  inputPreview: string;
  outputPreview: string;
}

export const Preview: React.FC<PreviewProps> = ({ inputPreview, outputPreview }) => {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Input Preview (Text)</h3>
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-x-auto h-64 shadow-inner">
          <pre>{inputPreview}</pre>
        </div>
      </div>

      <div className="hidden md:flex flex-col justify-center items-center text-slate-600">
        <ArrowRight className="w-6 h-6" />
      </div>
      
      {/* Mobile-only separator */}
      <div className="md:hidden flex justify-center text-slate-600">
         <ArrowRight className="w-6 h-6 rotate-90" />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wider">Output Preview (ASC)</h3>
        <div className="bg-slate-900 rounded-lg border border-emerald-900/30 p-4 font-mono text-xs text-emerald-100 overflow-x-auto h-64 shadow-inner">
          <pre>{outputPreview}</pre>
        </div>
      </div>
    </div>
  );
};
