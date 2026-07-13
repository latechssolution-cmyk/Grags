import { useState, useEffect, useCallback } from "react";

export type Theme = "light" | "dark";
const STORAGE_KEY = "graggs_theme";

function getInitial(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (saved === "light" || saved === "dark") return saved;
  return "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

const listeners = new Set<() => void>();
let current: Theme = typeof window !== "undefined" ? getInitial() : "light";

if (typeof window !== "undefined") {
  applyTheme(current);
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(current);

  useEffect(() => {
    const handler = () => setTheme(current);
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  const setAndApply = useCallback((t: Theme) => {
    current = t;
    localStorage.setItem(STORAGE_KEY, t);
    applyTheme(t);
    listeners.forEach((l) => l());
  }, []);

  const toggle = useCallback(() => setAndApply(current === "dark" ? "light" : "dark"), [setAndApply]);

  return { theme, setTheme: setAndApply, toggle };
}
