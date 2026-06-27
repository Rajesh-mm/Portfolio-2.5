"use client";
import { useEffect } from "react";
import Lenis from "lenis";
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 5), /* quint ease-out */
      smoothWheel: true, wheelMultiplier: 0.95, touchMultiplier: 1.5,
    });
    let raf: number;
    const animate = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(animate); };
    raf = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);
  return <>{children}</>;
}
