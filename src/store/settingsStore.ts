import { useState, useEffect, useCallback } from "react";

export interface CouponCode {
  id: string;
  code: string;
  discount: number;
  type: "percentage" | "fixed";
  active: boolean;
}

export interface Collection {
  id: string;
  name: string;      // value stored on products, e.g. "MENS POLO"
  title: string;     // display heading, e.g. "Men's Polos"
  subtitle: string;  // display subheading, e.g. "Classic Collection"
  slug: string;      // URL segment, e.g. "mens-polo"
  imageUrl?: string; // optional cover image URL
}

export interface SizeChartRow {
  size: string;
  values: string[];
}

export interface SizeChart {
  headers: string[];
  rows: SizeChartRow[];
}

export interface SiteSettings {
  whatsappNumber: string;
  contactEmail?: string;
  senderEmail?: string;
  storeLocation?: string;
  googleMapsUrl?: string;
  couponCodes: CouponCode[];
  collections: Collection[];
  sizeChart?: SizeChart;
}

const defaultSettings: SiteSettings = {
  whatsappNumber: "923049172098",
  contactEmail: "support@grags.com",
  senderEmail: "",
  storeLocation: "",
  googleMapsUrl: "",
  couponCodes: [
    { id: "1", code: "GRAGS10", discount: 10, type: "percentage", active: true },
    { id: "2", code: "WELCOME500", discount: 500, type: "fixed", active: true },
  ],
  collections: [
    { id: "1", name: "MENS POLO", title: "Men's Polos", subtitle: "Classic Collection", slug: "mens-polo" },
    { id: "2", name: "SIGNATURE COLLECTION", title: "Signature Collection", subtitle: "Exclusive Designs", slug: "signature-collection" },
    { id: "3", name: "WINTER COLLECTION", title: "Winter Collection", subtitle: "Cold Weather Essentials", slug: "winter-collection" },
  ],
  sizeChart: {
    headers: ["Size", "Chest (inches)", "Length (inches)", "Shoulder (inches)"],
    rows: [
      { size: "S",  values: ["36–38", "28", "17"] },
      { size: "M",  values: ["38–40", "29", "17.5"] },
      { size: "L",  values: ["40–42", "30", "18"] },
      { size: "XL", values: ["42–44", "31", "18.5"] },
    ],
  },
};

const STORAGE_KEY = "graggs_settings";

function load(): SiteSettings {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) {
      const parsed = JSON.parse(s);
      return {
        ...defaultSettings,
        ...parsed,
        collections: parsed.collections ?? defaultSettings.collections,
        sizeChart: parsed.sizeChart ?? defaultSettings.sizeChart,
      };
    }
  } catch {}
  return defaultSettings;
}

const listeners = new Set<() => void>();
function notify() { listeners.forEach((l) => l()); }

function saveSettings(settings: SiteSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function useSettings() {
  const [settings, setSettings] = useState<SiteSettings>(load);

  useEffect(() => {
    const handler = () => setSettings(load());
    listeners.add(handler);

    // Fetch from MongoDB — merge with defaults so new fields aren't lost
    // when an existing MongoDB document predates their addition.
    fetch("/.netlify/functions/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object" && !data.error) {
          const merged: SiteSettings = {
            ...defaultSettings,
            ...data,
            collections: data.collections ?? defaultSettings.collections,
            sizeChart: data.sizeChart ?? defaultSettings.sizeChart,
          };
          saveSettings(merged);
          setSettings(merged);
        }
      })
      .catch((err) => console.error("Error fetching settings from MongoDB:", err));

    return () => { listeners.delete(handler); };
  }, []);

  const saveAndSync = useCallback((next: SiteSettings) => {
    saveSettings(next);
    setSettings(next);
    notify();

    fetch("/.netlify/functions/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    })
      .then((res) => res.json())
      .catch((err) => console.error("Error saving settings to MongoDB:", err));
  }, []);

  const updateSettings = useCallback((data: Partial<SiteSettings>) => {
    const next = { ...load(), ...data };
    saveAndSync(next);
  }, [saveAndSync]);

  const addCoupon = useCallback((coupon: CouponCode) => {
    const current = load();
    const next = { ...current, couponCodes: [...current.couponCodes, coupon] };
    saveAndSync(next);
  }, [saveAndSync]);

  const deleteCoupon = useCallback((id: string) => {
    const current = load();
    const next = { ...current, couponCodes: current.couponCodes.filter(c => c.id !== id) };
    saveAndSync(next);
  }, [saveAndSync]);

  const toggleCoupon = useCallback((id: string) => {
    const current = load();
    const next = {
      ...current,
      couponCodes: current.couponCodes.map(c => c.id === id ? { ...c, active: !c.active } : c),
    };
    saveAndSync(next);
  }, [saveAndSync]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const applyCoupon = useCallback((code: string, subtotal: number, _lines?: unknown): { valid: boolean; discount: number; message: string } => {
    const current = load();
    const coupon = current.couponCodes.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
    if (!coupon) return { valid: false, discount: 0, message: "Invalid or expired coupon code" };
    const discount = coupon.type === "percentage" ? Math.round(subtotal * coupon.discount / 100) : Math.min(coupon.discount, subtotal);
    return { valid: true, discount, message: `${coupon.type === "percentage" ? `${coupon.discount}%` : `PKR ${coupon.discount}`} discount applied!` };
  }, []);

  const addCollection = useCallback((col: Collection) => {
    const current = load();
    const next = { ...current, collections: [...(current.collections ?? []), col] };
    saveAndSync(next);
  }, [saveAndSync]);

  const updateCollection = useCallback((id: string, data: Partial<Collection>) => {
    const current = load();
    const next = { ...current, collections: (current.collections ?? []).map(c => c.id === id ? { ...c, ...data } : c) };
    saveAndSync(next);
  }, [saveAndSync]);

  const deleteCollection = useCallback((id: string) => {
    const current = load();
    const next = { ...current, collections: (current.collections ?? []).filter(c => c.id !== id) };
    saveAndSync(next);
  }, [saveAndSync]);

  return { settings, updateSettings, addCoupon, deleteCoupon, toggleCoupon, applyCoupon, addCollection, updateCollection, deleteCollection };
}
