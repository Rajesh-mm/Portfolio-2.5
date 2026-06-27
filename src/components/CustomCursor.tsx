"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

type CursorState = "default" | "button" | "card" | "link" | "text";

interface CursorConfig {
  outerSize: number;      // px – outer ring diameter
  dotSize: number;        // px – inner dot diameter
  outerOpacity: number;
  dotOpacity: number;
  blendMode: "normal" | "difference" | "exclusion";
  label: string;          // optional text inside ring (e.g. "View →")
  showLabel: boolean;
}

// ─── State map ────────────────────────────────────────────────────────────────

const STATE_CONFIG: Record<CursorState, CursorConfig> = {
  default: {
    outerSize: 36,
    dotSize: 6,
    outerOpacity: 0.55,
    dotOpacity: 1,
    blendMode: "difference",
    label: "",
    showLabel: false,
  },
  button: {
    outerSize: 60,
    dotSize: 8,
    outerOpacity: 0.75,
    dotOpacity: 1,
    blendMode: "difference",
    label: "",
    showLabel: false,
  },
  card: {
    outerSize: 72,
    dotSize: 0,
    outerOpacity: 0.65,
    dotOpacity: 0,
    blendMode: "normal",
    label: "View →",
    showLabel: true,
  },
  link: {
    outerSize: 48,
    dotSize: 6,
    outerOpacity: 0.85,
    dotOpacity: 1,
    blendMode: "difference",
    label: "",
    showLabel: false,
  },
  text: {
    outerSize: 4,
    dotSize: 2,
    outerOpacity: 0.4,
    dotOpacity: 0.7,
    blendMode: "normal",
    label: "",
    showLabel: false,
  },
};

// ─── Spring config ────────────────────────────────────────────────────────────

// Outer ring – lazy / trailing feel
const OUTER_SPRING = { stiffness: 160, damping: 28, mass: 0.6 };
// Inner dot – snappy
const DOT_SPRING   = { stiffness: 500, damping: 40, mass: 0.3 };

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Pick the cursor state from an element by walking up the DOM. */
function resolveState(el: Element | null): CursorState {
  let node = el;
  while (node && node !== document.body) {
    const tag = node.tagName?.toLowerCase();
    // Project cards (data-cursor="card")
    if ((node as HTMLElement).dataset?.cursor === "card") return "card";
    // Buttons
    if (
      tag === "button" ||
      (node as HTMLElement).role === "button" ||
      (node as HTMLElement).dataset?.cursor === "button"
    ) return "button";
    // Links
    if (tag === "a") return "link";
    // Editable / text fields
    if (tag === "input" || tag === "textarea" || tag === "select") return "text";
    // Explicit override
    const override = (node as HTMLElement).dataset?.cursor as CursorState | undefined;
    if (override && STATE_CONFIG[override]) return override;

    node = node.parentElement;
  }
  return "default";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomCursor() {
  // Raw mouse position (no spring — used for dot)
  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);

  // Springy position for outer ring
  const springX = useSpring(rawX, OUTER_SPRING);
  const springY = useSpring(rawY, OUTER_SPRING);

  // Dot gets its own tighter spring so it leads the ring slightly
  const dotSpringX = useSpring(rawX, DOT_SPRING);
  const dotSpringY = useSpring(rawY, DOT_SPRING);

  const [state, setState] = useState<CursorState>("default");
  const [visible, setVisible] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const stateRef = useRef<CursorState>("default");
  const rafRef   = useRef<number | null>(null);
  const latestX  = useRef(-100);
  const latestY  = useRef(-100);

  // ── Detect dark/light theme ──────────────────────────────────────────────

  const syncTheme = useCallback(() => {
    const html = document.documentElement;
    const dark =
      html.classList.contains("dark") ||
      html.dataset.theme === "dark" ||
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(dark);
  }, []);

  useEffect(() => {
    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", syncTheme);
    return () => {
      observer.disconnect();
      mq.removeEventListener("change", syncTheme);
    };
  }, [syncTheme]);

  // ── Mouse move (RAF-throttled) ────────────────────────────────────────────

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      latestX.current = e.clientX;
      latestY.current = e.clientY;

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(() => {
          rawX.set(latestX.current);
          rawY.set(latestY.current);
          rafRef.current = null;
        });
      }
    };

    const onEnter = () => setVisible(true);
    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseleave", onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [rawX, rawY]);

  // ── Hover state detection ─────────────────────────────────────────────────

  useEffect(() => {
    const onOver = (e: MouseEvent) => {
      const next = resolveState(e.target as Element);
      if (next !== stateRef.current) {
        stateRef.current = next;
        setState(next);
      }
    };

    window.addEventListener("mouseover", onOver, { passive: true });
    return () => window.removeEventListener("mouseover", onOver);
  }, []);

  // ── Touch / coarse pointer – don't render on mobile ───────────────────────

  const [isFinePointer, setIsFinePointer] = useState(false);
  useEffect(() => {
    setIsFinePointer(window.matchMedia("(pointer: fine)").matches);
  }, []);

  if (!isFinePointer) return null;

  // ── Colors ────────────────────────────────────────────────────────────────

  // In difference blend mode: white on dark bg, white on light bg both invert well.
  // For "normal" blend (card state) we need an explicit color.
  const ringColor   = isDark ? "rgba(255,255,255,1)" : "rgba(0,0,0,1)";
  const dotColor    = isDark ? "rgba(255,255,255,1)" : "rgba(0,0,0,1)";
  // Card cursor label bg
  const cardBg      = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  const cardBorder  = isDark ? "rgba(255,255,255,0.3)"  : "rgba(0,0,0,0.25)";
  const labelColor  = isDark ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.9)";

  const cfg = STATE_CONFIG[state];

  return (
    <>
      {/* ── Outer ring ─────────────────────────────────────────────────── */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 99999,
          mixBlendMode: cfg.blendMode,
          // Center on cursor
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: visible ? cfg.outerOpacity : 0,
        }}
        animate={{
          width:  cfg.outerSize,
          height: cfg.outerSize,
        }}
        transition={{
          width:  { type: "spring", stiffness: 300, damping: 30 },
          height: { type: "spring", stiffness: 300, damping: 30 },
          opacity: { duration: 0.15 },
        }}
      >
        {/* Ring border */}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: `1.5px solid ${cfg.showLabel ? cardBorder : ringColor}`,
            backgroundColor: cfg.showLabel ? cardBg : "transparent",
            backdropFilter: cfg.showLabel ? "blur(4px)" : "none",
            WebkitBackdropFilter: cfg.showLabel ? "blur(4px)" : "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "border-color 0.2s, background-color 0.2s",
          }}
        >
          {/* Card label */}
          {cfg.showLabel && (
            <motion.span
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.18 }}
              style={{
                fontSize: "11px",
                fontWeight: 500,
                letterSpacing: "0.04em",
                color: labelColor,
                whiteSpace: "nowrap",
                fontFamily: "inherit",
                userSelect: "none",
              }}
            >
              {cfg.label}
            </motion.span>
          )}
        </div>
      </motion.div>

      {/* ── Inner dot ──────────────────────────────────────────────────── */}
      <motion.div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 100000,
          mixBlendMode: "difference",
          x: dotSpringX,
          y: dotSpringY,
          translateX: "-50%",
          translateY: "-50%",
          opacity: visible ? cfg.dotOpacity : 0,
          backgroundColor: dotColor,
          borderRadius: "50%",
        }}
        animate={{
          width:  cfg.dotSize,
          height: cfg.dotSize,
        }}
        transition={{
          width:  { type: "spring", stiffness: 400, damping: 30 },
          height: { type: "spring", stiffness: 400, damping: 30 },
        }}
      />
    </>
  );
}
