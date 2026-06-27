"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
type Theme = "dark" | "light";
const Ctx = createContext<{ theme: Theme; toggle: () => void }>({ theme:"dark", toggle:()=>{} });
export const useTheme = () => useContext(Ctx);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme]   = useState<Theme>("dark");
  const [ready, setReady]   = useState(false);

  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme") as Theme | null;
    const stored = localStorage.getItem("pf-theme") as Theme | null;
    const sys = window.matchMedia("(prefers-color-scheme:light)").matches ? "light" : "dark";
    const resolved = attr ?? stored ?? sys;
    setTheme(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
    setReady(true);
  }, []);

  const toggle = useCallback(() => {
    setTheme(prev => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("pf-theme", next);
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  }, []);

  if (!ready) return <>{children}</>;
  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>;
}
