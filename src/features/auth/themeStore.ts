// src/features/auth/themeStore.ts
import { create } from "zustand";

type Theme = "light" | "dark";
interface ThemeState { theme: Theme; toggle: () => void; }

export const useThemeStore = create<ThemeState>((set,get)=>({
  theme: (localStorage.getItem("theme") as Theme) || "light",
  toggle: () => {
    const next = get().theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
    set({ theme: next });
  }
}));

// inicializa al cargar
document.documentElement.classList.toggle(
  "dark",
  (localStorage.getItem("theme") || "light") === "dark"
);
