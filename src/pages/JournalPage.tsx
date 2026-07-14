import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useJournal, getArticleUrl, resolveImageUrl } from "@/store/journalStore";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

const TAG_COLORS: Record<string, string> = {
  Craft:    "text-amber-600   border-amber-500/30   bg-amber-500/8",
  Style:    "text-blue-600    border-blue-500/30    bg-blue-500/8",
  Heritage: "text-purple-600  border-purple-500/30  bg-purple-500/8",
  Culture:  "text-green-700   border-green-500/30   bg-green-500/8",
  Behind:   "text-rose-600    border-rose-500/30    bg-rose-500/8",
};

function tagClass(tag: string) {
  return TAG_COLORS[tag] ?? "text-muted-foreground border-border bg-secondary";
}

// ── Journal Page ─────────────────────────────────────────
const JournalPage = () => {
  const { articles } = useJournal();
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const published = articles.filter((a) => a.published);
  const allTags = Array.from(new Set(published.map((a) => a.tag)));
  const filtered = activeTag ? published.filter((a) => a.tag === activeTag) : published;

  useSEO({
    title: "Journal | Grags",
    description: "Stories, craft notes, and style guidance from Grags — modern tailoring made in Pakistan.",
  });

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
                className="group border-t border-border last:border-b py-8"
              >
                <Link to={getArticleUrl(article)} className="flex items-start justify-between gap-6">
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

                  {/* Cover image thumbnail or arrow */}
                  <div className="flex-shrink-0 pt-1 flex items-center gap-3">
                    {article.coverImage && (
                      <img src={resolveImageUrl(article.coverImage)} alt="" className="w-16 h-16 object-cover hidden sm:block opacity-80 group-hover:opacity-100 transition-opacity" />
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-200" />
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default JournalPage;
