import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useJournal, JournalArticle } from "@/store/journalStore";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TAG_COLORS: Record<string, string> = {
  Craft:    "text-amber-400   border-amber-400/30   bg-amber-400/5",
  Style:    "text-blue-400    border-blue-400/30    bg-blue-400/5",
  Heritage: "text-purple-400  border-purple-400/30  bg-purple-400/5",
  Culture:  "text-green-400   border-green-400/30   bg-green-400/5",
  Behind:   "text-rose-400    border-rose-400/30    bg-rose-400/5",
};

function tagClass(tag: string) {
  return TAG_COLORS[tag] ?? "text-muted-foreground border-border bg-secondary";
}

// Render markdown-lite: **bold**, newlines → paragraphs
function renderContent(text: string) {
  return text.split("\n\n").map((para, i) => {
    if (para.startsWith("**") && para.endsWith("**")) {
      return (
        <h3 key={i} className="text-sm font-sans font-semibold text-foreground tracking-wide mt-6 mb-2">
          {para.replace(/\*\*/g, "")}
        </h3>
      );
    }
    const parts = para.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="text-sm font-sans text-muted-foreground leading-7">
        {parts.map((part, j) =>
          part.startsWith("**") && part.endsWith("**")
            ? <strong key={j} className="text-foreground font-semibold">{part.replace(/\*\*/g, "")}</strong>
            : part
        )}
      </p>
    );
  });
}

// ── Article Reader Modal ─────────────────────────────────
const ArticleReader = ({ article, onClose }: { article: JournalArticle; onClose: () => void }) => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto py-10 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="absolute inset-0 bg-background/95 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.article
        className="relative z-10 w-full max-w-2xl bg-background border border-border p-8 md:p-12 my-auto"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 32 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-6">
          <span className={`text-[9px] tracking-ultra-wide uppercase font-sans border px-2 py-0.5 ${tagClass(article.tag)}`}>
            {article.tag}
          </span>
          <span className="text-[10px] font-sans text-muted-foreground/60">{article.date}</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground leading-tight mb-6">
          {article.title}
        </h1>

        <div className="h-px bg-border mb-8" />

        {/* Content */}
        <div className="space-y-4">
          {renderContent(article.content || article.excerpt)}
        </div>

        <button
          onClick={onClose}
          className="mt-10 flex items-center gap-1.5 text-[10px] tracking-ultra-wide uppercase font-sans text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-3 h-3" /> Back to Journal
        </button>
      </motion.article>
    </motion.div>
  </AnimatePresence>
);

// ── Journal Page ─────────────────────────────────────────
const JournalPage = () => {
  const { articles } = useJournal();
  const [selected, setSelected] = useState<JournalArticle | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const published = articles.filter((a) => a.published);
  const allTags = Array.from(new Set(published.map((a) => a.tag)));
  const filtered = activeTag ? published.filter((a) => a.tag === activeTag) : published;

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-24 pb-24">
        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-[10px] tracking-ultra-wide uppercase font-sans text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          <ChevronLeft className="w-3 h-3" /> Home
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <p className="text-[10px] tracking-mega-wide uppercase text-muted-foreground font-sans mb-3">
            Stories of Craft & Culture
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground tracking-tight">
            Journal
          </h1>
        </motion.div>

        {/* Tag filter */}
        {allTags.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-10">
            <button
              onClick={() => setActiveTag(null)}
              className={`text-[9px] tracking-ultra-wide uppercase font-sans border px-3 py-1.5 transition-colors ${
                activeTag === null
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag === activeTag ? null : tag)}
                className={`text-[9px] tracking-ultra-wide uppercase font-sans border px-3 py-1.5 transition-colors ${
                  activeTag === tag
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Article list */}
        {filtered.length === 0 ? (
          <p className="text-sm font-sans text-muted-foreground">No articles found.</p>
        ) : (
          <div className="space-y-0">
            {filtered.map((article, i) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="group border-t border-border last:border-b py-8 cursor-pointer"
                onClick={() => setSelected(article)}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    {/* Tag + date */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`text-[9px] tracking-ultra-wide uppercase font-sans border px-2 py-0.5 ${tagClass(article.tag)}`}>
                        {article.tag}
                      </span>
                      <span className="text-[10px] font-sans text-muted-foreground/60">{article.date}</span>
                    </div>

                    {/* Title */}
                    <h2 className="text-lg md:text-xl font-serif font-bold text-foreground leading-snug mb-2 group-hover:text-foreground/80 transition-colors">
                      {article.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-sm font-sans text-muted-foreground leading-relaxed line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="flex-shrink-0 pt-1">
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-200" />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Article reader */}
      {selected && (
        <ArticleReader article={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
};

export default JournalPage;
