import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/store/themeStore";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={`p-2 rounded-full transition-colors hover:bg-foreground/10 ${className}`}
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
