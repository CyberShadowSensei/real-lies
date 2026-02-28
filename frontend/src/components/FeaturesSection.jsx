import { memo } from "react";
import { motion } from "framer-motion";

const FeatureCard = memo(({ feature, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.8, ease: [0.215, 0.61, 0.355, 1] }}
      className={`${feature?.size || ""} group relative overflow-hidden bg-[#0a0a0a] border border-white/5 hover:border-white/20 transition-all duration-500 rounded-3xl h-[400px] md:h-[480px]`}
    >
      {/* Background Image - Clean & Subtle */}
      <div className="absolute inset-0 z-0">
        <img
          src={feature?.img}
          alt={feature?.title}
          className="w-full h-full object-cover opacity-30 group-hover:scale-105 group-hover:opacity-50 transition-all duration-1000 ease-out"
        />
        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Text Content - Focused on Typography */}
      <div className="relative z-20 p-10 h-full flex flex-col justify-end">
        <div className="overflow-hidden">
          <motion.span
            initial={{ y: "100%" }}
            whileInView={{ y: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="text-zinc-500 font-mono text-[9px] tracking-[0.4em] mb-4 inline-block font-bold uppercase"
          >
            Module {index + 1} // Precision Intel
          </motion.span>
        </div>

        <h3 className="text-4xl md:text-5xl font-['BebasNeue'] text-white leading-[0.85] tracking-tight uppercase transition-all group-hover:text-cyan-400">
          {feature?.title}
        </h3>

        <p className="text-zinc-400 text-sm mt-6 font-light leading-relaxed max-w-[90%] opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
          {feature?.desc}
        </p>

        {/* Small Progress Indicator Line */}
        <div className="mt-8 h-[1px] w-12 bg-zinc-800 group-hover:w-full group-hover:bg-cyan-500 transition-all duration-700" />
      </div>
    </motion.div>
  );
});

const Featured = () => {
  const newsItems = [
    {
      title: "Real-time Verification",
      desc: "Cross-referencing multimodal datasets to isolate synthetic patterns from organic truth.",
      img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800",
      size: "md:col-span-1 lg:col-span-2"
    },
    {
      title: "Pixel Forensics",
      desc: "Sub-pixel analysis to detect manipulation in high-resolution media streams.",
      img: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800",
      size: "md:col-span-1 lg:col-span-2"
    },
    {
      title: "Geospatial Intel",
      desc: "Authenticating location data through synchronized global satellite metadata feeds.",
      img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800",
      size: "md:col-span-2 lg:col-span-4"
    },
  ];

  return (
    <section className="w-full bg-[#050505] py-32 border-t border-white/5">

      {/* Clean Modern Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 mb-24">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <span className="h-[1px] w-12 bg-cyan-500" />
            <span className="text-cyan-500 font-mono text-xs tracking-[0.5em] uppercase font-bold">The Truth Engine</span>
          </div>
          <h2 className="text-[14vw] md:text-[9vw] font-['BebasNeue'] tracking-tighter leading-[0.75] text-white uppercase">
            Reality <span className="text-zinc-800">Check</span> <br />
            <span className="italic">& Intelligence</span>
          </h2>
        </div>
      </div>

      {/* Grid Layout - More Spacing, More Breathing Room */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[90%] mx-auto">
        {newsItems.map((f, i) => (
          <FeatureCard key={i} feature={f} index={i} />
        ))}

        {/* Minimalist CTA Block */}
        <div className="md:col-span-4 lg:col-span-4 mt-12 p-16 rounded-[3rem] bg-zinc-900/10 border border-white/5 flex flex-col md:flex-row justify-between items-center group hover:bg-zinc-900/20 transition-all duration-700">
          <div className="text-left">
            <h4 className="text-zinc-500 font-mono text-xs tracking-widest uppercase mb-4">Network Status</h4>
            <p className="text-white text-3xl font-light tracking-tight">Access the global <span className="font-bold">Veritas Database</span> for full forensics.</p>
          </div>
          <button className="mt-8 md:mt-0 px-12 py-5 bg-white text-black font-bold text-[11px] uppercase tracking-[0.3em] rounded-full hover:bg-cyan-500 hover:text-white transition-all duration-500">
            Explore Intel
          </button>
        </div>
      </div>
    </section>
  );
};

export default Featured;