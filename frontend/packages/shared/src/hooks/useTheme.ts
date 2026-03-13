import { useEffect } from "react";
import { create } from "zustand";

type Theme = "dark" | "light";
const STORAGE_KEY = "theme";

function getInitial(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  return "dark"; // デフォルトはダーク
}

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  if (theme === "dark") {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }
}

interface ThemeState {
  theme: Theme;
  toggle: () => void;
}

const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitial(),
  toggle: () =>
    set((state) => {
      const next: Theme = state.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {}
      return { theme: next };
    }),
}));

export function useTheme() {
  const { theme, toggle } = useThemeStore();

  // 初回マウント時に DOM に適用
  useEffect(() => {
    applyTheme(theme);
  }, []);

  return { theme, toggle, isDark: theme === "dark" };
}
