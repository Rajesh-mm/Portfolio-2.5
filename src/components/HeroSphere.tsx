"use client";

/**
 * src/components/HeroSphere.tsx  ─ V3
 *
 * Positions and animates ParticleSphere as a persistent, fixed-position
 * visual companion that travels through the entire page scroll — not
 * just the hero section.
 *
 * Key changes from V2:
 *   - position: fixed (was flex-in-flow) — no layout reservation, no
 *     flexbox space, floats independently above background / below cards
 *   - Multi-stop scroll narrative matching the exact keyframes specified:
 *       0%   → scale 1.00  opacity 1.00  (hero, right side)
 *       30%  → scale 0.85  opacity 0.80  (entering Work)
 *       50%  → scale 0.65  opacity 0.55  (mid Work)
 *       70%  → scale 0.45  opacity 0.35  (entering About)
 *       90%  → scale 0.28  opacity 0.18  (footer)
 *       100% → scale 0.28  opacity 0.18  (never reaches 0)
 *   - Progress is now derived from FULL DOCUMENT scroll (useScroll with no
 *     target), not just the hero section — required because the sphere is
 *     a page-wide companion, not a hero-only decoration
 *   - z-index: 10 — sits above background grid, below glass cards (z:20+)
 *     and below nav (z:50+)
 *   - pointer-events: none on the wrapper so it never blocks clicks, but
 *     mousemove still bubbles through to window listeners in ParticleSphere
 *     (pointer-events: none does not block mousemove event delivery to
 *     document/window-level listeners — only blocks direct hit-testing)
 *
 * Usage — unchanged from V2:
 *
 *   <section className="hero-layout">
 *     <div className="hero-content">…</div>
 *     <HeroSphere />
 *   </section>
 *
 *   Note: heroRef prop removed — V3 tracks whole-document scroll instead
 *   of hero-section-only scroll, since the sphere must persist through
 *   Work and About sections by design.
 */

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import ParticleSphere from "./ParticleSphere";

// ─── Scroll narrative keyframes ────────────────────────────────────────────────
// Document-scroll progress [0, 1] mapped to visual state.
// NOTE: these fractions assume the hero is roughly the first viewport and
// Work/About follow in normal document flow — i.e. progress correlates with
// "how far through the page" the user has scrolled, which is what the brief
// describes (Hero / Work ~30-50% / mid-Work ~50-70% / About ~70-90% / Footer).

const SCROLL_STOPS   = [0,    0.30, 0.50, 0.70, 0.90, 1.0];
const SCALE_STOPS    = [1.00, 0.85, 0.65, 0.45, 0.28, 0.28];
const OPACITY_STOPS  = [1.00, 0.80, 0.55, 0.35, 0.18, 0.18];
// Horizontal drift — percentage of viewport width, right → center-left.
// Stays within viewport bounds at every stop (no negative overflow).
const X_STOPS_VW     = [0,    -4,   -9,   -14,  -18,  -18];

// ─── Component ────────────────────────────────────────────────────────────────

export default function HeroSphere() {
  const [mounted, setMounted]   = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDark,   setIsDark]   = useState(true);

  // ── Mount + environment detection ──────────────────────────────────────────
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });

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
      window.removeEventListener("resize", checkMobile);
      mo.disconnect();
      mq.removeEventListener("change", syncTheme);
    };
  }, []);

  // ── Whole-document scroll progress ────────────────────────────────────────
  // No target = tracks the page's own scroll container, normalised [0, 1]
  // across the full scrollable height. This is what allows the sphere to
  // persist its narrative through Hero → Work → About → Footer.
  const { scrollYProgress } = useScroll();

  // ── Multi-stop transforms ─────────────────────────────────────────────────
  const rawScale   = useTransform(scrollYProgress, SCROLL_STOPS, SCALE_STOPS);
  const rawOpacity = useTransform(scrollYProgress, SCROLL_STOPS, OPACITY_STOPS);
  const rawXNum    = useTransform(scrollYProgress, SCROLL_STOPS, X_STOPS_VW);

  // Spring smoothing — tuned for a cinematic, slightly trailing feel
  // (heavier mass than UI springs since this is an ambient background element)
  const springCfg = { stiffness: 70, damping: 24, mass: 1.1 };
  const scale     = useSpring(rawScale,   springCfg);
  const opacity   = useSpring(rawOpacity, springCfg);
  const xNum      = useSpring(rawXNum,    springCfg);
  const xVw       = useTransform(xNum, (v) => `${v}vw`);

  // ── Mobile / SSR guard ────────────────────────────────────────────────────
  // Sphere fully disabled on mobile per spec — no canvas, no RAF, no DOM cost
  // beyond this early return.
  if (!mounted || isMobile) return null;

  return (
    <motion.div
      className="hero-sphere"
      aria-hidden="true"
      style={{
        position:      "fixed",
        top:            "50%",
        right:          0,
        // Centre vertically on the hero's visual midline, then let scroll
        // drift carry it left via xVw. translateY(-50%) keeps vertical
        // centring independent of viewport height changes.
        translateY:    "-50%",
        x:              xVw,
        scale,
        opacity,
        transformOrigin: "center center",
        // z-index 10: above background grid (z:0), below glass cards (z:20+)
        // and below nav (z:50+) — see globals.css layering block.
        zIndex:         10,
        // Never intercepts clicks/hover on content beneath it.
        pointerEvents:  "none",
        willChange:     "transform, opacity",
      }}
    >
      {/* Ambient halo — theme aware, sits behind the canvas particles */}
      <div
        aria-hidden="true"
        style={{
          position:      "absolute",
          inset:         "6%",
          borderRadius:  "50%",
          background:    isDark
            ? "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.025) 50%, transparent 72%)"
            : "radial-gradient(circle, rgba(32,32,32,0.06) 0%, rgba(32,32,32,0.015) 50%, transparent 72%)",
          pointerEvents: "none",
          zIndex:        0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <ParticleSphere isDark={isDark} />
      </div>
    </motion.div>
  );
}
