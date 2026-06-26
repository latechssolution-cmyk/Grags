import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSettings } from "@/store/settingsStore";
import collectionPolos from "@/assets/collection-polos.jpg";
import collectionSignature from "@/assets/collection-signature.jpg";
import collectionWinter from "@/assets/collection-winter.jpg";

const BUNDLED_FALLBACKS: Record<string, string> = {
  "mens-polo": collectionPolos,
  "signature-collection": collectionSignature,
  "winter-collection": collectionWinter,
};

const CollectionsSection = () => {
  const { settings } = useSettings();
  const collections = settings.collections ?? [];

  if (collections.length === 0) return null;

  return (
    <section className="px-5 md:px-10 py-20 md:py-32 bg-secondary/30">
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <p className="text-xs tracking-mega-wide uppercase text-muted-foreground font-sans mb-3">
          Explore
        </p>
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground">
          Our Collections
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-7xl mx-auto">
        {collections.map((collection, i) => {
          const image = collection.imageUrl || BUNDLED_FALLBACKS[collection.slug];
          return (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
            >
              <Link
                to={`/collections/${collection.slug}`}
                className="group relative aspect-[3/4] overflow-hidden cursor-pointer block"
              >
                {image ? (
                  <img
                    src={image}
                    alt={collection.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-secondary" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-charcoal/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <h3 className="text-xl md:text-2xl font-serif font-semibold text-charcoal-foreground mb-2">
                    {collection.title}
                  </h3>
                  <span className="text-xs tracking-ultra-wide uppercase text-charcoal-foreground/70 font-sans group-hover:text-charcoal-foreground transition-colors duration-300">
                    Explore →
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default CollectionsSection;
