import { motion } from "framer-motion";
import { useFabric } from "@/store/heroStore";

const FabricSection = () => {
  const { fabric } = useFabric();
  const headingLines = fabric.heading.split("\n");

  return (
    <section className="relative h-[70vh] md:h-screen overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.05 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <img
          src={fabric.image}
          alt="Premium cotton fabric texture close-up"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Darkened overlay for strong text contrast against the light fabric */}
        <div className="absolute inset-0 bg-black/50" />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
        <motion.p
          className="text-xs tracking-mega-wide uppercase text-white/70 font-sans mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {fabric.subheading}
        </motion.p>
        <motion.h2
          className="text-3xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-tight max-w-3xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {headingLines.map((line, i) => (
            <span key={i}>
              {line}
              {i < headingLines.length - 1 && <br />}
            </span>
          ))}
        </motion.h2>
        <motion.a
          href={fabric.buttonLink}
          className="mt-8 btn-trace px-8 py-3.5 text-xs tracking-ultra-wide uppercase font-sans text-white border border-white/50 hover:bg-white/10 transition-all duration-400"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {fabric.buttonText}
        </motion.a>
      </div>
    </section>
  );
};

export default FabricSection;
