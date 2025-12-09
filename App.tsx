import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { Preview } from './components/Preview';
import { convertTextToAsc } from './utils/converter';
import { ConversionResult } from './types';
import { FileOutput, RefreshCcw, Download, Calendar, Activity, Eye, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);
  
  // Date configuration
  const [dateInput, setDateInput] = useState<string>(new Date().toISOString().split('T')[0]);

  const handleFilesSelect = (selectedFiles: File[]) => {
    if (selectedFiles.length > 10) {
      alert("Please select a maximum of 10 files.");
      // Take first 10
      setFiles(selectedFiles.slice(0, 10));
    } else {
      setFiles(selectedFiles);
    }
    setResults([]); // Reset previous results
    setActivePreviewIndex(0);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setResults([]);
    
    // Create date in local time
    const [year, month, day] = dateInput.split('-').map(Number);
    const baseDate = new Date(year, month - 1, day);

    // Allow UI to update before blocking
    setTimeout(async () => {
      try {
        const newResults: ConversionResult[] = [];

        for (const file of files) {
          try {
            const text = await file.text();
            const { result, frameCount, previewInput, previewOutput } = convertTextToAsc(text, {
              baseDate
            });

            const outputName = file.name.replace(/\.[^/.]+$/, "") + ".asc";

            newResults.push({
              fileName: outputName,
              originalSize: file.size,
              convertedContent: result,
              frameCount,
              previewInput,
              previewOutput
            });
          } catch (fileErr) {
            console.error(`Error processing file ${file.name}`, fileErr);
            // Optionally handle individual file errors here
          }
        }
        
        setResults(newResults);
      } catch (err) {
        console.error(err);
        alert("Failed to process files.");
      } finally {
        setIsProcessing(false);
      }
    }, 100);
  };

  const handleDownload = (result: ConversionResult) => {
    const blob = new Blob([result.convertedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFiles([]);
    setResults([]);
    setActivePreviewIndex(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-slate-200 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <Activity className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">CAN Log Converter</h1>
          </div>
          <p className="text-slate-400 max-w-2xl">
            Convert standard text-based CAN data frames into Vector ASC format. Supports batch processing for up to 10 files.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Configuration Column */}
            <div className="lg:col-span-1 space-y-6">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-xs text-slate-400 border border-slate-700">1</span>
                  Configuration
                </h2>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Log Date
                  </label>
                  <input 
                    type="date" 
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-slate-500">
                    ASC headers require a date. Select the recording date of your log files.
                  </p>
                </div>
              </div>
            </div>

            {/* Upload & Action Column */}
            <div className="lg:col-span-2 space-y-6">
               <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-xs text-slate-400 border border-slate-700">2</span>
                  Upload & Convert
                </h2>

                <FileUpload 
                  onFilesSelect={handleFilesSelect} 
                  selectedFiles={files} 
                />

                <div className="flex items-center gap-4">
                  <button
                    onClick={handleConvert}
                    disabled={files.length === 0 || isProcessing}
                    className={`
                      flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
                      ${files.length === 0 
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                        : isProcessing
                          ? 'bg-indigo-600 text-white cursor-wait opacity-80'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                      }
                    `}
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCcw className="w-4 h-4 animate-spin" />
                        Processing {files.length} file{files.length > 1 ? 's' : ''}...
                      </>
                    ) : (
                      <>
                        <RefreshCcw className="w-4 h-4" />
                        Convert {files.length > 0 ? `${files.length} File${files.length > 1 ? 's' : ''}` : 'to ASC'}
                      </>
                    )}
                  </button>

                  {files.length > 0 && (
                    <button
                      onClick={reset}
                      className="px-4 py-3 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors"
                      title="Clear Selection"
                    >
                      Clear
                    </button>
                  )}
                </div>
            </div>
          </div>

          {/* Results Section */}
          {results.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col mb-6">
                 <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileOutput className="w-5 h-5 text-emerald-500" />
                  Conversion Complete
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Successfully converted {results.length} files. Click a file to view its preview.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* File List */}
                <div className="md:col-span-1 space-y-3">
                  {results.map((result, idx) => (
                    <div 
                      key={idx}
                      className={`
                        p-4 rounded-lg border transition-all cursor-pointer relative group
                        ${activePreviewIndex === idx 
                          ? 'bg-slate-800 border-indigo-500 shadow-md shadow-indigo-500/10' 
                          : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                        }
                      `}
                      onClick={() => setActivePreviewIndex(idx)}
                    >
                       <div className="flex justify-between items-start mb-2">
                          <h4 className={`text-sm font-medium truncate pr-4 ${activePreviewIndex === idx ? 'text-indigo-300' : 'text-slate-300'}`}>
                            {result.fileName}
                          </h4>
                          {activePreviewIndex === idx && <Eye className="w-4 h-4 text-indigo-500" />}
                       </div>
                       
                       <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                         <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                         <span>{result.frameCount} frames</span>
                       </div>

                       <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(result);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-950 hover:bg-emerald-900/30 text-slate-300 hover:text-emerald-400 border border-slate-800 hover:border-emerald-800 rounded text-xs transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                    </div>
                  ))}
                </div>

                {/* Active Preview */}
                <div className="md:col-span-2">
                  <div className="bg-slate-950/50 rounded-xl border border-slate-800 p-1">
                    <Preview 
                      inputPreview={results[activePreviewIndex].previewInput}
                      outputPreview={results[activePreviewIndex].previewOutput}
                    />
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
        
        <footer className="text-center text-slate-600 text-sm">
          <p>Processing is done locally in your browser. No data is uploaded to any server.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;