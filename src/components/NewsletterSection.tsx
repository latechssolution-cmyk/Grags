import { useState } from "react";
import { motion } from "framer-motion";

const FORMSPREE = "https://formspree.io/f/mjgqwpbq";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("sending");
    try {
      const res = await fetch(FORMSPREE, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email, _subject: "Newsletter subscription — GRAGS" }),
      });
      if (res.ok) {
        setStatus("sent");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="relative py-24 md:py-36 overflow-hidden bg-charcoal fabric-texture">
      <div className="grain-overlay" />
      <div className="relative z-10 max-w-2xl mx-auto text-center px-6">
        <motion.p
          className="text-xs tracking-mega-wide uppercase text-charcoal-foreground/60 font-sans mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          Stay Connected
        </motion.p>
        <motion.h2
          className="text-3xl md:text-5xl font-serif font-bold text-charcoal-foreground mb-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          Join the Heritage
        </motion.h2>
        <motion.p
          className="text-sm text-charcoal-foreground/60 font-sans mb-10 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          Be the first to know about new drops, exclusive offers, and the GRAGS
          story.
        </motion.p>

        {status === "sent" ? (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm font-sans text-charcoal-foreground/70 tracking-wide"
          >
            You're in. Welcome to the heritage.
          </motion.p>
        ) : (
          <motion.form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            onSubmit={handleSubmit}
          >
            <input
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-5 py-3.5 bg-charcoal-foreground/5 border border-charcoal-foreground/20 text-charcoal-foreground text-sm font-sans placeholder:text-charcoal-foreground/30 focus:outline-none focus:border-charcoal-foreground/50 transition-colors"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="px-8 py-3.5 bg-charcoal-foreground text-charcoal text-xs tracking-ultra-wide uppercase font-sans hover:bg-charcoal-foreground/90 transition-colors duration-300 disabled:opacity-60"
            >
              {status === "sending" ? "..." : "Subscribe"}
            </button>
          </motion.form>
        )}
        {status === "error" && (
          <p className="text-xs text-red-400 font-sans mt-3">Something went wrong. Please try again.</p>
        )}
      </div>
    </section>
  );
};

export default NewsletterSection;
