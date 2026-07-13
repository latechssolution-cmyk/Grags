import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useProducts } from "@/store/productStore";
import { useSettings } from "@/store/settingsStore";
import { ProductCard } from "@/components/ProductCard";

const CollectionPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { settings } = useSettings();
  const { getByCollection } = useProducts();

  const collection = (settings.collections ?? []).find((c) => c.slug === slug);

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
  const sections = collection.sections ?? [];
  const sectioned = sections.map((s) => ({
    section: s,
    products: filtered.filter((p) => (p.sectionIds ?? []).includes(s.id)),
  }));
  const sectionedIds = new Set(sectioned.flatMap((g) => g.products.map((p) => p.id)));
  const unsectioned = filtered.filter((p) => !sectionedIds.has(p.id));

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
          ) : sections.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-20">
              {sectioned.map(({ section, products }) => products.length > 0 && (
                <div key={section.id} id={section.slug}>
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-8 pb-3 border-b border-border">
                    {section.name}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {products.map((product, i) => (
                      <ProductCard key={product.id} product={product} index={i} />
                    ))}
                  </div>
                </div>
              ))}
              {unsectioned.length > 0 && (
                <div>
                  {sections.length > 0 && (
                    <h3 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-8 pb-3 border-b border-border">
                      More from {collection.title}
                    </h3>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {unsectioned.map((product, i) => (
                      <ProductCard key={product.id} product={product} index={i} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      <Footer />
      <WhatsAppButton />
      <div className="grain-overlay" />
    </div>
  );
};

export default CollectionPage;
