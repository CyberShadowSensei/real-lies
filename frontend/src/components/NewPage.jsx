import React, { useState } from "react";
import FeatureCard from "./FeatureCard";
import DemoSession from "./DemoSession";

const NewPage = ({ activeDemo, setActiveDemo }) => {
  const handleTry = (feature) => {
    setActiveDemo(feature);
    setTimeout(() => {
      if (window.locomotiveScroll) {
        window.locomotiveScroll.scrollTo('#newpage', {
          offset: 0,
          duration: 100, // Fast scroll
          disableLerp: true 
        });
      } else {
        const element = document.getElementById("newpage");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }, 100);
  };

  return (
    <section
      id="newpage"
      /* Deep charcoal to black gradient for depth */
      className="w-full min-h-screen bg-[#080808] text-white py-12 px-6 md:px-16 lg:px-24 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {!activeDemo ? (
          <div className="flex flex-col">
            {/* Header: Ultra-Wide Branding */}
            <div className="mb-32">
              <div className="flex items-center gap-6 mb-10 opacity-40">
                <div className="w-16 h-[1px] bg-white"></div>
                <span className="uppercase tracking-[0.6em] text-[9px] font-black">Reality Check Engine</span>
              </div>
              
              <h2 className="text-[14vw] md:text-[10vw] font-['BebasNeue'] tracking-tighter leading-[0.75] uppercase italic">
                Augen <br />
                <span className="text-zinc-800 not-italic">Insights</span>
              </h2>
              
              <div className="mt-12 flex flex-col md:flex-row md:items-center justify-between gap-10">
                <p className="max-w-md text-zinc-500 text-sm md:text-base leading-relaxed font-medium uppercase tracking-widest opacity-80">
                  Explore and understand visual information using our advanced multi-modal reality check system.
                </p>
                {/* Visual Accent */}
                <div className="hidden md:block w-32 h-32 rounded-full border border-white/5 flex items-center justify-center animate-spin-slow">
                   <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_15px_cyan]"></div>
                </div>
              </div>
            </div>

            {/* Premium Grid: Spacing is everything */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 md:gap-24">
              <div className="w-full max-w-md mx-auto">
                <FeatureCard
                  title="Video Analysis"
                  desc="Understanding dynamic reality check."
                  videoSrc="/video/demo3.mp4"
                  onTry={() => handleTry("Video Analysis")}
                />
              </div>

              {/* Center Tech Card: Minimalist & Clean */}
              <div className="hidden lg:flex flex-col items-center justify-center text-center h-full py-12 px-8">
                <div className="w-px h-20 bg-gradient-to-b from-transparent via-red-500/20 to-transparent mb-10"></div>
                
                <h4 className="text-red-500 text-[10px] uppercase tracking-[0.4em] font-bold mb-8">
                  Core Engine
                </h4>

                <p className="text-3xl font-light italic text-zinc-400 leading-tight mb-10">
                  "Synthesizing <br/> <span className="text-white font-normal not-italic">Reality Check</span> <br/> in real-time."
                </p>
                
                <div className="w-px h-20 bg-gradient-to-b from-transparent via-red-500/20 to-transparent"></div>
              </div>

              <div className="w-full max-w-md mx-auto">
                <FeatureCard
                  title="Audio Analysis"
                  desc="Semantic voice and tone understanding."
                  videoSrc="/video/demo1.mp4"
                  onTry={() => handleTry("Audio Analysis")}
                />
              </div>
            </div>
          </div>
        ) : (
          /* --- The "Control Center" Active UI --- */
          <div className="flex flex-col items-center gap-12 w-full animate-in fade-in zoom-in-95 duration-1000">
            
            {/* Minimalist Status Header */}
            <div className="w-full max-w-5xl flex items-center justify-between border-b border-white/5 pb-10">
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_cyan] animate-pulse"></div>
                  <span className="text-[10px] uppercase tracking-[0.5em] font-black text-zinc-600">Simulation Active</span>
                </div>
                <h3 className="text-5xl md:text-7xl font-['BebasNeue'] tracking-widest uppercase">
                  {activeDemo} <br />
                  <span className="text-zinc-800 italic text-3xl md:text-5xl normal-case">INSIGHT ENGINE</span>
                </h3>
              </div>

              {/* Terminate Button: Apple Style Minimalist */}
              <button 
                onClick={() => setActiveDemo(null)}
                className="group relative h-16 w-16 md:h-20 md:w-20 rounded-full border border-white/10 flex items-center justify-center transition-all duration-500 hover:border-red-500/50 hover:bg-red-500"
              >
                <span className="text-lg md:text-xl group-hover:scale-125 transition-transform duration-500">✕</span>
                {/* Tooltip */}
                <span className="absolute -bottom-10 opacity-0 group-hover:opacity-100 text-[8px] uppercase tracking-[0.4em] text-red-500 transition-opacity font-black">Close</span>
              </button>
            </div>

            {/* Simulation Canvas: Clean Borders, No Clutter */}
            <div className="w-full max-w-6xl bg-[#0c0c0c] rounded-[2rem] md:rounded-[4rem] border border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] overflow-hidden relative flex flex-col">
               {/* Decorative corner accents */}
               <div className="absolute top-10 left-10 w-4 h-4 border-t border-l border-white/20 z-20 pointer-events-none"></div>
               <div className="absolute bottom-10 right-10 w-4 h-4 border-b border-r border-white/20 z-20 pointer-events-none"></div>
               
               {/* Logic remains safe here */}
               <DemoSession mode={activeDemo} onExit={() => setActiveDemo(null)} />
            </div>

            <div className="opacity-20 flex gap-12 items-center">
              <span className="text-[9px] uppercase tracking-[0.8em] font-bold italic">Augen Reality Check Suite</span>
              <div className="w-20 h-[1px] bg-white"></div>
              <span className="text-[9px] uppercase tracking-[0.8em] font-bold italic">Powered by Augen AI</span>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}} />
    </section>
  );
};

export default NewPage;