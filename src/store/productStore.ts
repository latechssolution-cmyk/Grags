import { useState, useEffect, useCallback } from "react";

import productPolo from "@/assets/product-polo.jpg";
import productDualtone from "@/assets/product-dualtone.jpg";
import productHalfsleeve from "@/assets/product-halfsleeve.jpg";
import productGurkha from "@/assets/product-gurkha.jpg";

export interface ColorVariant {
  name: string;  // e.g. "Navy Blue"
  hex: string;   // e.g. "#1a2744"
  image: string; // data URL or asset URL for this color
}

export interface ProductReview {
  id: string;
  name: string;
  rating: number; // 1–5
  text: string;
  date: string;   // ISO date string
}

export interface SizeChartRow {
  size: string;
  values: string[];
}

export interface SizeChart {
  headers: string[];
  rows: SizeChartRow[];
}

// Key format: `${color}|${size}` — lets stock be tracked per individual
// color + size combination. Falls back to Product.stock when unset.
export type VariantStock = Record<string, number>;

export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  tag: string | null;
  tags: string[];
  collections: string[];
  description: string;
  sizes: string[];
  stock: number;
  colorVariants: ColorVariant[];
  sku?: string;
  fit?: string;
  gender?: string;
  fabric?: string;
  careInstructions?: string[];
  showInstallments?: boolean;
  installments?: number;
  discountPercent?: number;
  reviews?: ProductReview[];
  keywords?: string[];
  orderType?: "order" | "preorder";
  variantStock?: VariantStock;
  sizeChart?: SizeChart;
  sizeChartImage?: string;
  sectionIds?: string[];
}

export function variantStockKey(color: string, size: string): string {
  return `${color}|${size}`;
}

export type StockStatus = "in" | "limited" | "out";

export function stockStatus(qty: number): StockStatus {
  if (qty <= 0) return "out";
  if (qty <= 5) return "limited";
  return "in";
}

export function stockLabel(qty: number): string {
  if (qty <= 0) return "Out of Stock";
  if (qty <= 5) return `Only ${qty} left`;
  return "In Stock";
}

export function generateProductCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${part1}-${part2}`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function getProductUrl(product: Product): string {
  const slug = slugify(product.name);
  const code = product.sku || product.id;
  return `/product/${slug}-${code}`;
}

const defaultProducts: Product[] = [
  {
    id: "1",
    name: "Textured Polo",
    price: "PKR 3,490",
    image: productPolo,
    tag: "Best Seller",
    tags: ["NEW IN", "TOPS"],
    collections: ["MENS POLO"],
    description: "Premium textured polo crafted from finest cotton.",
    sizes: ["S", "M", "L", "XL"],
    stock: 25,
    colorVariants: [],
    sku: "f123-337d",
    fit: "Regular Fit",
    gender: "Men",
    fabric: "100% Pique Cotton",
    careInstructions: ["Machine wash cold", "Do not bleach", "Tumble dry low", "Iron on low heat", "Do not dry clean"],
  },
  {
    id: "2",
    name: "Signature Dual-Tone Polo",
    price: "PKR 3,990",
    image: productDualtone,
    tag: "New",
    tags: ["NEW IN", "TOPS"],
    collections: ["MENS POLO", "SIGNATURE COLLECTION"],
    description: "Signature dual-tone polo with contrast detailing.",
    sizes: ["S", "M", "L", "XL"],
    stock: 18,
    colorVariants: [],
    sku: "e456-992a",
    fit: "Relaxed Fit",
    gender: "Men",
    fabric: "100% Cotton Interlock",
    careInstructions: ["Hand wash or machine wash cold", "Wash separately first few washes", "Do not bleach", "Dry flat in shade", "Warm iron if needed"],
  },
  {
    id: "3",
    name: "Linen Half Sleeve",
    price: "PKR 3,290",
    image: productHalfsleeve,
    tag: null,
    tags: ["TOPS", "ESSENTIALS"],
    collections: ["SIGNATURE COLLECTION"],
    description: "Relaxed linen half sleeve for summer elegance.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 30,
    colorVariants: [],
    sku: "a789-55bc",
    fit: "Relaxed Fit",
    gender: "Men",
    fabric: "55% Linen, 45% Cotton",
    careInstructions: ["Hand wash recommended", "Use mild detergent", "Do not wring", "Dry flat in shade", "Iron while slightly damp for best results"],
  },
  {
    id: "4",
    name: "Gurkha Pants",
    price: "PKR 4,490",
    image: productGurkha,
    tag: "Limited",
    tags: ["BOTTOMS", "HERITAGE"],
    collections: ["WINTER COLLECTION"],
    description: "Classic Gurkha pants with heritage-inspired detailing.",
    sizes: ["30", "32", "34", "36"],
    stock: 12,
    colorVariants: [],
    sku: "d012-88ef",
    fit: "Tapered Fit",
    gender: "Men",
    fabric: "98% Cotton, 2% Elastane",
    careInstructions: ["Machine wash cold with similar colours", "Do not bleach", "Tumble dry low", "Iron on medium heat", "Dry clean if needed"],
  },
];

const STORAGE_KEY = "graggs_products";

function loadProducts(): Product[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      let needsSave = false;

      // Migrate older saved data: ensure all fields exist and SKUs are valid
      const migrated = parsed.map((p: any) => {
        const m = {
          collections: [],
          colorVariants: [],
          sku: "",
          fit: "",
          gender: "Men",
          fabric: "",
          careInstructions: [],
          reviews: [],
          ...p
        };
        // Enforce the new xxxx-xxxx unique product code format
        // If SKU is missing or does not match the format, assign a new stable code
        if (!m.sku || !/^[a-z0-9]{4}-[a-z0-9]{4}$/i.test(m.sku)) {
          m.sku = generateProductCode();
          needsSave = true;
        }
        return m;
      });

      // Persist migrated data so codes remain stable across page loads
      if (needsSave) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      }

      return migrated;
    }
  } catch {
    // Corrupt data — clear and fall back to defaults
    localStorage.removeItem(STORAGE_KEY);
  }
  return defaultProducts;
}

function saveProducts(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

const listeners = new Set<() => void>();
function notify() { listeners.forEach((l) => l()); }

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(loadProducts);

  useEffect(() => {
    const handler = () => setProducts(loadProducts());
    listeners.add(handler);

    // Fetch from MongoDB
    fetch("/.netlify/functions/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Base64 image data URLs are too large to survive MongoDB reliably.
          // Preserve images from localStorage when MongoDB returns empty fields.
          const local = loadProducts();
          const localById = Object.fromEntries(local.map((p) => [p.id, p]));
          const merged = data.map((p) => {
            const lp = localById[p.id];
            return {
              reviews: [],
              discountPercent: 0,
              ...p,
              image: p.image || lp?.image || "",
              colorVariants: (p.colorVariants ?? []).map((v: ColorVariant, i: number) => ({
                ...v,
                image: v.image || lp?.colorVariants?.[i]?.image || "",
              })),
            };
          });
          saveProducts(merged);
          setProducts(merged);
        }
      })
      .catch((err) => console.error("Error fetching products from MongoDB:", err));

    return () => { listeners.delete(handler); };
  }, []);

  const addProduct = useCallback((product: Product) => {
    const current = loadProducts();
    const next = [...current, product];
    saveProducts(next);
    setProducts(next);
    notify();

    fetch("/.netlify/functions/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    })
      .then((res) => res.json())
      .catch((err) => console.error("Error adding product to MongoDB:", err));
  }, []);

  const updateProduct = useCallback((id: string, data: Partial<Product>) => {
    const current = loadProducts();
    const next = current.map((p) => (p.id === id ? { ...p, ...data } : p));
    saveProducts(next);
    setProducts(next);
    notify();

    fetch(`/.netlify/functions/products?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .catch((err) => console.error("Error updating product in MongoDB:", err));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    const current = loadProducts();
    const next = current.filter((p) => p.id !== id);
    saveProducts(next);
    setProducts(next);
    notify();

    fetch(`/.netlify/functions/products?id=${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .catch((err) => console.error("Error deleting product from MongoDB:", err));
  }, []);

  const getByTag = useCallback(
    (tag: string) => products.filter((p) => p.tags.includes(tag)),
    [products]
  );

  const getByCollection = useCallback(
    (collection: string) => products.filter((p) => p.collections?.includes(collection)),
    [products]
  );

  const getById = useCallback((id: string) => products.find((p) => p.id === id || p.sku === id), [products]);

  // Works with just a color, just a size, or both — a product only needs to vary
  // by one dimension to get per-variant stock (e.g. sizes with no color options).
  const getVariantStock = useCallback((product: Product, color?: string, size?: string): number => {
    if (product.variantStock && (color || size)) {
      const key = variantStockKey(color ?? "", size ?? "");
      if (key in product.variantStock) return product.variantStock[key];
    }
    return product.stock;
  }, []);

  // sign = -1 reserves stock (order placed), sign = +1 releases it (order cancelled)
  const adjustStock = useCallback((items: { id: string; size: string; color?: string; quantity: number }[], sign: 1 | -1) => {
    const current = loadProducts();
    const changed: Product[] = [];
    const next = current.map((p) => {
      const matches = items.filter((i) => i.id === p.id);
      if (matches.length === 0) return p;

      let stock = p.stock;
      const variantStock = { ...(p.variantStock ?? {}) };
      matches.forEach((m) => {
        const change = sign * m.quantity;
        stock = Math.max(0, stock + change);
        if (m.color) {
          const key = variantStockKey(m.color, m.size);
          const base = key in variantStock ? variantStock[key] : p.stock;
          variantStock[key] = Math.max(0, base + change);
        }
      });
      const updated = { ...p, stock, variantStock };
      changed.push(updated);
      return updated;
    });

    if (changed.length === 0) return;
    saveProducts(next);
    setProducts(next);
    notify();

    changed.forEach((p) => {
      fetch(`/.netlify/functions/products?id=${p.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: p.stock, variantStock: p.variantStock }),
      }).catch((err) => console.error("Error syncing stock to MongoDB:", err));
    });
  }, []);

  const decrementStock = useCallback(
    (items: { id: string; size: string; color?: string; quantity: number }[]) => adjustStock(items, -1),
    [adjustStock]
  );

  const restoreStock = useCallback(
    (items: { id: string; size: string; color?: string; quantity: number }[]) => adjustStock(items, 1),
    [adjustStock]
  );

  const addReview = useCallback((productId: string, review: ProductReview) => {
    const current = loadProducts();
    const next = current.map((p) =>
      p.id === productId
        ? { ...p, reviews: [...(p.reviews ?? []), review] }
        : p
    );
    saveProducts(next);
    setProducts(next);
    notify();

    const updatedReviews = next.find((p) => p.id === productId)?.reviews ?? [];
    fetch(`/.netlify/functions/products?id=${productId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviews: updatedReviews }),
    }).catch((err) => console.error("Error syncing review to MongoDB:", err));
  }, []);

  return { products, addProduct, updateProduct, deleteProduct, getByTag, getByCollection, getById, getVariantStock, addReview, decrementStock, restoreStock };
}
