import { useState, useEffect, useCallback } from "react";
import heroDefault from "@/assets/hero-model.jpg";
import fabricDefault from "@/assets/fabric-closeup.jpg";

export interface HeroData {
  image: string;
  videoUrl: string;
  useVideo: boolean;
  heading: string;
  subheading: string;
  buttonText: string;
  buttonLink: string;
}

export interface FabricData {
  image: string;
  heading: string;
  subheading: string;
  buttonText: string;
  buttonLink: string;
}

const defaultHero: HeroData = {
  image: heroDefault,
  videoUrl: "/hero-video.mp4",
  useVideo: true,
  heading: "Redefining\nElegance",
  subheading: "Summer 2025 Collection",
  buttonText: "Shop the Drop",
  buttonLink: "#products",
};

const defaultFabric: FabricData = {
  image: fabricDefault,
  heading: "Every Thread\nTells a Story",
  subheading: "Crafted With Intention",
  buttonText: "Discover Fabrics",
  buttonLink: "#",
};

const HERO_KEY = "graggs_hero";
const FABRIC_KEY = "graggs_fabric";

function loadHero(): HeroData {
  try {
    const s = localStorage.getItem(HERO_KEY);
    if (s) {
      const parsed = JSON.parse(s);
      return { ...defaultHero, ...parsed };
    }
  } catch {}
  return defaultHero;
}

function loadFabric(): FabricData {
  try {
    const s = localStorage.getItem(FABRIC_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return defaultFabric;
}

const heroListeners = new Set<() => void>();
function notifyHero() { heroListeners.forEach((l) => l()); }

const fabricListeners = new Set<() => void>();
function notifyFabric() { fabricListeners.forEach((l) => l()); }

export function useHero() {
  const [hero, setHero] = useState<HeroData>(loadHero);

  useEffect(() => {
    const handler = () => setHero(loadHero());
    heroListeners.add(handler);

    // Fetch from MongoDB
    fetch("/.netlify/functions/hero")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object" && !data.error) {
          if (data.hero) {
            localStorage.setItem(HERO_KEY, JSON.stringify(data.hero));
            setHero(data.hero);
          }
          if (data.fabric) {
            localStorage.setItem(FABRIC_KEY, JSON.stringify(data.fabric));
            notifyFabric();
          }
        }
      })
      .catch((err) => console.error("Error fetching hero from MongoDB:", err));

    return () => { heroListeners.delete(handler); };
  }, []);

  const updateHero = useCallback((data: Partial<HeroData>) => {
    const nextHero = { ...loadHero(), ...data };
    localStorage.setItem(HERO_KEY, JSON.stringify(nextHero));
    setHero(nextHero);
    notifyHero();

    const currentFabric = loadFabric();
    fetch("/.netlify/functions/hero", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hero: nextHero, fabric: currentFabric }),
    })
      .then((res) => res.json())
      .catch((err) => console.error("Error saving hero to MongoDB:", err));
  }, []);

  return { hero, updateHero, defaultImage: heroDefault };
}

export function useFabric() {
  const [fabric, setFabric] = useState<FabricData>(loadFabric);

  useEffect(() => {
    const handler = () => setFabric(loadFabric());
    fabricListeners.add(handler);

    // Fetch from MongoDB
    fetch("/.netlify/functions/hero")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === "object" && !data.error) {
          if (data.fabric) {
            localStorage.setItem(FABRIC_KEY, JSON.stringify(data.fabric));
            setFabric(data.fabric);
          }
          if (data.hero) {
            localStorage.setItem(HERO_KEY, JSON.stringify(data.hero));
            notifyHero();
          }
        }
      })
      .catch((err) => console.error("Error fetching fabric from MongoDB:", err));

    return () => { fabricListeners.delete(handler); };
  }, []);

  const updateFabric = useCallback((data: Partial<FabricData>) => {
    const nextFabric = { ...loadFabric(), ...data };
    localStorage.setItem(FABRIC_KEY, JSON.stringify(nextFabric));
    setFabric(nextFabric);
    notifyFabric();

    const currentHero = loadHero();
    fetch("/.netlify/functions/hero", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hero: currentHero, fabric: nextFabric }),
    })
      .then((res) => res.json())
      .catch((err) => console.error("Error saving fabric to MongoDB:", err));
  }, []);

  return { fabric, updateFabric, defaultImage: fabricDefault };
}
