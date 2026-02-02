"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "glue:theme";

type Theme = "dark" | "light";

function getPreferredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
}

export default function ThemeToggle({ label = false }: { label?: boolean }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const initial = getPreferredTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        applyTheme(next);
      }}
      className={label ? "w-full justify-between" : "gap-2"}
    >
      <span className="inline-flex items-center gap-2">
        {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        {label ? "Appearance" : null}
      </span>
      {label ? <span className="text-xs text-[#8A94A7]">{theme}</span> : null}
    </Button>
  );
}
