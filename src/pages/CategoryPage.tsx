import { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import BookingModal from "@/components/BookingModal";
import { useProducts, Product } from "@/store/productStore";

const ProductCard = ({ product, index, onBook }: { product: Product; index: number; onBook: (p: Product) => void }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      className="group relative editorial-zoom cursor-pointer"
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-500" />
        {product.tag && (
          <span className="absolute top-4 left-4 px-3 py-1 text-[10px] tracking-ultra-wide uppercase font-sans bg-background/90 text-foreground">{product.tag}</span>
        )}
        <motion.div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <button onClick={() => onBook(product)} className="w-full py-3 bg-primary text-primary-foreground text-xs tracking-ultra-wide uppercase font-sans font-semibold hover:bg-primary/90 transition-colors duration-300">
            Book Now
          </button>
        </motion.div>
      </div>
      <div className="mt-4 space-y-1">
        <h3 className="text-sm font-sans font-medium tracking-wide text-foreground">{product.name}</h3>
        <p className="text-sm font-sans text-muted-foreground">{product.price}</p>
      </div>
    </motion.div>
  );
};

interface CategoryPageProps {
  tag: string;
  title: string;
  subtitle: string;
}

const CategoryPage = ({ tag, title, subtitle }: CategoryPageProps) => {
  const { getByTag } = useProducts();
  const filtered = getByTag(tag);
  const [bookingProduct, setBookingProduct] = useState<Product | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <Navbar />
      <main>
        <section className="px-5 md:px-10 py-20 md:py-32">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs tracking-mega-wide uppercase text-muted-foreground font-sans mb-3">{subtitle}</p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground">{title}</h2>
          </motion.div>
          {filtered.length === 0 ? (
            <motion.p className="text-center text-muted-foreground font-sans text-sm tracking-wide" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              No products available in this category yet.
            </motion.p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} onBook={setBookingProduct} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
      <div className="grain-overlay" />
      {bookingProduct && <BookingModal product={bookingProduct} onClose={() => setBookingProduct(null)} />}
    </div>
  );
};

export default CategoryPage;
