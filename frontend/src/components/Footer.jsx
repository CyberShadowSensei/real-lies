const Footer = ({ onGetStarted }) => {
  const scrollToSection = (id) => {
    const scroll = window.locomotiveScroll;
    if (scroll) {
      scroll.scrollTo(id, {
        offset: -100,
        duration: 800,
      });
    } else {
      const element = document.querySelector(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <footer
      className="w-full bg-[#050505] text-white px-6 md:px-16 py-20 md:py-32 border-t border-white/5"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-16 md:gap-20">

        {/* Left Side: Massive Branding & Vision */}
        <div className="w-full md:flex-1">
          <div className="overflow-hidden">
            <h1
              className="text-[22vw] md:text-[12vw] font-['BebasNeue'] tracking-tighter leading-[0.8] md:leading-[0.7] opacity-90"
            >
              VERITAS
            </h1>
          </div>

          <div className="mt-8 md:mt-12 max-w-lg">
            <h2 className="text-zinc-600 uppercase tracking-[0.5em] text-[9px] md:text-[10px] font-black mb-4">
              The Mission
            </h2>
            <p className="text-zinc-400 text-lg md:text-2xl font-light leading-snug md:leading-tight">
              Enhancing visual perception through the world's most advanced
              multi-modal AI contextual awareness engine. Strive for truth with intelligence.
            </p>
          </div>
        </div>

        {/* Right Side: Navigation */}
        <div className="w-full md:w-auto flex flex-col items-start md:items-end gap-12 md:gap-16">
          <div className="text-left md:text-right w-full">
            <h3 className="text-zinc-700 text-[10px] md:text-xs uppercase tracking-[0.4em] font-black mb-6 md:mb-8">
              Directory
            </h3>
            <ul className="flex flex-col gap-4 md:gap-5">
              {[
                { label: "Home", id: "#home" },
                { label: "Features", id: "#features" },
                { label: "Demo", id: "demo" },
                { label: "About", id: "#about" }
              ].map((link) => (
                <li
                  key={link.label}
                  onClick={() => {
                    if (link.label === "Demo") {
                      onGetStarted && onGetStarted("Multi-Modal Scan");
                    } else {
                      scrollToSection(link.id);
                    }
                  }}
                  className="cursor-pointer group relative inline-block self-start md:self-end"
                >
                  <span className="text-3xl md:text-5xl font-['BebasNeue'] tracking-widest text-zinc-600 group-hover:text-white transition-all duration-500 uppercase italic">
                    {link.label}
                  </span>
                  <span className="absolute bottom-1 left-0 w-0 h-[1px] bg-cyan-500 group-hover:w-full transition-all duration-500"></span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Row: Legal & Info */}
      <div className="mt-20 md:mt-32 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-[9px] md:text-[10px] tracking-[0.3em] uppercase text-zinc-700 font-bold">
          <span>© 2026 Veritas AI</span>
          <span className="hidden md:inline text-zinc-800">|</span>
          <span>Digital Integrity Initiative</span>
        </div>

        <div className="text-[9px] md:text-[10px] tracking-[0.4em] uppercase text-zinc-700 font-black italic">
          Verifying the Digital World
        </div>
      </div>
    </footer>
  );
};

export default Footer;