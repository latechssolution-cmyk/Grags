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
    return () => { listeners.delete(handler); };
  }, []);

  const update = useCallback((updater: (prev: Product[]) => Product[]) => {
    const next = updater(loadProducts());
    saveProducts(next);
    setProducts(next);
    notify();
  }, []);

  const addProduct = useCallback((product: Product) => {
    update((prev) => [...prev, product]);
  }, [update]);

  const updateProduct = useCallback((id: string, data: Partial<Product>) => {
    update((prev) => prev.map((p) => (p.id === id ? { ...p, ...data } : p)));
  }, [update]);

  const deleteProduct = useCallback((id: string) => {
    update((prev) => prev.filter((p) => p.id !== id));
  }, [update]);

  const getByTag = useCallback(
    (tag: string) => products.filter((p) => p.tags.includes(tag)),
    [products]
  );

  const getByCollection = useCallback(
    (collection: string) => products.filter((p) => p.collections?.includes(collection)),
    [products]
  );

  return { products, addProduct, updateProduct, deleteProduct, getByTag, getByCollection };
}
