import { useState, useEffect, useCallback } from "react";

export interface CouponCode {
  id: string;
  code: string;
  discount: number;
  type: "percentage" | "fixed";
  active: boolean;
}

export interface SiteSettings {
  whatsappNumber: string;
  couponCodes: CouponCode[];
}

const defaultSettings: SiteSettings = {
  whatsappNumber: "923049172098",
  couponCodes: [
    { id: "1", code: "GRAGGS10", discount: 10, type: "percentage", active: true },
    { id: "2", code: "WELCOME500", discount: 500, type: "fixed", active: true },
  ],
};

const STORAGE_KEY = "graggs_settings";

function load(): SiteSettings {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s);
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

    // Fetch from MongoDB
    fetch("/.netlify/functions/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object" && !data.error) {
          saveSettings(data);
          setSettings(data);
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

  const applyCoupon = useCallback((code: string, subtotal: number): { valid: boolean; discount: number; message: string } => {
    const current = load();
    const coupon = current.couponCodes.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);
    if (!coupon) return { valid: false, discount: 0, message: "Invalid or expired coupon code" };
    const discount = coupon.type === "percentage" ? Math.round(subtotal * coupon.discount / 100) : Math.min(coupon.discount, subtotal);
    return { valid: true, discount, message: `${coupon.type === "percentage" ? `${coupon.discount}%` : `PKR ${coupon.discount}`} discount applied!` };
  }, []);

  return { settings, updateSettings, addCoupon, deleteCoupon, toggleCoupon, applyCoupon };
}
