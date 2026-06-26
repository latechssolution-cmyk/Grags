import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useProducts, Product, getProductUrl } from "@/store/productStore";
import BookingModal from "@/components/BookingModal";

const ProductCard = ({
  product,
  index,
  onBook,
}: {
  product: Product;
  index: number;
  onBook: (p: Product, variantIdx: number) => void;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [selectedVariant, setSelectedVariant] = useState(0);

  const hasVariants = product.colorVariants && product.colorVariants.length > 0;
  const displayImage = hasVariants
    ? (product.colorVariants[selectedVariant]?.image || product.image)
    : product.image;

  return (
    <motion.div
      ref={ref}
      className="group relative editorial-zoom"
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ── Image area ─────────────────────────────── */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {/* Clickable image → product detail page */}
        <Link to={getProductUrl(product)} className="block w-full h-full">
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-500" />
        </Link>

        {/* Badge */}
        {product.tag && (
          <span className="absolute top-4 left-4 px-3 py-1 text-[10px] tracking-ultra-wide uppercase font-sans bg-background/90 text-foreground pointer-events-none z-10">
            {product.tag}
          </span>
        )}

        {/* Book Now — slides up on hover, padded right to leave room for + */}
        <div className="absolute bottom-0 left-0 right-0 p-3 pr-14 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-10">
          <button
            onClick={() => onBook(product, selectedVariant)}
            className="w-full py-3 bg-primary text-primary-foreground text-xs tracking-ultra-wide uppercase font-sans font-semibold hover:bg-primary/90 transition-colors duration-300"
          >
            Book Now
          </button>
        </div>

        {/* Quick-add + button — bottom-right corner, appears on hover */}
        <button
          onClick={() => onBook(product, selectedVariant)}
          title={`Quick add${hasVariants ? ` — ${product.colorVariants[selectedVariant]?.name}` : ""}`}
          className="absolute bottom-3 right-3 w-9 h-9 bg-background text-foreground border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-colors duration-200 opacity-0 group-hover:opacity-100 z-20"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* ── Card info ──────────────────────────────── */}
      <div className="mt-4 space-y-2">
        <h3 className="text-sm font-sans font-medium tracking-wide text-foreground">
          <Link to={getProductUrl(product)} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <p className="text-sm font-sans text-muted-foreground">{product.price}</p>

        {/* Color swatches — first is pre-selected by default */}
        {hasVariants && (
          <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
            {product.colorVariants.map((v, i) => (
              <button
                key={i}
                onClick={() => setSelectedVariant(i)}
                title={v.name}
                className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                  selectedVariant === i
                    ? "border-foreground scale-110 shadow-sm"
                    : "border-transparent hover:border-muted-foreground"
                }`}
                style={{ backgroundColor: v.hex }}
              />
            ))}
            <span className="text-[10px] text-muted-foreground font-sans ml-0.5">
              {product.colorVariants[selectedVariant]?.name}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ProductGrid = () => {
  const { products } = useProducts();
  const [bookingProduct, setBookingProduct] = useState<Product | null>(null);
  const [bookingVariantIdx, setBookingVariantIdx] = useState(0);

  const handleBook = (p: Product, variantIdx: number) => {
    setBookingProduct(p);
    setBookingVariantIdx(variantIdx);
  };

  return (
    <>
      <section id="products" className="px-5 md:px-10 py-20 md:py-32">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-xs tracking-mega-wide uppercase text-muted-foreground font-sans mb-3">
            Curated For You
          </p>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground">
            The Edit
          </h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              index={i}
              onBook={handleBook}
            />
          ))}
        </div>
      </section>

      {bookingProduct && (
        <BookingModal
          product={bookingProduct}
          selectedVariantIdx={bookingVariantIdx}
          onClose={() => setBookingProduct(null)}
        />
      )}
    </>
  );
};

export default ProductGrid;
