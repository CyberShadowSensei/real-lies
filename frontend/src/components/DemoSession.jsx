import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Video,
  Mic,
  Image as ImageIcon,
  Link as LinkIcon,
  FileText,
  Activity,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
  Info,
  Cpu,
  Fingerprint,
  Database,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const DemoSession = ({ onExit, mode }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const audioFileInputRef = useRef(null);
  const imageFileInputRef = useRef(null);

  const [active, setActive] = useState(false);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeResult, setActiveResult] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');

  // Start devices on mount
  useEffect(() => {
    const startDevices = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setActive(true);
      } catch {
        setError("Camera or microphone permission denied");
      }
    };
    startDevices();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // API Handlers
  const handleUpload = async (file, endpoint, type) => {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    const fieldName = type === 'video' ? 'video_file' : type === 'audio' ? 'audio_file' : 'image_file';
    formData.append(fieldName, file);

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, { method: "POST", body: formData });
      if (!response.ok) throw new Error("Analysis failed. Please check your connection.");
      const result = await response.json();
      setActiveResult({ type: 'report', data: result });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJsonRequest = async (body, endpoint) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Analysis failed.");
      const result = await response.json();
      setActiveResult({ type: 'report', data: result });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sub-component: Unified Report Display
  const ReportDisplay = ({ report }) => {
    const [showRaw, setShowRaw] = useState(false);

    const getVerdictStyle = (v) => {
      if (v?.includes("TRUE")) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
      if (v?.includes("MISLEADING")) return "text-rose-400 border-rose-500/30 bg-rose-500/10";
      return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 pb-10"
      >
        {/* Verdict Badge */}
        <div className={`p-4 rounded-2xl border backdrop-blur-xl ${getVerdictStyle(report.verdict)}`}>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Final Verdict</span>
            <ShieldCheck size={16} />
          </div>
          <h2 className="text-2xl font-['BebasNeue'] tracking-wide uppercase italic">{report.verdict}</h2>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-[9px] uppercase tracking-tighter mb-1 opacity-60">
                <span>Credibility</span>
                <span>{report.credibility_score}%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${report.credibility_score}%` }}
                  className="h-full bg-current"
                />
              </div>
            </div>
            <div className="text-center">
              <span className="block text-[9px] uppercase opacity-60">Confidence</span>
              <span className="text-sm font-mono">{(report.confidence * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Deepfake / AI Generator Meter */}
          {report.frame_analysis && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest flex items-center gap-2">
                  <Video size={12} /> Deepfake Probability
                </span>
                <span className="text-xs font-mono font-bold text-purple-400">
                  {(report.frame_analysis.ai_generated_score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${report.frame_analysis.ai_generated_score * 100}%` }}
                  className={`h-full absolute left-0 top-0 transition-all duration-1000 ${report.frame_analysis.ai_generated_score > 0.5 ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 'bg-purple-500 shadow-[0_0_10px_#a855f7]'
                    }`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Technical Provenance */}
        <div className="p-4 bg-zinc-900/80 rounded-2xl border border-white/10 space-y-4 shadow-lg shadow-black/50">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-400 border-b border-white/5 pb-3">
            <Cpu size={14} className="text-blue-400" />
            <span>AI Transparency & Provenance</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[8px] text-zinc-500 uppercase tracking-widest block font-bold">API Gateway</span>
              <span className="text-xs font-mono font-medium text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded inline-block border border-cyan-500/20">
                {report.api_used || "TruthLens Core"}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-[8px] text-zinc-500 uppercase tracking-widest block font-bold">Neural Engine</span>
              <span className="text-xs font-mono font-medium text-purple-400 bg-purple-500/10 px-2 py-1 rounded inline-block truncate max-w-[150px] border border-purple-500/20" title={report.analysis_model}>
                {report.analysis_model || "Deterministic Engine"}
              </span>
            </div>
          </div>

          <div className="bg-black/60 rounded-xl p-3 border border-white/5">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-zinc-500 uppercase tracking-widest font-bold">Execution Path:</span>
                <span className="text-zinc-400 font-mono bg-white/5 px-2 py-0.5 rounded truncate max-w-[180px] text-right" title={report.processing_path}>{report.processing_path}</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-zinc-500 uppercase tracking-widest font-bold">System Confidence:</span>
                <span className="text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{(report.confidence * 100).toFixed(1)}%</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5">
              <p className="text-[9px] text-zinc-500 leading-relaxed italic">
                * Complete AI pipeline traceability. The system confidence metric is mathematically derived from direct factual aggregation and deterministic logical fallback cross-referencing. See Analytical Reasoning below for logic traces.
              </p>
            </div>
          </div>
        </div>

        {/* Reasoning Chain */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 ml-1">
            <Fingerprint size={12} />
            <span>Analytical Reasoning</span>
          </div>
          <div className="space-y-2">
            {report.reasoning_chain.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs text-zinc-300 leading-relaxed flex gap-3"
              >
                <span className="text-zinc-600 font-mono">{i + 1}</span>
                {step}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Raw Model Output Toggle */}
        {report.raw_response && (
          <div className="mt-4 border border-white/10 bg-black/40 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowRaw(!showRaw)}
              className="w-full flex items-center justify-between p-3 text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white transition-colors hover:bg-white/5"
            >
              <div className="flex items-center gap-2">
                <Database size={12} />
                <span>Raw Model Output</span>
              </div>
              {showRaw ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <AnimatePresence>
              {showRaw && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 pb-3">
                    <pre className="text-[9px] font-mono whitespace-pre-wrap text-zinc-400 bg-[#0a0a0a] p-3 rounded border border-white/5 max-h-60 overflow-y-auto custom-scrollbar">
                      {report.raw_response}
                    </pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Summary */}
        <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 italic text-sm text-zinc-300 leading-relaxed">
          <Info size={14} className="mb-2 text-blue-400 opacity-50" />
          {report.summary}
        </div>

        {/* Red Flags */}
        {report.red_flags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-rose-500 ml-1">
              <AlertTriangle size={12} />
              <span>Red Flags Detected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {report.red_flags.map((flag, i) => (
                <span key={i} className="px-2 py-1 bg-rose-500/10 border border-rose-500/20 rounded-md text-[10px] text-rose-400">
                  {flag}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-full bg-[#050505] font-sans selection:bg-red-500/30">

      {/* LEFT: Immersive Feed */}
      <div className="relative w-full lg:flex-1 bg-black overflow-hidden h-[40vh] lg:h-full">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover opacity-60 grayscale-[0.5]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent pointer-events-none" />

        {/* Status Overlay */}
        <div className="absolute top-6 left-6 flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-full border border-white/10">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`w-2 h-2 rounded-full ${active ? 'bg-red-500 shadow-[0_0_12px_#ef4444]' : 'bg-zinc-600'}`}
          />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white font-black italic">
            {active ? `TRUTHLENS LIVE • ${mode}` : 'ENGINE OFFLINE'}
          </span>
        </div>

        {/* Floating Scan UI */}
        <div className="absolute bottom-10 left-10 hidden lg:block">
          <div className="flex items-center gap-4 text-white/30">
            <Activity size={20} className="animate-pulse" />
            <div className="h-px w-32 bg-white/10" />
            <span className="text-[10px] uppercase tracking-widest font-mono">Quantum Logic Engine Active</span>
          </div>
        </div>
      </div>

      {/* RIGHT: High-Tech Control Panel */}
      <div className="w-full lg:w-[450px] bg-[#080808] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col p-8 overflow-y-auto custom-scrollbar">

        {/* Panel Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-3xl font-['BebasNeue'] tracking-wider text-white italic uppercase leading-none">Verification</h3>
            <p className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 mt-1">Multi-Modal Contextual Engine</p>
          </div>
          {loading && (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <RefreshCw className="text-red-500" size={20} />
            </motion.div>
          )}
        </div>

        {/* Results Area */}
        <div className="flex-1 mb-10">
          <AnimatePresence mode="wait">
            {!activeResult && !loading ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-64 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-3xl bg-white/[0.02]"
              >
                <ShieldCheck size={40} className="text-zinc-800 mb-4" />
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-600">Awaiting Signal Ingestion</p>
              </motion.div>
            ) : loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-64 flex flex-col items-center justify-center space-y-4"
              >
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ height: [10, 30, 10] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                      className="w-1 bg-red-500 rounded-full"
                    />
                  ))}
                </div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-red-500 font-bold animate-pulse">Deconstructing Evidence...</p>
              </motion.div>
            ) : (
              <ReportDisplay key="result" report={activeResult.data} />
            )}
          </AnimatePresence>
        </div>

        {/* Action Controls */}
        <div className="space-y-6 mt-auto">

          {/* File Uploads Row */}
          <div className="grid grid-cols-3 gap-3">
            <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={(e) => handleUpload(e.target.files[0], '/analyze/video', 'video')} />
            <button onClick={() => fileInputRef.current.click()} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-red-500/50 hover:bg-red-500/5 transition-all group">
              <Video size={18} className="text-zinc-500 group-hover:text-red-500" />
              <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Video</span>
            </button>

            <input type="file" ref={audioFileInputRef} className="hidden" accept="audio/*" onChange={(e) => handleUpload(e.target.files[0], '/analyze/audio', 'audio')} />
            <button onClick={() => audioFileInputRef.current.click()} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group">
              <Mic size={18} className="text-zinc-500 group-hover:text-purple-500" />
              <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Audio</span>
            </button>

            <input type="file" ref={imageFileInputRef} className="hidden" accept="image/*" onChange={(e) => handleUpload(e.target.files[0], '/analyze/image', 'image')} />
            <button onClick={() => imageFileInputRef.current.click()} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-teal-500/50 hover:bg-teal-500/5 transition-all group">
              <ImageIcon size={18} className="text-zinc-500 group-hover:text-teal-500" />
              <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Image</span>
            </button>
          </div>

          {/* URL Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <LinkIcon size={14} className="text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
            </div>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="SCAN URL FOR MISINFORMATION..."
              className="w-full pl-12 pr-12 py-4 bg-zinc-900 border border-white/5 rounded-2xl text-[10px] text-white placeholder:text-zinc-700 focus:outline-none focus:border-blue-500/50 transition-all uppercase tracking-widest"
            />
            <button
              onClick={() => handleJsonRequest({ url: urlInput }, '/analyze/url')}
              className="absolute right-2 top-2 bottom-2 px-3 bg-white/5 hover:bg-blue-500 rounded-xl transition-colors text-zinc-500 hover:text-white"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Text Input */}
          <div className="space-y-3">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="PASTE TEXT OR UPLOAD VOICE NOTE..."
              rows={3}
              className="w-full p-5 bg-zinc-900 border border-white/5 rounded-2xl text-[10px] text-white placeholder:text-zinc-700 focus:outline-none focus:border-orange-500/50 transition-all uppercase tracking-widest leading-relaxed resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleJsonRequest({ content: textInput }, '/analyze/text')}
                disabled={!textInput.trim()}
                className="flex-1 py-4 bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:hover:bg-red-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)]"
              >
                Factual Verification Engine
              </button>
              <button
                onClick={() => audioFileInputRef.current.click()}
                className="px-6 bg-zinc-900 border border-white/10 hover:border-purple-500/50 rounded-2xl text-zinc-500 hover:text-purple-500 transition-all"
                title="Voice Ingestion"
              >
                <Mic size={18} />
              </button>
            </div>
          </div>

        </div>

        {/* Error Toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex justify-between items-center"
            >
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-widest">{error}</span>
              <button onClick={() => setError(null)} className="text-rose-400 hover:text-white transition-colors">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default DemoSession;
