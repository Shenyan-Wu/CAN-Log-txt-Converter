import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { Preview } from './components/Preview';
import { convertTextToAsc } from './utils/converter';
import { ConversionResult } from './types';
import { FileOutput, RefreshCcw, Download, Calendar, Activity } from 'lucide-react';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Date configuration
  const [dateInput, setDateInput] = useState<string>(new Date().toISOString().split('T')[0]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setConversionResult(null); // Reset previous result
  };

  const handleConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    
    // Allow UI to update before blocking with processing
    setTimeout(async () => {
      try {
        const text = await file.text();
        
        // Create date in local time to avoid timezone offsets shifting the day
        const [year, month, day] = dateInput.split('-').map(Number);
        const baseDate = new Date(year, month - 1, day);
        
        const { result, frameCount, previewInput, previewOutput } = convertTextToAsc(text, {
          baseDate
        });

        const outputName = file.name.replace(/\.[^/.]+$/, "") + ".asc";

        setConversionResult({
          fileName: outputName,
          originalSize: file.size,
          convertedContent: result,
          frameCount,
          previewInput,
          previewOutput
        });
      } catch (err) {
        console.error(err);
        alert("Failed to parse the file.");
      } finally {
        setIsProcessing(false);
      }
    }, 100);
  };

  const handleDownload = () => {
    if (!conversionResult) return;

    const blob = new Blob([conversionResult.convertedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = conversionResult.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setConversionResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-slate-200 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <Activity className="w-6 h-6 text-indigo-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">CAN Log Converter</h1>
          </div>
          <p className="text-slate-400 max-w-2xl">
            Convert standard text-based CAN data frames into Vector ASC format compatible with CANoe, CANalyzer, and other automotive tools.
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
                    ASC headers require a date. Select the recording date of your log file.
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
                  onFileSelect={handleFileSelect} 
                  selectedFileName={file?.name} 
                />

                <div className="flex items-center gap-4">
                  <button
                    onClick={handleConvert}
                    disabled={!file || isProcessing}
                    className={`
                      flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
                      ${!file 
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
                        Processing...
                      </>
                    ) : (
                      <>
                        <RefreshCcw className="w-4 h-4" />
                        Convert to ASC
                      </>
                    )}
                  </button>

                  {conversionResult && (
                    <button
                      onClick={reset}
                      className="px-4 py-3 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors"
                      title="Reset"
                    >
                      Clear
                    </button>
                  )}
                </div>
            </div>
          </div>

          {/* Results Section */}
          {conversionResult && (
            <div className="mt-12 pt-8 border-t border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                   <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileOutput className="w-5 h-5 text-emerald-500" />
                    Conversion Complete
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Processed <span className="text-slate-200 font-mono">{conversionResult.frameCount}</span> frames.
                  </p>
                </div>
               
                <button
                  onClick={handleDownload}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download .asc File
                </button>
              </div>

              <Preview 
                inputPreview={conversionResult.previewInput}
                outputPreview={conversionResult.previewOutput}
              />
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