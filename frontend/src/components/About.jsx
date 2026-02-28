import React from "react";
import { motion } from "framer-motion";

const About = () => {
  const team = [
    {
      name: "Shriyukt Gupta",
      role: "Lead Architect & AI/ML Specialist",
      email: "shriyuktgupta@gmail.com",
      linkedin: "https://www.linkedin.com/in/shriyukt-gupta-12b665277"
    },
    {
      name: "Devansh Arya",
      role: "AI/ML Specialist & Full-stack Developer",
      email: "devansharya12345@gmail.com",
      linkedin: "https://www.linkedin.com/in/devansh-arya-415378305/"
    },
    {
      name: "Divya Adhikari",
      role: "Embedded Systems Specialist & Full-stack Engineer",
      email: "divyaadikhari65@gmail.com",
      linkedin: "https://www.linkedin.com/in/divya-adhikari-213269325"
    },
    {
      name: "Shubhanshi Negi",
      role: "AI & Backend Engineer",
      email: "shubhanshinegi@gmail.com",
      linkedin: "https://www.linkedin.com/in/shubhanshi-negi-0a4352338"
    },
  ];

  return (
    <section
      id="about"
      data-scroll-section
      className="w-full bg-[#D1DCD9] text-black px-6 md:px-16 lg:px-24 py-24 md:py-32 lg:py-40 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center mb-32">
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-['BebasNeue'] tracking-tight leading-[0.9] uppercase pr-4"
          >
            Built by engineers. <br />
            <span className="text-zinc-500 italic">Designed for humans to seek <span className="text-black">Truth.</span></span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-8"
          >
            <p className="text-xl md:text-2xl leading-relaxed font-medium text-zinc-800">
              We are a team of developers, designers, and engineers focused on building
              technology that works in the real world.
            </p>
            <div className="h-[1px] w-full bg-black/10"></div>
          </motion.div>
        </div>

        {/* Team Section */}
        <div className="pt-20 border-t border-black/10">
          <div className="mb-16">
            <h2 className="text-5xl md:text-7xl font-['BebasNeue'] tracking-tight uppercase mb-4">
              The Team
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-[1px] bg-black"></div>
              <span className="text-zinc-500 text-lg md:text-xl font-medium italic">Veritas by The NPCs</span>            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col group"
              >
                <h3 className="text-xl font-bold uppercase tracking-tight mb-2 group-hover:text-zinc-600 transition-colors">
                  {member.name}
                </h3>
                <p className="text-zinc-600 text-sm font-medium leading-relaxed mb-6 h-12">
                  {member.role}
                </p>

                {/* Email Link */}
                <div className="mb-6">
                  <a
                    href={`mailto:${member.email}`}
                    className="text-[11px] font-bold text-black/40 hover:text-black transition-all border-b border-transparent hover:border-black pb-0.5 break-all"
                  >
                    {member.email}
                  </a>
                </div>

                {/* LinkedIn Link */}
                <div className="flex items-center gap-5 mt-auto">
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-blue-600 transition-colors"
                  >
                    <span className="w-6 h-6 rounded-full border border-black/20 flex items-center justify-center group-hover:border-blue-600 transition-colors font-serif italic">in</span>
                    LinkedIn
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;