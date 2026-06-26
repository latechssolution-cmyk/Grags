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
    return () => { heroListeners.delete(handler); };
  }, []);

  const updateHero = useCallback((data: Partial<HeroData>) => {
    const next = { ...loadHero(), ...data };
    localStorage.setItem(HERO_KEY, JSON.stringify(next));
    setHero(next);
    notifyHero();
  }, []);

  return { hero, updateHero, defaultImage: heroDefault };
}

export function useFabric() {
  const [fabric, setFabric] = useState<FabricData>(loadFabric);

  useEffect(() => {
    const handler = () => setFabric(loadFabric());
    fabricListeners.add(handler);
    return () => { fabricListeners.delete(handler); };
  }, []);

  const updateFabric = useCallback((data: Partial<FabricData>) => {
    const next = { ...loadFabric(), ...data };
    localStorage.setItem(FABRIC_KEY, JSON.stringify(next));
    setFabric(next);
    notifyFabric();
  }, []);

  return { fabric, updateFabric, defaultImage: fabricDefault };
}
