import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function getInitial(): Theme {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  // respeta preferencia del SO
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitial);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return {
    theme,
    setTheme,
    toggle: () => setTheme(t => (t === "dark" ? "light" : "dark")),
  };
}
