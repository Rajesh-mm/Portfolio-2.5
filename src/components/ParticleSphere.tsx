"use client";

/**
 * src/components/ParticleSphere.tsx  ─ V5
 *
 * SIZING CONTRACT (the one rule this component must never break):
 *   - canvas.style.width / canvas.style.height are NEVER set by this file.
 *   - The <canvas> element carries  width:"100%"  height:"auto"  aspectRatio:"1/1"
 *     in its JSX style prop. That is the sole source of truth for visual size.
 *   - HeroSphere.tsx / .hero-sphere CSS controls the parent container width.
 *   - This component only sets canvas.width / canvas.height (the internal
 *     pixel buffer) by reading getBoundingClientRect() after CSS layout.
 *
 * Everything else this component owns:
 *   - Fibonacci sphere geometry, 3-D rotation, depth / painter's sort
 *   - Cursor repulsion — single critically-damped spring per particle
 *   - Cursor proximity glow (canvas-drawn, under particles)
 *   - Theme-aware particle + glow colour
 *   - Cached DOMRect (invalidated on resize, never re-read per frame)
 *   - RAF paused when document is hidden
 *   - prefers-reduced-motion respected
 */

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const COUNT_DESKTOP = 1000;
const COUNT_TABLET  =  520;

// SPHERE_RADIUS is in canvas logical-pixel units.
// The canvas logical size equals the CSS pixel size of the element
// (i.e. getBoundingClientRect().width — independent of DPR).
// At 700px canvas width, radius 220 gives a sphere that fills ~63% of the
// canvas diameter — visually substantial without bleeding to the edges.
const SPHERE_RADIUS   = 220;

const ROTATION_SPEED  = 0.0013;

// Repulsion — single critically-damped spring model.
// a = -SPRING_K·dx - SPRING_C·vx   (same for y)
// Critical damping when SPRING_C ≈ 2·√SPRING_K = 2·√0.06 ≈ 0.49
const REPEL_RADIUS    = 190;   // canvas-local px
const REPEL_STRENGTH  = 2.3;
const REPEL_SWIRL     = 0.35;
const REPEL_FALLOFF   = 1.6;
const REPEL_IMPULSE   = 7.5;
const SPRING_K        = 0.06;
const SPRING_C        = 0.50;
const MAX_DISPLACE    = SPHERE_RADIUS * 0.42;

const DEPTH_POWER     = 1.8;
const DOT_BACK        = 0.6;
const DOT_FRONT       = 2.8;
const ALPHA_BACK      = 0.05;
const ALPHA_FRONT     = 0.94;

const GLOW_RADIUS     = 180;
const GLOW_PEAK       = 0.22;
const GLOW_MID        = 0.09;

const TILT_X = 0.14;
const FOV    = 540;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Pt {
  hx: number; hy: number; hz: number;
  dx: number; dy: number;
  vx: number; vy: number;
}

export interface ParticleSphereProps {
  isDark?: boolean;
}

// ─── Fibonacci sphere ─────────────────────────────────────────────────────────

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
      dx: 0, dy: 0, vx: 0, vy: 0,
    });
  }
  return pts;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ParticleSphere({ isDark = true }: ParticleSphereProps) {
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const pts           = useRef<Pt[]>(makeSphere(COUNT_DESKTOP));
  const rotY          = useRef(0);
  const rafId         = useRef<number | null>(null);
  const paused        = useRef(false);
  const cursorVP      = useRef({ x: -9999, y: -9999 });
  // Cached rect — set by resize(), invalidated by ResizeObserver, never read
  // inside the RAF loop except as a coordinate-conversion input.
  const cachedRect    = useRef<DOMRect | null>(null);
  const reducedMotion = useRef(false);
  const [mounted, setMounted] = useState(false);

  // ── Mount ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    reducedMotion.current =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    if (isTablet) pts.current = makeSphere(COUNT_TABLET);
    setMounted(true);
  }, []);

  // ── Resize ─────────────────────────────────────────────────────────────────
  //
  // This function MUST NOT write canvas.style.width or canvas.style.height.
  //
  // The bug this fixes (DevTools evidence):
  //   canvas.style.width === "500px"  ← set by the old resize() via
  //   `canvas.style.width = \`${parent.clientWidth}px\``
  //   which froze the visual size at whatever clientWidth was at call time,
  //   ignoring all subsequent CSS container changes.
  //
  // Correct approach: let CSS own the visual dimensions entirely.
  //   - canvas JSX has  style={{ width:"100%", height:"auto", aspectRatio:"1/1" }}
  //   - resize() only sets the pixel BUFFER (canvas.width / canvas.height)
  //     by reading the CSS-resolved size from getBoundingClientRect()
  //   - ResizeObserver fires after layout so rect.width is always accurate
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Read the CSS-resolved rendered dimensions.
    // Do NOT use canvas.clientWidth / parentElement.clientWidth — those can
    // be stale or wrong when the canvas itself has width:100% and its parent
    // chain hasn't fully resolved yet.
    const rect = canvas.getBoundingClientRect();
    const w    = Math.round(rect.width);
    const h    = Math.round(rect.height);

    if (w === 0 || h === 0) return; // not visible yet, RO will retry

    const dpr      = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width   = w * dpr;   // physical pixel buffer width
    canvas.height  = h * dpr;   // physical pixel buffer height
    // canvas.style.width  ← intentionally NOT set
    // canvas.style.height ← intentionally NOT set

    cachedRect.current = rect;  // cache for cursor coordinate conversion
  }, []);

  // ── Pointer tracking ───────────────────────────────────────────────────────
  const onMouseMove = useCallback((e: MouseEvent) => {
    cursorVP.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onDocLeave = useCallback(() => {
    cursorVP.current = { x: -9999, y: -9999 };
  }, []);

  // ── Tab visibility ─────────────────────────────────────────────────────────
  const onVisibilityChange = useCallback(() => {
    paused.current = document.hidden;
  }, []);

  // ── Draw ───────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    if (paused.current) { rafId.current = requestAnimationFrame(draw); return; }

    const canvas = canvasRef.current;
    if (!canvas)  { rafId.current = requestAnimationFrame(draw); return; }
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx)     { rafId.current = requestAnimationFrame(draw); return; }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    // Logical pixel dimensions — what drawing coordinates operate in
    const W   = canvas.width  / dpr;
    const H   = canvas.height / dpr;
    const cx  = W / 2;
    const cy  = H / 2;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // ── Cursor → canvas-local coords ──────────────────────────────────────
    // The canvas may be visually scaled by Framer Motion (scroll-driven scale
    // in HeroSphere). cachedRect.width reflects that rendered (scaled) width.
    // We divide the cursor offset by that width (not the logical W) to get
    // canvas-logical coordinates regardless of any CSS transform.
    const rect = cachedRect.current;
    let curX = -9999, curY = -9999;
    if (rect && rect.width > 0) {
      // scaleCorrect maps CSS-pixel cursor offsets → canvas logical pixels
      const scaleCorrectX = W / rect.width;
      const scaleCorrectY = H / rect.height;
      const vx = cursorVP.current.x;
      const vy = cursorVP.current.y;
      curX = (vx - rect.left - rect.width  / 2) * scaleCorrectX;
      curY = (vy - rect.top  - rect.height / 2) * scaleCorrectY;
    }
    const cursorActive = cursorVP.current.x > -9000 && !reducedMotion.current;

    // ── Rotation ──────────────────────────────────────────────────────────
    const spd = reducedMotion.current ? ROTATION_SPEED * 0.25 : ROTATION_SPEED;
    rotY.current += spd;
    const cosY = Math.cos(rotY.current);
    const sinY = Math.sin(rotY.current);
    const cosX = Math.cos(TILT_X);
    const sinX = Math.sin(TILT_X);

    // ── Cursor glow (drawn under particles) ───────────────────────────────
    if (cursorActive) {
      const gx   = cx + curX;
      const gy   = cy + curY;
      const rv   = isDark ? 255 : 32;
      const peak = isDark ? GLOW_PEAK : GLOW_PEAK * 0.55;
      const mid  = isDark ? GLOW_MID  : GLOW_MID  * 0.55;
      const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, GLOW_RADIUS);
      grad.addColorStop(0,   `rgba(${rv},${rv},${rv},${peak})`);
      grad.addColorStop(0.4, `rgba(${rv},${rv},${rv},${mid})`);
      grad.addColorStop(1,   `rgba(${rv},${rv},${rv},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(gx, gy, GLOW_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Theme ─────────────────────────────────────────────────────────────
    const pColor       = isDark ? "#ffffff" : "#202020";
    const alphaFrontTh = isDark ? ALPHA_FRONT : ALPHA_FRONT * 0.82;

    // ── Physics + project ─────────────────────────────────────────────────
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

      // Perspective project (canonical, pre-displacement)
      const proj   = FOV / (FOV + rz2 + SPHERE_RADIUS);
      const homeSx = cx + rx2 * proj;
      const homeSy = cy + ry2 * proj;

      // Repulsion impulse
      if (cursorActive) {
        const rdx  = (homeSx - cx) - curX;
        const rdy  = (homeSy - cy) - curY;
        const dist = Math.sqrt(rdx * rdx + rdy * rdy);
        if (dist < REPEL_RADIUS && dist > 0.5) {
          const t       = (REPEL_RADIUS - dist) / REPEL_RADIUS;
          const force   = Math.pow(t, REPEL_FALLOFF) * REPEL_STRENGTH;
          const nx      = rdx / dist;
          const ny      = rdy / dist;
          const tx      = -ny * REPEL_SWIRL * t;
          const ty      =  nx * REPEL_SWIRL * t;
          const impulse = force * REPEL_IMPULSE;
          p.vx += (nx + tx) * impulse;
          p.vy += (ny + ty) * impulse;
        }
      }

      // Critically-damped spring return
      p.vx += -SPRING_K * p.dx - SPRING_C * p.vx;
      p.vy += -SPRING_K * p.dy - SPRING_C * p.vy;
      p.dx += p.vx;
      p.dy += p.vy;

      // Displacement clamp
      const dMag = Math.sqrt(p.dx * p.dx + p.dy * p.dy);
      if (dMag > MAX_DISPLACE) {
        const s = MAX_DISPLACE / dMag;
        p.dx *= s; p.dy *= s;
        p.vx *= 0.4; p.vy *= 0.4;
      }

      // Depth
      const zNorm   = (rz2 + SPHERE_RADIUS) / (2 * SPHERE_RADIUS);
      const zCurved = Math.pow(zNorm, DEPTH_POWER);
      const a       = ALPHA_BACK + (alphaFrontTh - ALPHA_BACK) * zCurved;
      const size    = DOT_BACK   + (DOT_FRONT    - DOT_BACK)   * zCurved;

      buf.push({ sx: homeSx + p.dx, sy: homeSy + p.dy, sz: rz2, size, a });
    }

    // Sort back→front
    buf.sort((a, b) => a.sz - b.sz);

    // Render
    ctx.fillStyle = pColor;
    for (const pt of buf) {
      ctx.globalAlpha = pt.a;
      ctx.beginPath();
      ctx.arc(pt.sx, pt.sy, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    rafId.current = requestAnimationFrame(draw);
  }, [isDark]);

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;

    // Initial resize — must run after mount so getBoundingClientRect() has
    // CSS-resolved dimensions (not 0×0 from SSR).
    resize();

    const ro = new ResizeObserver(() => {
      // Invalidate cached rect so next draw frame re-reads it, then update
      // the pixel buffer for the new dimensions.
      cachedRect.current = null;
      resize();
    });
    const canvas = canvasRef.current;
    // Observe the canvas itself — its size changes when .hero-sphere changes,
    // because the canvas has width:100% on its parent chain.
    if (canvas) ro.observe(canvas);

    window.addEventListener("mousemove",          onMouseMove,         { passive: true });
    document.addEventListener("mouseleave",        onDocLeave);
    document.addEventListener("visibilitychange",  onVisibilityChange);

    rafId.current = requestAnimationFrame(draw);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      ro.disconnect();
      window.removeEventListener("mousemove",          onMouseMove);
      document.removeEventListener("mouseleave",        onDocLeave);
      document.removeEventListener("visibilitychange",  onVisibilityChange);
    };
  }, [mounted, draw, resize, onMouseMove, onDocLeave, onVisibilityChange]);

  // ── SSR placeholder ───────────────────────────────────────────────────────
  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        style={{ width: "100%", height: "auto", aspectRatio: "1 / 1", display: "block" }}
      />
    );
  }

  // ── Canvas element ────────────────────────────────────────────────────────
  // width / height attributes are intentionally absent from JSX — they are
  // set imperatively in resize() from getBoundingClientRect().
  // style.width / style.height are "100%" / "auto" so CSS owns visual size.
  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        display:     "block",
        width:       "100%",
        height:      "auto",
        aspectRatio: "1 / 1",
      }}
    />
  );
}
