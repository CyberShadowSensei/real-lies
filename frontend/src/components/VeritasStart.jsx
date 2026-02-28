import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, FileText, Globe, Zap, ArrowLeft, Upload, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const TAB_CONFIG = [
  { id: 'text', label: 'Linguistic Analysis', icon: <FileText size={16} /> },
  { id: 'image', label: 'Visual Forensics', icon: <Globe size={16} /> },
  { id: 'video', label: 'Media Integrity', icon: <Zap size={16} /> },
];

const VeritasDetector = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState('text');
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hasResult, setHasResult] = useState(false);

  const [result, setResult] = useState({
    score: 0,
    status: 'Ready',
    details: 'Waiting for input data...',
    metrics: [
      { name: 'Neural Consistency', val: 0 },
      { name: 'Source Authenticity', val: 0 },
      { name: 'Metadata Validation', val: 0 }
    ]
  });

  const fileInputRef = useRef(null);

  const startAnalysis = () => {
    if ((activeTab === 'text' && !inputValue.trim()) || (activeTab !== 'text' && !selectedFile)) return;
    setIsAnalyzing(true);
    setHasResult(false);

    setTimeout(() => {
      const mockScore = Math.floor(Math.random() * 100);
      setResult({
        score: mockScore,
        status: mockScore > 60 ? 'Suspicious' : 'Authentic',
        details: mockScore > 60
          ? 'High probability of synthetic manipulation detected in neural patterns.'
          : 'Content aligns with organic generation standards.',
        metrics: [
          { name: 'Neural Consistency', val: Math.floor(Math.random() * 40) + 60 },
          { name: 'Source Authenticity', val: Math.floor(Math.random() * 50) + 50 },
          { name: 'Metadata Validation', val: Math.floor(Math.random() * 30) + 70 }
        ]
      });
      setIsAnalyzing(false);
      setHasResult(true);
    }, 2000);
  };

  return (
    <div id="diagnostics-section" className="min-h-screen bg-black text-white font-sans selection:bg-cyan-500/30 relative border-t border-zinc-800">
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:32px_32px] opacity-50" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 mt-16">

        {/* Navigation Section */}
        <nav className="flex justify-between items-center mb-16">
          <div
            onClick={onBack}
            className="flex items-center gap-3 cursor-pointer group transition-all active:scale-95"
          >
            <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover:border-cyan-500/50 transition-colors">
              <Shield size={24} fill="currentColor" className="opacity-80" />
            </div>
            <div>
              <h1 className="text-3xl font-['BebasNeue'] tracking-wider group-hover:text-cyan-400 transition-colors uppercase">
                Truth<span className="text-cyan-500">Lens</span>
              </h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Multi-Modal Diagnostics</p>
            </div>
          </div>

          <button
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-cyan-400 transition-all bg-zinc-900 px-5 py-2.5 rounded-lg border border-zinc-800 shadow-sm hover:border-cyan-500/30 active:scale-95"
          >
            <ArrowLeft size={16} /> Close Panel
          </button>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex p-1 bg-zinc-900 rounded-2xl w-fit border border-zinc-800">
              {TAB_CONFIG.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setHasResult(false); setInputValue(''); setSelectedFile(null); }}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab.id ? 'bg-zinc-800 text-cyan-400 shadow-sm border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-[2rem] border border-zinc-800 shadow-2xl overflow-hidden">
              <div className="p-8">
                <AnimatePresence mode="wait">
                  {activeTab === 'text' ? (
                    <motion.textarea
                      key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      placeholder="Enter content for deep linguistic verification..."
                      className="w-full h-64 bg-transparent border-none outline-none resize-none text-white placeholder:text-zinc-600 text-lg font-light tracking-wide"
                      value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                    />
                  ) : (
                    <motion.div
                      key="file" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-2xl hover:bg-zinc-800/50 hover:border-cyan-500/50 transition-colors cursor-pointer group"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center text-cyan-500 mb-4 group-hover:scale-110 shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-transform">
                        <Upload size={24} />
                      </div>
                      <p className="font-mono text-zinc-400 text-sm uppercase tracking-wider">Click to upload {activeTab} asset</p>
                      {selectedFile && <p className="mt-4 text-cyan-400 font-mono text-xs bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">{selectedFile.name}</p>}
                      <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files[0])} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="bg-zinc-950 p-6 border-t border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono uppercase tracking-wider">
                  <Info size={14} className="text-cyan-500" /> Neural scan ready
                </div>
                <button
                  onClick={startAnalysis}
                  disabled={isAnalyzing}
                  className="px-8 py-3 bg-cyan-500 text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-cyan-400 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2 active:scale-95"
                >
                  {isAnalyzing ? "Analyzing..." : "Process Analysis"}
                </button>
              </div>
            </div>
          </div>

          {/* Report Area */}
          <div className="space-y-6">
            <div className="bg-zinc-900/50 backdrop-blur-sm rounded-[2rem] border border-zinc-800 p-8 shadow-2xl">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-8 border-b border-zinc-800 pb-4">Analysis Report</h3>
              <div className="flex flex-col items-center text-center">
                <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" fill="none" stroke="#27272a" strokeWidth="8" />
                    <motion.circle
                      cx="80" cy="80" r="70" fill="none" stroke={hasResult ? (result.score > 60 ? "#ef4444" : "#06b6d4") : "#3f3f46"}
                      strokeWidth="8" strokeDasharray="440"
                      initial={{ strokeDashoffset: 440 }}
                      animate={{ strokeDashoffset: 440 - (440 * result.score) / 100 }}
                      strokeLinecap="round"
                      className={hasResult ? (result.score > 60 ? 'drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]') : ''}
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-4xl font-['BebasNeue'] tracking-wider text-white">{result.score}%</span>
                    <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Confidence</p>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 border ${hasResult ? (result.score > 60 ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20') : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                  {result.status}
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed font-light">{result.details}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VeritasDetector;