import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Minus, ChevronRight } from "lucide-react";
import { useProducts, Product, getProductUrl } from "@/store/productStore";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import BookingModal from "@/components/BookingModal";

// ── Sizing data ────────────────────────────────────────────
const TOP_SIZES: Record<string, { bodyLength: number; chestWidth: number; sleeveLength: number }> = {
  S:   { bodyLength: 68, chestWidth: 48, sleeveLength: 22 },
  M:   { bodyLength: 70, chestWidth: 52, sleeveLength: 23 },
  L:   { bodyLength: 72, chestWidth: 56, sleeveLength: 24 },
  XL:  { bodyLength: 74, chestWidth: 60, sleeveLength: 25 },
  XXL: { bodyLength: 76, chestWidth: 64, sleeveLength: 26 },
};
const BOTTOM_SIZES: Record<string, { waist: number; hipWidth: number; inseam: number }> = {
  "30": { waist: 76, hipWidth: 96,  inseam: 74 },
  "32": { waist: 81, hipWidth: 101, inseam: 75 },
  "34": { waist: 86, hipWidth: 106, inseam: 76 },
  "36": { waist: 91, hipWidth: 111, inseam: 77 },
};
const cm2in = (cm: number) => (cm * 0.3937).toFixed(1);

// ── Accordion ─────────────────────────────────────────────
const Accordion = ({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => (
  <div className="border-t border-border last:border-b">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-4 text-left group"
    >
      <span className="text-[11px] tracking-ultra-wide uppercase font-sans font-semibold text-foreground">
        {title}
      </span>
      <motion.span
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.25 }}
        className="flex-shrink-0"
      >
        {isOpen
          ? <Minus className="w-4 h-4 text-muted-foreground" />
          : <Plus  className="w-4 h-4 text-muted-foreground" />
        }
      </motion.span>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="body"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          style={{ overflow: "hidden" }}
        >
          <div className="pb-6">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ── Image Carousel ────────────────────────────────────────
const ImageCarousel = ({ images, name }: { images: string[]; name: string }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const slideWidth = el.clientWidth;
    const idx = Math.round(el.scrollLeft / slideWidth);
    setCurrent(idx);
  }, []);

  const goTo = (idx: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ left: idx * scrollRef.current.clientWidth, behavior: "smooth" });
    setCurrent(idx);
  };

  return (
    <div className="relative w-full bg-muted">
      {/* Slides */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-full aspect-[3/4] snap-start"
          >
            <img
              src={src}
              alt={`${name} — view ${i + 1}`}
              className="w-full h-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* Pagination dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                current === i
                  ? "w-5 h-1.5 bg-foreground"
                  : "w-1.5 h-1.5 bg-foreground/30"
              }`}
            />
          ))}
        </div>
      )}

      {/* Slide counter */}
      {images.length > 1 && (
        <div className="absolute top-4 right-4 px-2 py-0.5 bg-background/70 backdrop-blur-sm text-[10px] font-sans text-foreground">
          {current + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

// ── Size Guide ────────────────────────────────────────────
const SizeGuide = ({ sizes, isBottom }: { sizes: string[]; isBottom: boolean }) => {
  const [activeSize, setActiveSize] = useState<string>(sizes[0] ?? "");

  const topData = TOP_SIZES[activeSize];
  const botData = BOTTOM_SIZES[activeSize];

  return (
    <div className="space-y-4">
      {/* Size selector */}
      <div className="flex flex-wrap gap-2">
        {sizes.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSize(s)}
            className={`w-10 h-10 rounded-full text-xs font-sans font-medium border-2 transition-all duration-200 ${
              activeSize === s
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Measurement table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs font-sans border-collapse">
          <thead>
            <tr className="bg-secondary">
              <th className="text-left px-4 py-3 text-[10px] tracking-ultra-wide uppercase text-muted-foreground font-medium border border-border">
                Measurements
              </th>
              <th className="text-center px-4 py-3 text-[10px] tracking-ultra-wide uppercase text-muted-foreground font-medium border border-border">
                CM
              </th>
              <th className="text-center px-4 py-3 text-[10px] tracking-ultra-wide uppercase text-muted-foreground font-medium border border-border">
                INCH
              </th>
            </tr>
          </thead>
          <tbody>
            {!isBottom && topData && (
              <>
                <tr>
                  <td className="px-4 py-3 text-foreground border border-border">Body Length</td>
                  <td className="px-4 py-3 text-center text-foreground font-medium border border-border">{topData.bodyLength}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground border border-border">{cm2in(topData.bodyLength)}"</td>
                </tr>
                <tr className="bg-secondary/30">
                  <td className="px-4 py-3 text-foreground border border-border">Chest Width</td>
                  <td className="px-4 py-3 text-center text-foreground font-medium border border-border">{topData.chestWidth}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground border border-border">{cm2in(topData.chestWidth)}"</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-foreground border border-border">Sleeve Length From Neck Seam</td>
                  <td className="px-4 py-3 text-center text-foreground font-medium border border-border">{topData.sleeveLength}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground border border-border">{cm2in(topData.sleeveLength)}"</td>
                </tr>
              </>
            )}
            {isBottom && botData && (
              <>
                <tr>
                  <td className="px-4 py-3 text-foreground border border-border">Waist</td>
                  <td className="px-4 py-3 text-center text-foreground font-medium border border-border">{botData.waist}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground border border-border">{cm2in(botData.waist)}"</td>
                </tr>
                <tr className="bg-secondary/30">
                  <td className="px-4 py-3 text-foreground border border-border">Hip Width</td>
                  <td className="px-4 py-3 text-center text-foreground font-medium border border-border">{botData.hipWidth}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground border border-border">{cm2in(botData.hipWidth)}"</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-foreground border border-border">Inseam</td>
                  <td className="px-4 py-3 text-center text-foreground font-medium border border-border">{botData.inseam}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground border border-border">{cm2in(botData.inseam)}"</td>
                </tr>
              </>
            )}
            {!isBottom && !topData && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-muted-foreground border border-border">
                  No size data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-muted-foreground font-sans leading-relaxed">
        Measurements are in centimetres and refer to body measurements. For best fit, measure yourself and compare with the chart above. Sizes may vary ±1–2 cm.
      </p>
    </div>
  );
};

// ── Recommended Card ───────────────────────────────────────
const RecommendedCard = ({
  product,
  onBook,
}: {
  product: Product;
  onBook: (p: Product) => void;
}) => {
  const hasVariants = product.colorVariants && product.colorVariants.length > 0;
  const displayImage = hasVariants ? (product.colorVariants[0]?.image || product.image) : product.image;

  return (
    <Link to={getProductUrl(product)} className="flex-shrink-0 w-36 md:w-44 group">
      <div className="aspect-[3/4] overflow-hidden bg-muted relative">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.tag && (
          <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] tracking-ultra-wide uppercase font-sans bg-background/90 text-foreground">
            {product.tag}
          </span>
        )}
      </div>
      <div className="mt-2 space-y-0.5">
        <p className="text-xs font-sans font-medium text-foreground leading-tight line-clamp-2">{product.name}</p>
        <p className="text-xs font-sans text-muted-foreground">{product.price}</p>
      </div>
    </Link>
  );
};

// ── Main Page ─────────────────────────────────────────────
const ProductDetail = () => {
  const { code: routeParam } = useParams<{ code: string }>();
  const { products } = useProducts();

  const product = products.find((p) => {
    if (!routeParam) return false;
    // 1. Exact match by SKU or ID
    if (p.sku === routeParam || p.id === routeParam) return true;
    // 2. Suffix match by SKU (e.g. -f123-337d)
    if (p.sku && routeParam.endsWith(`-${p.sku}`)) return true;
    // 3. Suffix match by ID (e.g. -1 or -uuid)
    if (p.id && routeParam.endsWith(`-${p.id}`)) return true;
    return false;
  });

  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [booking, setBooking] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Scroll to top on product change
  useEffect(() => { window.scrollTo(0, 0); }, [routeParam]);

  const toggleSection = (key: string) =>
    setOpenSection((prev) => (prev === key ? null : key));

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground font-sans mb-4">Product not found.</p>
          <Link to="/" className="text-xs tracking-ultra-wide uppercase font-sans text-foreground underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Build carousel images: main + all variant images that have a src
  const carouselImages: string[] = [
    product.image,
    ...(product.colorVariants ?? []).map((v) => v.image).filter(Boolean),
  ].filter((src, i, arr) => src && arr.indexOf(src) === i); // deduplicate

  const hasVariants = product.colorVariants && product.colorVariants.length > 0;
  const activeVariant = hasVariants ? product.colorVariants[selectedVariant] : null;

  const isBottom = product.tags?.includes("BOTTOMS");

  // Parse price for installment badge
  const priceNum = parseInt(product.price.replace(/[^0-9]/g, ""), 10);
  const installmentAmt = isNaN(priceNum) ? null : Math.ceil(priceNum / 4);

  // Recommended: same tags or collections, exclude current product
  const recommended = products.filter(
    (p) =>
      p.id !== product.id &&
      (
        p.tags.some((t) => product.tags.includes(t)) ||
        p.collections?.some((c) => product.collections?.includes(c))
      )
  );

  // Meta line components
  const metaParts = [
    product.fit,
    product.gender,
    activeVariant?.name,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <AnnouncementBar />
      <Navbar transparent={true} />

      {/* ── Two-column layout on desktop ── */}
      <main className="max-w-6xl mx-auto md:px-10 md:py-16">
        <div className="md:grid md:grid-cols-2 md:gap-14 md:items-start">

          {/* ── LEFT: Image Carousel ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <ImageCarousel images={carouselImages} name={product.name} />
          </motion.div>

          {/* ── RIGHT: Product Info ── */}
          <motion.div
            className="px-5 md:px-0 pt-6 md:pt-0 space-y-5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            {/* Back link */}
            <Link
              to="/"
              className="hidden md:inline-flex items-center gap-1.5 text-[10px] tracking-ultra-wide uppercase font-sans text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3 h-3" /> The Edit
            </Link>

            {/* Badge */}
            {product.tag && (
              <span className="inline-block px-3 py-1 text-[10px] tracking-ultra-wide uppercase font-sans bg-secondary text-secondary-foreground">
                {product.tag}
              </span>
            )}

            {/* Title */}
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground uppercase leading-tight tracking-wide">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3 mt-2 flex-wrap">
                <p className="text-xl font-sans font-semibold text-foreground">{product.price}</p>
                {installmentAmt && (
                  <span className="text-[10px] font-sans text-muted-foreground tracking-wide bg-secondary px-2 py-0.5">
                    4 Easy Installments of PKR {installmentAmt.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Meta line: Fit | Gender | Color */}
            {metaParts.length > 0 && (
              <p className="text-[11px] font-sans text-muted-foreground tracking-widest uppercase">
                {metaParts.join(" · ")}
              </p>
            )}

            {/* Color variants */}
            {hasVariants && (
              <div>
                <p className="text-[10px] tracking-ultra-wide uppercase text-muted-foreground font-sans mb-2.5">
                  Colour:{" "}
                  <span className="text-foreground font-semibold">
                    {product.colorVariants[selectedVariant]?.name}
                  </span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.colorVariants.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedVariant(i)}
                      title={v.name}
                      className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                        selectedVariant === i
                          ? "border-foreground scale-110 shadow-md"
                          : "border-transparent hover:border-muted-foreground"
                      }`}
                      style={{ backgroundColor: v.hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            {product.sizes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[10px] tracking-ultra-wide uppercase text-muted-foreground font-sans">
                    Size{selectedSize ? `: ${selectedSize}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[44px] h-11 px-3 text-xs tracking-ultra-wide uppercase font-sans border-2 transition-colors duration-200 ${
                        selectedSize === s
                          ? "bg-foreground text-background border-foreground"
                          : "bg-transparent text-muted-foreground border-border hover:border-foreground hover:text-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock */}
            <p className="text-[10px] font-sans text-muted-foreground tracking-wide">
              {product.stock > 0
                ? `${product.stock} in stock — order soon`
                : "Out of stock"}
            </p>

            {/* Description */}
            {product.description && (
              <div className="text-sm font-sans text-muted-foreground leading-relaxed border-t border-border pt-4">
                <p>{product.description}</p>
                {product.sku && (
                  <div className="my-5">
                    <span className="font-mono text-xs font-semibold text-foreground bg-secondary border border-border px-3.5 py-2 inline-block tracking-wider uppercase">
                      Code: {product.sku}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Desktop Book Now */}
            <button
              onClick={() => setBooking(true)}
              disabled={product.stock === 0}
              className="hidden md:block w-full py-4 bg-foreground text-background text-xs tracking-ultra-wide uppercase font-sans font-semibold hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {product.stock > 0 ? `Book Now — ${product.price}` : "Out of Stock"}
            </button>

            {/* ── Accordions ── */}
            <div className="pt-2">
              {/* Size Guide */}
              {product.sizes.length > 0 && (
                <Accordion
                  title="Size Guide"
                  isOpen={openSection === "size"}
                  onToggle={() => toggleSection("size")}
                >
                  <SizeGuide sizes={product.sizes} isBottom={isBottom} />
                </Accordion>
              )}

              {/* Product Details & Composition */}
              <Accordion
                title="Product Details & Composition"
                isOpen={openSection === "details"}
                onToggle={() => toggleSection("details")}
              >
                <div className="space-y-4 text-sm font-sans text-muted-foreground">
                  {product.sku && (
                    <div>
                      <span className="text-[10px] tracking-ultra-wide uppercase text-foreground font-semibold block mb-1">
                        Design Code
                      </span>
                      <span className="font-mono text-xs">{product.sku}</span>
                    </div>
                  )}
                  {product.fit && (
                    <div>
                      <span className="text-[10px] tracking-ultra-wide uppercase text-foreground font-semibold block mb-1">
                        Fit
                      </span>
                      <span>{product.fit}</span>
                    </div>
                  )}
                  {product.fabric && (
                    <div>
                      <span className="text-[10px] tracking-ultra-wide uppercase text-foreground font-semibold block mb-1">
                        Composition
                      </span>
                      <span>{product.fabric}</span>
                    </div>
                  )}
                  {(product.careInstructions ?? []).length > 0 && (
                    <div>
                      <span className="text-[10px] tracking-ultra-wide uppercase text-foreground font-semibold block mb-2">
                        Care Instructions
                      </span>
                      <ul className="space-y-1.5">
                        {(product.careInstructions ?? []).map((instruction, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground flex-shrink-0" />
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {/* Tags & Collections */}
                  {(product.tags.length > 0 || (product.collections ?? []).length > 0) && (
                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border">
                      {product.tags.map((t) => (
                        <span key={t} className="text-[9px] px-2 py-0.5 bg-secondary text-secondary-foreground tracking-ultra-wide uppercase font-sans">
                          {t}
                        </span>
                      ))}
                      {(product.collections ?? []).map((c) => (
                        <span key={c} className="text-[9px] px-2 py-0.5 bg-accent text-accent-foreground tracking-ultra-wide uppercase font-sans">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Accordion>

              {/* Deliveries & Returns */}
              <Accordion
                title="Deliveries & Returns"
                isOpen={openSection === "delivery"}
                onToggle={() => toggleSection("delivery")}
              >
                <div className="space-y-4 text-sm font-sans text-muted-foreground leading-relaxed">
                  <div>
                    <p className="text-[10px] tracking-ultra-wide uppercase text-foreground font-semibold mb-2">Delivery</p>
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground flex-shrink-0" />
                        <span><strong className="text-foreground">Standard Delivery</strong> — 3 to 5 working days across Pakistan</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground flex-shrink-0" />
                        <span><strong className="text-foreground">Express Delivery</strong> — 1 to 2 working days (available at checkout)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground flex-shrink-0" />
                        <span><strong className="text-foreground">Same Day — Lahore</strong> — Order before 12 noon for same-day delivery within Lahore</span>
                      </li>
                    </ul>
                  </div>
                  <div className="border-t border-border pt-4">
                    <p className="text-[10px] tracking-ultra-wide uppercase text-foreground font-semibold mb-2">Returns</p>
                    <ul className="space-y-1.5">
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground flex-shrink-0" />
                        <span>Returns accepted within <strong className="text-foreground">7 days</strong> of delivery</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground flex-shrink-0" />
                        <span>Items must be unworn, unwashed, and in original packaging with tags attached</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground flex-shrink-0" />
                        <span>Sale items are final sale and not eligible for return</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-muted-foreground flex-shrink-0" />
                        <span>To initiate a return, contact us via WhatsApp or email</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Accordion>
            </div>
          </motion.div>
        </div>

        {/* ── Recommended For You ── */}
        {recommended.length > 0 && (
          <section className="px-5 md:px-0 mt-20 md:mt-28">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] tracking-mega-wide uppercase text-muted-foreground font-sans mb-1">
                  You May Also Like
                </p>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground">
                  Recommended For You
                </h2>
              </div>
              <Link
                to="/"
                className="hidden md:flex items-center gap-1 text-[10px] tracking-ultra-wide uppercase font-sans text-muted-foreground hover:text-foreground transition-colors"
              >
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div
              className="flex gap-4 overflow-x-auto pb-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {recommended.map((p) => (
                <RecommendedCard key={p.id} product={p} onBook={() => {}} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
      <div className="grain-overlay" />

      {/* ── Mobile sticky CTA ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="text-[10px] tracking-ultra-wide uppercase text-muted-foreground font-sans">
              {selectedSize ? `Size: ${selectedSize}` : "Select a size"}
            </p>
            <p className="text-sm font-sans font-semibold text-foreground">{product.price}</p>
          </div>
          <button
            onClick={() => setBooking(true)}
            disabled={product.stock === 0}
            className="flex-1 py-3.5 bg-foreground text-background text-xs tracking-ultra-wide uppercase font-sans font-semibold hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {product.stock > 0 ? "Book Now" : "Out of Stock"}
          </button>
        </div>
      </div>

      {/* ── Booking Modal ── */}
      {booking && (
        <BookingModal
          product={product}
          selectedVariantIdx={selectedVariant}
          onClose={() => setBooking(false)}
        />
      )}
    </div>
  );
};

export default ProductDetail;
