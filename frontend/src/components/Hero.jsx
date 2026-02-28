import { motion } from "framer-motion";

const Hero = ({ onGetStarted }) => {
  const handleExplore = () => {
    onGetStarted("Complete Analysis");
  };

  return (
    <section
      id="home"
      data-scroll-section
      className="relative w-full h-screen flex items-end justify-center bg-black overflow-hidden pb-20 md:pb-32"
    >
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity duration-1000 grayscale-[50%]"
        src="/video/Smart_Glasses_Change_Future_Video.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      />

      {/* Advanced Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black" />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-16 text-center">
        
        {/* Animated Subheading - Kept Cyan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center justify-center gap-4 mb-6"
        >
          <div className="w-8 h-[1px] bg-cyan-500/50"></div>
          <span className="uppercase tracking-[0.6em] text-[9px] font-bold text-cyan-500 font-mono">
            Multi-Modal Misinfo System
          </span>
          <div className="w-8 h-[1px] bg-cyan-500/50"></div>
        </motion.div>

        {/* New Heading: Real Eyes, Real AI's */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-6xl sm:text-8xl md:text-[9.5rem] font-['BebasNeue'] not-italic tracking-tighter leading-[0.85] text-white uppercase italic"
        >
          Spot the<br />
          <span className="text-zinc-700 not-italic group-hover:text-cyan-500 transition-colors duration-500">
            Synthetic 
          </span>
        </motion.h1>

        {/* Updated Description for Misinformation */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-8 text-sm md:text-lg text-zinc-400 font-light max-w-3xl mx-auto leading-relaxed tracking-wider"
        >
          Decouple synthetic narratives from reality using advanced <span className="text-cyan-500">contextual forensics</span>. <br className="hidden md:block" />
          Our intelligence layer scans every pixel and phoneme to <span className="text-white">strive for truth in a post-truth world.</span>
        </motion.p>

        {/* Buttons UI - Keeping original White/Cyan transition */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-12 flex justify-center items-center"
        >
          <button 
            onClick={handleExplore}
            className="group relative px-12 py-5 bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-full overflow-hidden transition-all duration-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          >
            <span className="relative z-10 group-hover:text-white transition-colors duration-300">Run Diagnostics</span>
            <div className="absolute inset-0 bg-cyan-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
          </button>
        </motion.div>
      </div>

      {/* Decorative Side Text */}
      <div className="absolute left-10 bottom-10 hidden lg:block opacity-20 hover:opacity-100 transition-opacity">
        <span className="text-[10px] text-white uppercase tracking-[1em] font-light vertical-text" style={{ writingMode: 'vertical-rl' }}>
          DEBUNKING SYNTHETIC MEDIA
        </span>
      </div>
    </section>
  );
};

export default Hero;