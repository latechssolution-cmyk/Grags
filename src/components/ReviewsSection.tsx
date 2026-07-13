import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { useProducts } from "@/store/productStore";

const fallbackReviews = [
  {
    name: "Ahmed R.",
    product: "Textured Polo — Olive",
    text: "The fabric quality is unmatched. This polo feels like something from a European luxury house. Grags has raised the bar for Pakistani menswear.",
    rating: 5,
  },
  {
    name: "Bilal K.",
    product: "Gurkha Pants — Khaki",
    text: "Ordered the Gurkha Pants and I'm genuinely impressed. The tailoring, the finish, the way it drapes — everything screams quality.",
    rating: 5,
  },
  {
    name: "Usman S.",
    product: "Signature Dual-Tone Polo",
    text: "Finally a brand that understands modern masculinity. Clean designs, premium fabrics, and packaging that makes you feel special.",
    rating: 5,
  },
];

const ReviewsSection = () => {
  const { products } = useProducts();
  const [current, setCurrent] = useState(0);

  // Pull every customer review submitted on any product page, newest first.
  // Falls back to curated testimonials until real reviews exist.
  const reviews = useMemo(() => {
    const live = products
      .flatMap((p) => (p.reviews ?? []).map((r) => ({ ...r, product: p.name })))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return live.length > 0 ? live : fallbackReviews;
  }, [products]);

  useEffect(() => {
    if (current >= reviews.length) setCurrent(0);
  }, [reviews.length, current]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  const active = reviews[current];
  if (!active) return null;

  return (
    <section className="px-5 md:px-10 py-20 md:py-32">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <p className="text-xs tracking-mega-wide uppercase text-muted-foreground font-sans mb-3">
          Testimonials
        </p>
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground">
          What They Say
        </h2>
      </motion.div>

      <div className="max-w-3xl mx-auto text-center min-h-[250px] flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="flex gap-1 mb-6">
              {Array.from({ length: active.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="w-4 h-4 fill-foreground text-foreground"
                />
              ))}
            </div>
            <p className="text-lg md:text-xl font-serif italic text-foreground/90 leading-relaxed mb-6">
              "{active.text}"
            </p>
            <p className="text-sm font-sans font-medium text-foreground tracking-wide">
              {active.name}
            </p>
            <p className="text-xs font-sans text-muted-foreground mt-1">
              {active.product}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex gap-2 mt-10">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "bg-foreground w-6"
                  : "bg-foreground/20 hover:bg-foreground/40"
              }`}
              aria-label={`Go to review ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
