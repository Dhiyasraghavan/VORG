import React from "react";
import { AppView } from "../types";
import { motion } from "framer-motion";

interface HomeProps {
  onNavigate: (view: AppView) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center max-w-6xl mx-auto py-16 space-y-16">
      <motion.section
        className="w-full flex flex-col items-center space-y-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/40 text-xs uppercase tracking-[0.25em] text-primary mb-2"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Volunteer Orchestration Grid
        </motion.div>
        <motion.h1
          className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          Empower Your{" "}
          <span className="bg-gradient-to-r from-[#829672] via-indigo-200 to-[#829672] bg-clip-text text-transparent">
            Community
          </span>{" "}
          with V-org
        </motion.h1>

        <motion.p
          className="text-xl text-textLight leading-relaxed max-w-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          V-Org is a next‑generation operations cockpit for social organizations
          and passionate volunteers. Coordinate large‑scale festivals, rapid
          humanitarian responses, and hyper‑local fundraisers with AI‑assisted
          recruitment, intelligent scheduling, and live operational visibility.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <button
            onClick={() => onNavigate(AppView.ORG_LOGIN)}
            className="card-hover-lift bg-gradient-to-br from-[#31323e] via-[#829672] to-[#a0b48e] hover:from-[#4f5c40] hover:via-[#829672] hover:to-[#c7d7aa] text-white font-bold py-4 px-10 rounded-2xl text-lg shadow-xl shadow-primary/40 flex items-center justify-center gap-3"
          >
            <span>Login as Organization</span>
            <span className="inline-flex h-7 w-7 rounded-full bg-white/10 items-center justify-center border border-white/30">
              →
            </span>
          </button>
          <button
            onClick={() => onNavigate(AppView.VOL_LOGIN)}
            className="card-hover-lift bg-secondary/70 hover:bg-secondary text-textLight font-bold py-4 px-8 rounded-2xl text-lg border border-white/10 flex items-center justify-center gap-3"
          >
            <span>Login as Volunteers</span>
            <span className="inline-flex h-7 w-7 rounded-full bg-white/5 items-center justify-center border border-white/15">
              ★
            </span>
          </button>
        </motion.div>
      </motion.section>

      <motion.section
        className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{
          hidden: { opacity: 0, y: 40 },
          visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.12 } },
        }}
      >
        {[
          {
            title: "Intelligent Recruitment",
            desc: "AI models translate your event blueprint into precise volunteer demand across skills and shifts.",
            accent: "01",
          },
          {
            title: "Real-time Tracking",
            desc: "Live dashboards for check‑ins, task health, and incident flags so you always know where to deploy.",
            accent: "02",
          },
          {
            title: "Community First",
            desc: "A long‑term engagement graph that remembers every contribution and celebrates recurring heroes.",
            accent: "03",
          },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            className="section-gradient-border rounded-2xl bg-secondary/70 p-6 border border-white/5 card-hover-lift relative overflow-hidden"
            variants={{
              hidden: { opacity: 0, y: 24 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-primary/20 blur-2xl" />
            <p className="text-xs uppercase tracking-[0.25em] text-textLight/60 mb-3">
              {item.accent}
            </p>
            <h3 className="text-xl font-semibold text-white mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-textLight opacity-85">{item.desc}</p>
          </motion.div>
        ))}
      </motion.section>
    </div>
  );
};

export default Home;
