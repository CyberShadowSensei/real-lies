import React, { memo } from "react";
import { motion } from "framer-motion";
import { Shield, Brain, Activity, Lock, Database, Search } from "lucide-react";

const FeatureItem = memo(({ feature, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
            className="group relative overflow-hidden bg-[#0a0a0a] border border-white/5 hover:border-white/20 transition-all duration-500 rounded-3xl p-10 flex flex-col justify-start h-[360px] md:h-[400px]"
        >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] group-hover:bg-cyan-500/10 transition-colors" />

            {/* Header Content */}
            <div className="flex justify-between items-start mb-12 relative z-20">
                <div className="w-12 h-12 rounded-xl bg-[#0f0f0f] border border-white/10 flex items-center justify-center text-cyan-500 group-hover:scale-110 group-hover:border-cyan-500/30 transition-all duration-500">
                    {feature.icon}
                </div>
                <motion.span
                    initial={{ y: "50%", opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="text-zinc-500 font-mono text-[9px] tracking-[0.4em] font-bold uppercase"
                >
                    Layer // {index + 1}
                </motion.span>
            </div>

            <h3 className="text-3xl md:text-4xl font-['BebasNeue'] text-white leading-[0.85] tracking-tight uppercase transition-all group-hover:text-cyan-400 relative z-20">
                {feature.title}
            </h3>

            <p className="text-zinc-400 text-sm mt-6 font-light leading-relaxed max-w-[95%] relative z-20">
                {feature.description}
            </p>

            {/* Progress Indicator Line */}
            <div className="mt-auto h-[1px] w-12 bg-zinc-800 group-hover:w-full group-hover:bg-cyan-500 transition-all duration-700 relative z-20" />
        </motion.div>
    );
});

const FeaturesShowcase = () => {
    const features = [
        {
            title: "Multi-Modal Scan",
            description: "Analyze Text, URLs, Images, Audio, and Video. Automatically routes content to specialized neural networks.",
            icon: <Activity size={20} />
        },
        {
            title: "Factual Verification",
            description: "Applies a deterministic logic layer. If facts can't be independently proven, the system forces an 'UNVERIFIED' status.",
            icon: <Search size={20} />
        },
        {
            title: "Deepfake Forensics",
            description: "Zero-tolerance vision pipeline aggressively hunts temporal and background artifacts in media files.",
            icon: <Brain size={20} />
        },
        {
            title: "Complete Provenance",
            description: "No black boxes. Reports list the exact API provider, specific LLM/Vision model, and raw analytical trace.",
            icon: <Database size={20} />
        },
        {
            title: "Zero Retention",
            description: "Data remains yours. The engine processes assets entirely in-memory. No databases, no persistent logging.",
            icon: <Lock size={20} />
        },
        {
            title: "Ethical Safeguards",
            description: "Classifiers instantly reject biased solicitations, explicit content, and prompt injection attempts.",
            icon: <Shield size={20} />
        }
    ];

    return (
        <section id="features" className="w-full bg-[#050505] py-24 md:py-32 border-t border-white/5">
            {/* Clean Modern Header (Matching FeaturesSection) */}
            <div className="max-w-7xl mx-auto px-6 md:px-16 mb-24">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                        <span className="h-[1px] w-12 bg-cyan-500" />
                        <span className="text-cyan-500 font-mono text-xs tracking-[0.5em] uppercase font-bold">System Architecture</span>
                    </div>
                    <h2 className="text-[12vw] md:text-[8vw] font-['BebasNeue'] tracking-tighter leading-[0.75] text-white uppercase">
                        Core <span className="text-zinc-800">Engine</span> <br />
                        <span className="italic">& Capabilities</span>
                    </h2>
                    <p className="text-zinc-500 text-lg md:text-xl font-light tracking-wide max-w-2xl mt-4">
                        Designed with an advanced backend layer that prioritizes deterministic logic over hallucination.
                    </p>
                </div>
            </div>

            {/* Grid Layout - Same as FeaturesSection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[90%] mx-auto">
                {features.map((feature, index) => (
                    <FeatureItem key={index} feature={feature} index={index} />
                ))}
            </div>
        </section>
    );
};

export default FeaturesShowcase;
