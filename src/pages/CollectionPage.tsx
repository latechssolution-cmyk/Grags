import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import BookingModal from "@/components/BookingModal";
import { useProducts, Product } from "@/store/productStore";
import { useSettings } from "@/store/settingsStore";
import { ProductCard } from "@/components/ProductCard";

const CollectionPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { settings } = useSettings();
  const { getByCollection } = useProducts();
  const [bookingProduct, setBookingProduct] = useState<Product | null>(null);
  const [bookingVariantIdx, setBookingVariantIdx] = useState(0);

  const collection = (settings.collections ?? []).find((c) => c.slug === slug);

  const handleBook = (p: Product, variantIdx: number) => {
    setBookingProduct(p);
    setBookingVariantIdx(variantIdx);
  };

  if (!collection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground font-sans mb-4">Collection not found.</p>
          <Link to="/" className="text-xs tracking-ultra-wide uppercase font-sans text-foreground underline">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const filtered = getByCollection(collection.name);

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
            <p className="text-xs tracking-mega-wide uppercase text-muted-foreground font-sans mb-3">{collection.subtitle}</p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground">{collection.title}</h2>
          </motion.div>
          {filtered.length === 0 ? (
            <motion.p className="text-center text-muted-foreground font-sans text-sm tracking-wide" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              No products available in this collection yet.
            </motion.p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} onBook={handleBook} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
      <div className="grain-overlay" />
      {bookingProduct && (
        <BookingModal
          product={bookingProduct}
          selectedVariantIdx={bookingVariantIdx}
          onClose={() => setBookingProduct(null)}
        />
      )}
    </div>
  );
};

export default CollectionPage;
