import { useState, useEffect, useCallback } from "react";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: string;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

const STORAGE_KEY = "graggs_cart";

function load(): CartItem[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return [];
}

function save(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const listeners = new Set<() => void>();
function notify() { listeners.forEach((l) => l()); }

// Shared cart-drawer open state — lets any component (e.g. a product page's
// "Open Cart" button) toggle the drawer that Navbar renders.
let drawerOpen = false;
const drawerListeners = new Set<() => void>();
function notifyDrawer() { drawerListeners.forEach((l) => l()); }

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(load);
  const [isDrawerOpen, setIsDrawerOpen] = useState(drawerOpen);

  useEffect(() => {
    const handler = () => setItems(load());
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  useEffect(() => {
    const handler = () => setIsDrawerOpen(drawerOpen);
    drawerListeners.add(handler);
    return () => { drawerListeners.delete(handler); };
  }, []);

  const openDrawer = useCallback(() => { drawerOpen = true; notifyDrawer(); }, []);
  const closeDrawer = useCallback(() => { drawerOpen = false; notifyDrawer(); }, []);

  const update = useCallback((updater: (prev: CartItem[]) => CartItem[]) => {
    const next = updater(load());
    save(next);
    setItems(next);
    notify();
  }, []);

  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    update((prev) => {
      const existing = prev.find(
        (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
      );
      if (existing) {
        return prev.map((i) => i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, { ...item, id: crypto.randomUUID() }];
    });
  }, [update]);

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty <= 0) {
      update((prev) => prev.filter((i) => i.id !== id));
    } else {
      update((prev) => prev.map((i) => i.id === id ? { ...i, quantity: qty } : i));
    }
  }, [update]);

  const removeItem = useCallback((id: string) => {
    update((prev) => prev.filter((i) => i.id !== id));
  }, [update]);

  const clear = useCallback(() => update(() => []), [update]);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => {
    const num = parseInt(i.price.replace(/[^0-9]/g, "")) || 0;
    return sum + num * i.quantity;
  }, 0);

  return { items, count, subtotal, addItem, updateQty, removeItem, clear, isDrawerOpen, openDrawer, closeDrawer };
}
