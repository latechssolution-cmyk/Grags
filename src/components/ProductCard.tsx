import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, Plus } from "lucide-react";
import { toast } from "sonner";
import { Product, getProductUrl, useProducts } from "@/store/productStore";
import { useCart } from "@/store/cartStore";

export interface ProductCardProps {
  product: Product;
  index: number;
}

export const ProductCard = ({ product, index }: ProductCardProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [added, setAdded] = useState(false);
  const { items: cartItems, addItem } = useCart();
  const { getVariantStock } = useProducts();

  const hasVariants = product.colorVariants && product.colorVariants.length > 0;
  const displayImage = hasVariants
    ? (product.colorVariants[selectedVariant]?.image || product.image)
    : product.image;

  const handleQuickAdd = () => {
    const colorName = product.colorVariants?.[selectedVariant]?.name ?? "";
    const size = product.sizes[0] || "One Size";
    const availableStock = getVariantStock(product, colorName, size);
    const alreadyInCart = cartItems
      .filter((i) => i.productId === product.id && i.size === size && i.color === colorName)
      .reduce((sum, i) => sum + i.quantity, 0);
    if (availableStock <= 0 || alreadyInCart + 1 > availableStock) {
      toast.error("This item is out of stock.");
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: displayImage,
      size,
      color: colorName,
      quantity: 1,
    });
    setAdded(true);
    toast.success(`${product.name} added to cart`);
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "AddToCart", {
        content_ids: [product.id],
        content_type: "product",
        value: parseInt(product.price.replace(/[^0-9]/g, "")) || 0,
        currency: "PKR",
      });
    }
    setTimeout(() => setAdded(false), 2000);
  };

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
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.tag && (
            <span className="px-3 py-1 text-[10px] tracking-ultra-wide uppercase font-sans bg-background/90 text-foreground w-fit">
              {product.tag}
            </span>
          )}
          {product.orderType === "preorder" && (
            <span className="px-3 py-1 text-[10px] tracking-ultra-wide uppercase font-sans bg-accent text-accent-foreground w-fit">
              Pre-Order
            </span>
          )}
        </div>

        {/* Add to Cart — slides up on hover, padded right to leave room for + */}
        <div className="absolute bottom-0 left-0 right-0 p-3 pr-14 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-10">
          <button
            onClick={handleQuickAdd}
            disabled={product.stock === 0}
            className="w-full py-3 bg-primary text-primary-foreground text-xs tracking-ultra-wide uppercase font-sans font-semibold hover:bg-primary/90 transition-colors duration-300 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {added ? (<><Check className="w-3.5 h-3.5" /> Added</>) : product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>

        {/* Quick-add + button — bottom-right corner, appears on hover */}
        <button
          onClick={handleQuickAdd}
          disabled={product.stock === 0}
          title={`Quick add${hasVariants ? ` — ${product.colorVariants[selectedVariant]?.name}` : ""}`}
          className="absolute bottom-3 right-3 w-9 h-9 bg-background text-foreground border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-colors duration-200 opacity-0 group-hover:opacity-100 z-20 disabled:opacity-30"
        >
          {added ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
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
