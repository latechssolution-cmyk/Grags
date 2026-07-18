import { useState, useEffect, useCallback } from "react";

export interface CouponCode {
  id: string;
  code: string;
  discount: number;
  type: "percentage" | "fixed";
  active: boolean;
  // When true, a customer (matched by email or phone against past non-cancelled
  // orders) can only redeem this code once — for welcome/first-order codes.
  oncePerCustomer?: boolean;
}

export interface Section {
  id: string;
  name: string; // display name, e.g. "Signature Polos"
  slug: string; // anchor/URL segment within the collection page
}

export interface Collection {
  id: string;
  name: string;      // value stored on products, e.g. "MENS POLO"
  title: string;     // display heading, e.g. "Men's Polos"
  subtitle: string;  // display subheading, e.g. "Classic Collection"
  slug: string;      // URL segment, e.g. "mens-polo"
  imageUrl?: string; // optional cover image URL
  sections?: Section[]; // sub-groupings within this collection
}

export interface StoreLocation {
  id: string;
  name: string; // e.g. "Lahore Flagship"
  address: string;
  googleMapsUrl?: string;
}

export interface SiteSettings {
  whatsappNumber: string;
  contactEmail?: string;
  senderEmail?: string;
  /** @deprecated use storeLocations — kept for backward compatibility with older saved data */
  storeLocation?: string;
  /** @deprecated use storeLocations — kept for backward compatibility with older saved data */
  googleMapsUrl?: string;
  storeLocations?: StoreLocation[];
  trackOrderUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  bankAccountDetails?: string;
  announcementText?: string;
  couponCodes: CouponCode[];
  collections: Collection[];
}

const defaultSettings: SiteSettings = {
  whatsappNumber: "923049172098",
  contactEmail: "support@grags.shop",
  senderEmail: "",
  storeLocation: "",
  googleMapsUrl: "",
  storeLocations: [],
  trackOrderUrl: "https://www.tcs.com.pk/tracking",
  instagramUrl: "",
  facebookUrl: "",
  bankAccountDetails: "",
  announcementText: "",
  couponCodes: [
    { id: "1", code: "GRAGS10", discount: 10, type: "percentage", active: true },
    { id: "2", code: "WELCOME500", discount: 500, type: "fixed", active: true },
    { id: "3", code: "WELCOME10", discount: 10, type: "percentage", active: true, oncePerCustomer: true },
  ],
  collections: [
    { id: "1", name: "MENS POLO", title: "Men's Polos", subtitle: "Classic Collection", slug: "mens-polo" },
    { id: "2", name: "SIGNATURE COLLECTION", title: "Signature Collection", subtitle: "Exclusive Designs", slug: "signature-collection" },
    { id: "3", name: "WINTER COLLECTION", title: "Winter Collection", subtitle: "Cold Weather Essentials", slug: "winter-collection" },
  ],
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
        storeLocations: parsed.storeLocations ?? defaultSettings.storeLocations,
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
            storeLocations: data.storeLocations ?? defaultSettings.storeLocations,
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

  const applyCoupon = useCallback((
    code: string,
    subtotal: number,
    customer: { email?: string; phone?: string },
    pastOrders: { email: string; phone: string; couponCode: string; status: string }[]
  ): { valid: boolean; discount: number; message: string } => {
    const current = load();
    const coupon = current.couponCodes.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
    if (!coupon) return { valid: false, discount: 0, message: "Invalid or expired coupon code" };

    if (coupon.oncePerCustomer) {
      const email = customer.email?.trim().toLowerCase();
      const phone = customer.phone?.trim();
      const alreadyUsed = pastOrders.some((o) => {
        if (o.status === "Cancelled") return false;
        if (o.couponCode?.toUpperCase() !== coupon.code.toUpperCase()) return false;
        const emailMatch = !!email && o.email?.trim().toLowerCase() === email;
        const phoneMatch = !!phone && o.phone?.trim() === phone;
        return emailMatch || phoneMatch;
      });
      if (alreadyUsed) {
        return { valid: false, discount: 0, message: "This code has already been used — it's a one-time welcome discount." };
      }
    }

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

  const addStoreLocation = useCallback((loc: StoreLocation) => {
    const current = load();
    const next = { ...current, storeLocations: [...(current.storeLocations ?? []), loc] };
    saveAndSync(next);
  }, [saveAndSync]);

  const updateStoreLocation = useCallback((id: string, data: Partial<StoreLocation>) => {
    const current = load();
    const next = { ...current, storeLocations: (current.storeLocations ?? []).map(l => l.id === id ? { ...l, ...data } : l) };
    saveAndSync(next);
  }, [saveAndSync]);

  const deleteStoreLocation = useCallback((id: string) => {
    const current = load();
    const next = { ...current, storeLocations: (current.storeLocations ?? []).filter(l => l.id !== id) };
    saveAndSync(next);
  }, [saveAndSync]);

  return {
    settings, updateSettings, addCoupon, deleteCoupon, toggleCoupon, applyCoupon,
    addCollection, updateCollection, deleteCollection,
    addStoreLocation, updateStoreLocation, deleteStoreLocation,
  };
}
