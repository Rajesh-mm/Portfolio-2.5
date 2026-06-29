"use client";

/**
 * src/components/ParticleSphere.tsx
 *
 * Pure canvas particle sphere. Handles ONLY:
 *   - 3-D rotation + depth
 *   - Cursor repulsion + spring return
 *   - Theme-aware particle colour
 *   - Cursor proximity glow (drawn on canvas)
 *   - Responsive particle count
 *
 * NO scroll logic, NO self-positioning, NO translateX.
 * All layout / scroll transforms live in HeroSphere.tsx.
 */

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

// Particle counts by breakpoint
const COUNT_DESKTOP = 900;
const COUNT_TABLET  = 500;

const SPHERE_RADIUS   = 155;
const ROTATION_SPEED  = 0.0014;

// Repulsion
const REPEL_RADIUS    = 130;   // px in unscaled canvas coords
const REPEL_STRENGTH  = 1.4;   // force magnitude
const REPEL_FALLOFF   = 2.0;   // power exponent (higher = sharper edge)
const REPEL_IMPULSE   = 20;    // px/frame push at full strength
const RETURN_LERP     = 0.072; // spring-return per frame
const MAX_DISPLACE    = SPHERE_RADIUS * 0.6;

// Depth
const DEPTH_POWER = 1.7;
const DOT_BACK    = 0.7;
const DOT_FRONT   = 2.6;
const ALPHA_BACK  = 0.06;
const ALPHA_FRONT = 0.92;

// Cursor glow
const GLOW_RADIUS    = 160;   // px
const GLOW_INTENSITY = 0.18;  // max alpha of radial gradient

// Camera
const TILT_X = 0.16;
const FOV    = 500;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Pt {
  hx: number; hy: number; hz: number;
  dx: number; dy: number;
}

export interface ParticleSphereProps {
  isDark?: boolean;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

function makeSphere(n: number): Pt[] {
  const pts: Pt[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y  = 1 - (i / (n - 1)) * 2;
    const r  = Math.sqrt(Math.max(0, 1 - y * y));
    const th = phi * i;
    pts.push({
      hx: Math.cos(th) * r * SPHERE_RADIUS,
      hy: y * SPHERE_RADIUS,
      hz: Math.sin(th) * r * SPHERE_RADIUS,
      dx: 0, dy: 0,
    });
  }
  return pts;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ParticleSphere({ isDark = true }: ParticleSphereProps) {
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const pts            = useRef<Pt[]>(makeSphere(COUNT_DESKTOP));
  const rotY           = useRef(0);
  const rafId          = useRef<number | null>(null);
  // Cursor in canvas-local coordinates (origin = canvas centre).
  // Stored as viewport coords and converted each frame to handle CSS transform.
  const cursorViewport = useRef({ x: -9999, y: -9999 });
  const reducedMotion  = useRef(false);
  const [mounted, setMounted] = useState(false);

  // ── Mount ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    reducedMotion.current =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Adjust particle count for tablet
    const isTablet = window.innerWidth < 1024 && window.innerWidth >= 768;
    if (isTablet) pts.current = makeSphere(COUNT_TABLET);

    setMounted(true);
  }, []);

  // ── Canvas resize ──────────────────────────────────────────────────────────
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const size   = Math.min(parent?.clientWidth ?? 480, 480);
    const dpr    = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width        = size * dpr;
    canvas.height       = size * dpr;
    canvas.style.width  = `${size}px`;
    canvas.style.height = `${size}px`;
  }, []);

  // ── Pointer tracking ───────────────────────────────────────────────────────
  // Store raw viewport coords. Canvas-local conversion happens in draw()
  // so it automatically accounts for any CSS transform on the canvas element.
  const onMouseMove = useCallback((e: MouseEvent) => {
    cursorViewport.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onDocLeave = useCallback(() => {
    cursorViewport.current = { x: -9999, y: -9999 };
  }, []);

  // ── Colour helpers ─────────────────────────────────────────────────────────
  // Called once per frame — cheap string refs.
  const particleColor = isDark ? "#ffffff" : "#0a0a0a";
  const glowColor     = isDark
    ? `rgba(255,255,255,${GLOW_INTENSITY})`
    : `rgba(0,0,0,${GLOW_INTENSITY})`;
  const glowColorEdge = isDark
    ? "rgba(255,255,255,0)"
    : "rgba(0,0,0,0)";

  // ── Render loop ────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) { rafId.current = requestAnimationFrame(draw); return; }
    const ctx = canvas.getContext("2d");
    if (!ctx)  { rafId.current = requestAnimationFrame(draw); return; }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W   = canvas.width  / dpr;
    const H   = canvas.height / dpr;
    const cx  = W / 2;
    const cy  = H / 2;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // ── Convert viewport cursor → canvas-local coords ──────────────────────
    // getBoundingClientRect() returns the RENDERED (scaled) bounds, so we
    // must account for that to get correct canvas-space coordinates.
    const rect       = canvas.getBoundingClientRect();
    // Scale factor between CSS pixels and canvas logical pixels
    const scaleX     = W / rect.width;
    const scaleY     = H / rect.height;
    const vx         = cursorViewport.current.x;
    const vy         = cursorViewport.current.y;
    // Canvas-centre relative coords, corrected for CSS scale
    const curX       = (vx - rect.left  - rect.width  / 2) * scaleX;
    const curY       = (vy - rect.top   - rect.height / 2) * scaleY;
    const cursorActive = vx > -9000 && !reducedMotion.current;

    // ── Rotation ───────────────────────────────────────────────────────────
    const spd = reducedMotion.current ? ROTATION_SPEED * 0.3 : ROTATION_SPEED;
    rotY.current += spd;

    const cosY = Math.cos(rotY.current);
    const sinY = Math.sin(rotY.current);
    const cosX = Math.cos(TILT_X);
    const sinX = Math.sin(TILT_X);

    // ── Cursor glow (drawn UNDER particles) ───────────────────────────────
    if (cursorActive) {
      const gx = cx + curX;
      const gy = cy + curY;
      const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, GLOW_RADIUS);
      grad.addColorStop(0,   glowColor);
      grad.addColorStop(0.4, glowColor);
      grad.addColorStop(1,   glowColorEdge);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(gx, gy, GLOW_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Project + physics ──────────────────────────────────────────────────
    const buf: Array<{ sx: number; sy: number; sz: number; size: number; a: number }> = [];

    for (const p of pts.current) {
      // Rotate Y
      const rx1 =  p.hx * cosY + p.hz * sinY;
      const ry1 =  p.hy;
      const rz1 = -p.hx * sinY + p.hz * cosY;

      // Rotate X (fixed tilt)
      const rx2 = rx1;
      const ry2 = ry1 * cosX - rz1 * sinX;
      const rz2 = ry1 * sinX + rz1 * cosX;

      // Perspective project — canonical position before displacement
      const proj   = FOV / (FOV + rz2 + SPHERE_RADIUS);
      const homeSx = cx + rx2 * proj;
      const homeSy = cy + ry2 * proj;

      // Repulsion — measured from canonical (undisplaced) home position
      if (cursorActive) {
        const dx   = (homeSx - cx) - curX;
        const dy   = (homeSy - cy) - curY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_RADIUS && dist > 0.5) {
          const t     = (REPEL_RADIUS - dist) / REPEL_RADIUS;
          const force = Math.pow(t, REPEL_FALLOFF) * REPEL_STRENGTH;
          p.dx += (dx / dist) * force * REPEL_IMPULSE;
          p.dy += (dy / dist) * force * REPEL_IMPULSE;
        }
      }

      // Spring return
      p.dx *= (1 - RETURN_LERP);
      p.dy *= (1 - RETURN_LERP);
      // Clamp
      if (p.dx >  MAX_DISPLACE) p.dx =  MAX_DISPLACE;
      if (p.dx < -MAX_DISPLACE) p.dx = -MAX_DISPLACE;
      if (p.dy >  MAX_DISPLACE) p.dy =  MAX_DISPLACE;
      if (p.dy < -MAX_DISPLACE) p.dy = -MAX_DISPLACE;

      // Depth
      const zNorm   = (rz2 + SPHERE_RADIUS) / (2 * SPHERE_RADIUS);
      const zCurved = Math.pow(zNorm, DEPTH_POWER);
      const a       = ALPHA_BACK  + (ALPHA_FRONT - ALPHA_BACK)  * zCurved;
      const size    = DOT_BACK    + (DOT_FRONT   - DOT_BACK)    * zCurved;

      buf.push({ sx: homeSx + p.dx, sy: homeSy + p.dy, sz: rz2, size, a });
    }

    // Sort back→front
    buf.sort((a, b) => a.sz - b.sz);

    // Draw particles
    ctx.fillStyle = particleColor;
    for (const pt of buf) {
      ctx.globalAlpha = pt.a;
      ctx.beginPath();
      ctx.arc(pt.sx, pt.sy, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    rafId.current = requestAnimationFrame(draw);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark]);  // re-bind when theme changes (colour strings captured in closure)

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;

    resize();
    const ro = new ResizeObserver(resize);
    if (canvasRef.current?.parentElement) {
      ro.observe(canvasRef.current.parentElement);
    }

    window.addEventListener("mousemove",     onMouseMove,  { passive: true });
    document.addEventListener("mouseleave",  onDocLeave);
    rafId.current = requestAnimationFrame(draw);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      ro.disconnect();
      window.removeEventListener("mousemove",    onMouseMove);
      document.removeEventListener("mouseleave", onDocLeave);
    };
  }, [mounted, draw, resize, onMouseMove, onDocLeave]);

  if (!mounted) {
    // SSR placeholder — same intrinsic size, no layout shift
    return (
      <div
        aria-hidden="true"
        style={{ width: "100%", aspectRatio: "1 / 1" }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        display:     "block",
        width:       "100%",
        aspectRatio: "1 / 1",
      }}
    />
  );
}
