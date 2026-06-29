"use client";

/**
 * src/components/HeroSphere.tsx
 *
 * Scroll-aware wrapper for ParticleSphere.
 *
 * Responsibilities:
 *   - Receives a ref to the hero <section> element
 *   - Tracks scroll progress of that section via Framer Motion useScroll
 *   - Applies scroll-driven scale + opacity + x-drift to the sphere column
 *   - Detects dark/light theme and passes isDark to ParticleSphere
 *   - Hides entirely on mobile (< 768 px) — no canvas, no RAF
 *
 * The sphere behaves as a persistent visual companion:
 *   scroll 0%   → full size, full opacity, right column
 *   scroll 40%  → 60% size, 70% opacity, drifting left
 *   scroll 80%  → 35% size, 30% opacity, near left edge
 *   scroll 100% → 28% size, 20% opacity — still visible, never disappears
 *
 * The x-drift is applied to THIS wrapper, so the inner canvas coordinate
 * system is never disturbed. ParticleSphere stays centred in its own space.
 *
 * Usage in page.tsx / Hero component:
 *
 *   const heroRef = useRef<HTMLElement>(null);
 *
 *   <section ref={heroRef} className="hero-layout">
 *     <div className="hero-content">…</div>
 *     <HeroSphere heroRef={heroRef} />
 *   </section>
 */

import { useRef, useEffect, useState, RefObject } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import ParticleSphere from "./ParticleSphere";

// ─── Props ────────────────────────────────────────────────────────────────────

interface HeroSphereProps {
  /** Ref to the hero <section> — useScroll tracks this element's scroll progress */
  heroRef: RefObject<HTMLElement | null>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroSphere({ heroRef }: HeroSphereProps) {
  const [mounted, setMounted]   = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDark,   setIsDark]   = useState(true);

  // ── Mount + env detection ──────────────────────────────────────────────────
  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    // Theme: check <html> class or data-theme attribute
    const syncTheme = () => {
      const html = document.documentElement;
      setIsDark(
        html.classList.contains("dark") ||
        html.dataset.theme === "dark"   ||
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    };
    syncTheme();

    const mo = new MutationObserver(syncTheme);
    mo.observe(document.documentElement, {
      attributes:      true,
      attributeFilter: ["class", "data-theme"],
    });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", syncTheme);

    setMounted(true);
    return () => {
      mo.disconnect();
      mq.removeEventListener("change", syncTheme);
    };
  }, []);

  // ── Scroll tracking ────────────────────────────────────────────────────────
  // Target the hero section element so progress = 0 when hero top is at
  // viewport top, progress = 1 when hero bottom is at viewport top.
  const { scrollYProgress } = useScroll({
    target:  heroRef,
    offset:  ["start start", "end start"],
  });

  // ── Transform values ───────────────────────────────────────────────────────
  // Sphere is a persistent companion — never fully disappears.
  // Scale:   1.0 → 0.28  (shrinks significantly but remains visible)
  // Opacity: 1.0 → 0.18  (fades to ghost-level, never 0)
  // X:       0vw → -18vw (drifts left; viewport-relative so it works at any width)
  //          Stays within viewport — no negative overflow, no clipping.

  const rawScale   = useTransform(scrollYProgress, [0, 1], [1.0,  0.28]);
  const rawOpacity = useTransform(scrollYProgress, [0, 1], [1.0,  0.18]);
  const rawX       = useTransform(scrollYProgress, [0, 1], ["0vw", "-20vw"]);

  // Light spring — feels organic, not mechanical
  const springCfg = { stiffness: 90, damping: 25, mass: 0.8 };
  const scale     = useSpring(rawScale,   springCfg);
  const opacity   = useSpring(rawOpacity, springCfg);
  // x uses rawX directly (string MotionValue) — springs don't handle string units
  // so we apply a numeric spring on a percentage copy
  const rawXNum   = useTransform(scrollYProgress, [0, 1], [0, -20]);
  const xNum      = useSpring(rawXNum, springCfg);
  const xVw       = useTransform(xNum, (v) => `${v}vw`);

  // ── SSR / mobile guard ─────────────────────────────────────────────────────
  // Return a zero-size placeholder so the hero layout flex column still reserves
  // the hero-sphere slot without any visual output.
  if (!mounted || isMobile) {
    return (
      <div
        className="hero-sphere"
        aria-hidden="true"
        style={{ visibility: "hidden" }}
      />
    );
  }

  return (
    // motion.div carries the scroll-driven x-drift.
    // class="hero-sphere" matches the CSS the user specified.
    <motion.div
      className="hero-sphere"
      aria-hidden="true"
      style={{
        x:          xVw,
        // Preserve layout flow — x-drift is visual only, doesn't affect layout
        willChange: "transform",
      }}
    >
      {/*
        Inner wrapper carries scale + opacity.
        Separated from x-drift so transforms compose cleanly
        and getBoundingClientRect() inside ParticleSphere only
        sees the scale, not the horizontal shift.
      */}
      <motion.div
        style={{
          scale,
          opacity,
          transformOrigin: "center center",
          willChange:      "transform, opacity",
          width:           "100%",
          position:        "relative",
        }}
      >
        {/* Ambient halo — adapts to theme */}
        <div
          aria-hidden="true"
          style={{
            position:        "absolute",
            inset:           "8%",
            borderRadius:    "50%",
            background:      isDark
              ? "radial-gradient(circle, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 50%, transparent 72%)"
              : "radial-gradient(circle, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.01) 50%, transparent 72%)",
            pointerEvents:   "none",
            zIndex:          0,
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <ParticleSphere isDark={isDark} />
        </div>
      </motion.div>
    </motion.div>
  );
}
