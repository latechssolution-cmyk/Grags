import { motion } from "framer-motion";
import { useProducts } from "@/store/productStore";
import { ProductCard } from "@/components/ProductCard";

const ProductGrid = () => {
  const { products } = useProducts();

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
            />
          ))}
        </div>
      </section>
    </>
  );
};

export default ProductGrid;
