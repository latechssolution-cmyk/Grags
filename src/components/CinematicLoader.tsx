import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

const CinematicLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<"logo" | "shimmer" | "exit">("logo");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("shimmer"), 1800);
    const t2 = setTimeout(() => setPhase("exit"), 3200);
    const t3 = setTimeout(() => onComplete(), 4200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-charcoal fabric-texture"
        initial={{ opacity: 1 }}
        animate={phase === "exit" ? { y: "-100%" } : { y: 0 }}
        transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
      >
        <div className="grain-overlay" />

        <motion.div
          className="absolute top-1/2 left-0 stitch-line"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, ease: "easeInOut", delay: 0.3 }}
          style={{ opacity: 0.3 }}
        />

        {/* LOGO IMAGE */}
        <motion.img
          src={logo}
          alt="GRAGS"
          className="w-48 md:w-72 object-contain"
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
        />

        <motion.p
          className="mt-6 text-xs md:text-sm uppercase tracking-[0.6em] text-charcoal-foreground/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          Heritage Menswear
        </motion.p>

        {phase === "shimmer" && (
          <motion.div
            className="absolute inset-0 shimmer pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        <motion.div
          className="absolute bottom-16 left-1/2 -translate-x-1/2 stitch-line"
          initial={{ width: 0 }}
          animate={{ width: 120 }}
          transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
          style={{ opacity: 0.4 }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default CinematicLoader;