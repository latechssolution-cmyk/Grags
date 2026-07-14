import { motion } from "framer-motion";
import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useProducts } from "@/store/productStore";
import { ProductCard } from "@/components/ProductCard";
import { useSEO } from "@/hooks/useSEO";

interface GenderPageProps {
  gender: "Men" | "Women" | "Kids";
  title: string;
  subtitle: string;
}

// Filters by the Gender field every product already has in the admin panel —
// no separate section management needed, it stays consistent automatically.
const GenderPage = ({ gender, title, subtitle }: GenderPageProps) => {
  const { products } = useProducts();
  const filtered = products.filter((p) => (p.gender || "Men") === gender);

  useSEO({
    title: `${title} | Grags`,
    description: `${subtitle} — shop ${title} at Grags. Premium tailored menswear crafted in Pakistan.`,
  });

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
              No products available yet.
            </motion.p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto">
              {filtered.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
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

export default GenderPage;
