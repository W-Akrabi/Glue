"use client";

import { useEffect } from "react";
import { motion, useAnimation, useReducedMotion } from "motion/react";

export default function HeroFlow() {
  const reduceMotion = useReducedMotion();
  const branchControls = useAnimation();

  useEffect(() => {
    if (reduceMotion) return;

    let mounted = true;

    const loop = async () => {
      while (mounted) {
        await branchControls.start({ opacity: 1 });
        await sleep(1200);
        await branchControls.start({ opacity: 0.25 });
        await sleep(1800);
      }
    };

    loop();

    return () => {
      mounted = false;
    };
  }, [branchControls, reduceMotion]);

  if (reduceMotion) {
    return <StaticDiagram />;
  }

  return (
    <section className="relative w-full h-[460px] flex items-center justify-center overflow-hidden">
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="absolute h-[2px] w-[920px] bg-[#4F6AFA] origin-left"
      />

      <motion.div
        className="absolute top-1/2 left-[calc(50%-460px)] h-2 w-2 rounded-full bg-[#4F6AFA]"
        animate={{ x: [0, 300, 600, 900] }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.div
        animate={branchControls}
        initial={{ opacity: 0.25 }}
        className="absolute top-[160px] left-1/2 w-[180px] h-[2px] bg-[#7C8CFF]"
      />
      <motion.div
        animate={branchControls}
        initial={{ opacity: 0.25 }}
        className="absolute top-[160px] left-[calc(50%+180px)] h-[60px] w-[2px] bg-[#7C8CFF]"
      />

      <motion.div
        animate={branchControls}
        initial={{ opacity: 0.25 }}
        className="absolute top-[300px] left-[calc(50%-40px)] h-[2px] w-[180px] bg-[#7C8CFF]"
      />
      <motion.div
        animate={branchControls}
        initial={{ opacity: 0.25 }}
        className="absolute top-[300px] left-[calc(50%+140px)] h-[60px] w-[2px] bg-[#7C8CFF]"
      />

      <div className="flex gap-8 z-10">
        <Node delay={0.3} />
        <Node delay={0.45} />
        <Node delay={0.6} />
        <ActiveNode delay={0.8} />
        <Node delay={1.0} />
        <Node delay={1.15} />
        <Node delay={1.3} />
      </div>
    </section>
  );
}

function Node({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="rounded-xl px-6 py-3 border border-[#E3E6F3] bg-white text-sm shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
    />
  );
}

function ActiveNode({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{
        opacity: 1,
        y: 0,
        boxShadow: [
          "0 0 0px rgba(79,106,250,0)",
          "0 0 14px rgba(79,106,250,0.45)",
          "0 0 0px rgba(79,106,250,0)",
        ],
      }}
      transition={{
        delay,
        duration: 2.8,
        repeat: Infinity,
        repeatDelay: 1.5,
        ease: "easeInOut",
      }}
      className="rounded-xl px-6 py-3 bg-[#4F6AFA] text-white text-sm"
    >
      Step
    </motion.div>
  );
}

function StaticDiagram() {
  return (
    <div className="relative w-full h-[460px] flex items-center justify-center">
      <div className="absolute h-[2px] w-[920px] bg-[#7C8CFF]" />
      <div className="flex gap-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`left-${i}`}
            className="rounded-xl px-6 py-3 border border-[#E3E6F3] bg-white"
          />
        ))}
        <div className="rounded-xl px-6 py-3 bg-[#4F6AFA] text-white">
          Step
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`right-${i}`}
            className="rounded-xl px-6 py-3 border border-[#E3E6F3] bg-white"
          />
        ))}
      </div>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
