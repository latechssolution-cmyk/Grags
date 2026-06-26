import { motion } from "framer-motion";
import { useHero } from "@/store/heroStore";

const HeroSection = () => {
  const { hero, defaultImage } = useHero();
  const headingLines = hero.heading.split("\n");

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        {hero.useVideo && hero.videoUrl ? (
          <video
            src={hero.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <img
            src={hero.image}
            alt="GRAGS premium menswear collection"
            className="w-full h-full object-cover object-center"
            loading="eager"
            onError={(e) => { e.currentTarget.src = defaultImage; }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-charcoal/10 to-charcoal/60" />
      </motion.div>

      <div className="relative z-10 flex flex-col items-center justify-end h-full pb-20 md:pb-28 px-6 text-center">
        <motion.p
          className="text-xs md:text-sm tracking-mega-wide uppercase text-charcoal-foreground/80 font-sans mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          {hero.subheading}
        </motion.p>
        <motion.h2
          className="text-4xl md:text-7xl lg:text-8xl font-serif font-bold text-charcoal-foreground leading-none mb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {headingLines.map((line, i) => (
            <span key={i}>
              {line}
              {i < headingLines.length - 1 && <br />}
            </span>
          ))}
        </motion.h2>
        <motion.a
          href={hero.buttonLink}
          className="btn-trace px-10 py-4 bg-charcoal-foreground/10 backdrop-blur-sm text-charcoal-foreground text-xs tracking-ultra-wide uppercase font-sans border border-charcoal-foreground/40 hover:bg-charcoal-foreground/20 transition-all duration-500"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {hero.buttonText}
        </motion.a>
      </div>
    </section>
  );
};

export default HeroSection;
