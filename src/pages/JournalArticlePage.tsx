import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useJournal, resolveImageUrl } from "@/store/journalStore";
import { useSEO } from "@/hooks/useSEO";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

// Render markdown-lite: **bold**, [text](url) inline links, bare shoppable URLs
// (e.g. "Visit: https://grags.shop/product/xyz"), newlines → paragraphs
function renderInline(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s)]+)/g);
  return parts.map((part, j) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-${j}`} className="text-foreground font-semibold">
          {part.replace(/\*\*/g, "")}
        </strong>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={`${keyPrefix}-${j}`}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline underline-offset-2 hover:text-foreground/70 transition-colors"
        >
          {linkMatch[1]}
        </a>
      );
    }
    if (/^https?:\/\/[^\s)]+$/.test(part)) {
      return (
        <a
          key={`${keyPrefix}-${j}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline underline-offset-2 hover:text-foreground/70 transition-colors"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

function renderContent(text: string) {
  return text.split("\n\n").map((para, i) => {
    if (para.startsWith("**") && para.endsWith("**") && !para.slice(2, -2).includes("**")) {
      return (
        <h3 key={i} className="text-sm font-sans font-semibold text-foreground tracking-wide mt-6 mb-2">
          {para.replace(/\*\*/g, "")}
        </h3>
      );
    }
    return (
      <p key={i} className="text-sm font-sans text-muted-foreground leading-7">
        {renderInline(para, `p${i}`)}
      </p>
    );
  });
}

const JournalArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { articles } = useJournal();

  const article = articles.find((a) => a.published && slug?.endsWith(`-${a.id}`));

  useSEO(
    article
      ? {
          title: `${article.title} — Grags Journal`,
          description: article.excerpt,
          keywords: article.keywords,
          image: article.coverImage ? resolveImageUrl(article.coverImage) : undefined,
        }
      : {}
  );

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground font-sans mb-4">Article not found.</p>
          <Link to="/journal" className="text-xs tracking-ultra-wide uppercase font-sans text-foreground underline">
            Back to Journal
          </Link>
        </div>
      </div>
    );
  }

  const position = article.imagePosition ?? "top";
  const image = article.coverImage ? (
    <img
      src={resolveImageUrl(article.coverImage)}
      alt={article.title}
      className={
        position === "left" || position === "right"
          ? "w-full md:w-1/2 aspect-[4/3] object-cover"
          : "w-full aspect-[16/7] object-cover mb-6"
      }
    />
  ) : null;

  const body = <div className="space-y-4">{renderContent(article.content || article.excerpt)}</div>;

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 pt-24 pb-24">
        <Link
          to="/journal"
          className="inline-flex items-center gap-1.5 text-[10px] tracking-ultra-wide uppercase font-sans text-muted-foreground hover:text-foreground transition-colors mb-10"
        >
          <ChevronLeft className="w-3 h-3" /> Journal
        </Link>

        <motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-6">
            <span className={`text-[9px] tracking-ultra-wide uppercase font-sans border px-2 py-0.5 ${tagClass(article.tag)}`}>
              {article.tag}
            </span>
            <span className="text-[10px] font-sans text-muted-foreground/60">{article.date}</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-serif font-bold text-foreground leading-tight mb-6">
            {article.title}
          </h1>

          {position === "top" && image}

          <div className="h-px bg-border mb-8" />

          {position === "left" || position === "right" ? (
            <div className={`flex flex-col md:flex-row gap-8 ${position === "right" ? "md:flex-row-reverse" : ""}`}>
              <div className="md:w-1/2">{image}</div>
              <div className="md:w-1/2">{body}</div>
            </div>
          ) : (
            body
          )}

          {position === "bottom" && <div className="mt-6">{image}</div>}

          {(article.keywords ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-8 pt-6 border-t border-border">
              {(article.keywords ?? []).map((kw) => (
                <span key={kw} className="text-[9px] tracking-ultra-wide uppercase font-sans border border-border px-2 py-0.5 text-muted-foreground">
                  {kw}
                </span>
              ))}
            </div>
          )}

          {article.link && (
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 text-[10px] tracking-ultra-wide uppercase font-sans text-foreground border border-foreground px-4 py-2 hover:bg-foreground hover:text-background transition-colors"
            >
              Read More ↗
            </a>
          )}
        </motion.article>
      </main>

      <Footer />
    </div>
  );
};

export default JournalArticlePage;
