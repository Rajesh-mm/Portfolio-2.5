"use client";

/**
 * src/components/ParticleSphere.tsx  ─ V4
 *
 * Pure canvas particle sphere. Owns ONLY:
 *   - 3-D rotation, depth, painter's-sort
 *   - Cursor repulsion with a single critically-damped spring per particle
 *     (replaces the old two-stage lerp+spring model, which fought itself
 *     and produced a jittery, overshooting return — see inline notes below)
 *   - Cursor proximity glow drawn under particles, theme-aware intensity
 *   - Theme-aware colour: white / brighter in dark mode, #202020 charcoal
 *     with reduced alpha in light mode — deliberately lower-contrast, not
 *     just an inverted colour of the same intensity
 *   - Cached getBoundingClientRect (updated on resize only)
 *   - RAF paused when document is hidden (battery / perf)
 *   - prefers-reduced-motion respected
 *
 * NO scroll logic. NO self-positioning. NO layout impact.
 * HeroSphere.tsx owns all positioning, sizing (via CSS) and scroll transforms.
 */

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

// Particle density — reduced for tablet to keep 60 fps
const COUNT_DESKTOP = 1000;
const COUNT_TABLET  =  520;

// Sphere geometry
const SPHERE_RADIUS  = 220;   // canvas-space units
                               // Canvas will be 600-720px wide via CSS
                               // so SPHERE_RADIUS / canvas_logical_px ≈ 0.37
                               // giving ~44% fill — sphere looks substantial

// Rotation
const ROTATION_SPEED = 0.0013; // rad / frame at 60 fps

// Repulsion — evaluated on canonical (pre-displacement) positions.
//
// Physics model: single critically-damped spring per particle.
//   a = -SPRING_K * displacement - SPRING_C * velocity
//   v += a; d += v
// This replaces the old two-stage model (separate exponential lerp decay
// layered on top of a velocity spring), which caused the spring force to
// fight the incoming impulse on the same frame — net effect was a damped
// oscillation that overshot past zero and read as jittery rather than
// elegant. A single critically-damped spring (c ≈ 2*sqrt(k)) gives a clean,
// visible push that settles back to home with no overshoot — the
// Apple-Vision-Pro / Linear feel this needs.
const REPEL_RADIUS   = 190;    // px, canvas-local — enlarged so the push
                                // is noticeable before the cursor is right
                                // on top of a particle
const REPEL_STRENGTH = 2.3;    // radial force scalar — tuned for a clearly
                                // visible but non-explosive peak displacement
const REPEL_SWIRL    = 0.35;   // tangential component — subtle fluid drift,
                                // dialled back from 0.45 so the push still
                                // reads primarily as "away from cursor"
const REPEL_FALLOFF  = 1.6;    // power exponent on normalised distance —
                                // gentler falloff than before so particles
                                // beyond the very centre still respond
const REPEL_IMPULSE  = 7.5;    // velocity added per frame at full strength
const SPRING_K        = 0.06;  // spring stiffness — pulls displacement to 0
const SPRING_C         = 0.50; // damping — critically damped (2*sqrt(K) ≈ 0.49),
                                // so particles return smoothly with no bounce
const MAX_DISPLACE   = SPHERE_RADIUS * 0.42;

// Depth mapping
const DEPTH_POWER    = 1.8;   // exponent on linear zNorm → steeper front pop
const DOT_BACK       = 0.6;   // px radius — back hemisphere
const DOT_FRONT      = 2.8;   // px radius — front hemisphere
const ALPHA_BACK     = 0.05;  // near-invisible back
const ALPHA_FRONT    = 0.94;

// Cursor glow (drawn on canvas, under particles)
const GLOW_RADIUS    = 180;   // px canvas-local
const GLOW_PEAK      = 0.22;  // centre alpha
const GLOW_MID       = 0.09;  // 40% stop alpha

// Camera
const TILT_X = 0.14;  // gentle forward-tilt so both poles visible
const FOV    = 540;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Pt {
  hx: number; hy: number; hz: number; // home position on sphere
  dx: number; dy: number;             // screen displacement
  vx: number; vy: number;             // velocity (for underdamped spring)
}

export interface ParticleSphereProps {
  isDark?: boolean;
}

// ─── Fibonacci sphere ─────────────────────────────────────────────────────────

function makeSphere(n: number): Pt[] {
  const pts: Pt[] = [];
  const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle
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
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const pts            = useRef<Pt[]>(makeSphere(COUNT_DESKTOP));
  const rotY           = useRef(0);
  const rafId          = useRef<number | null>(null);
  const paused         = useRef(false);

  // Viewport cursor coords — converted to canvas-local in draw() each frame
  const cursorVP       = useRef({ x: -9999, y: -9999 });

  // Cached canvas rect — updated on resize only, not per frame
  const cachedRect     = useRef<DOMRect | null>(null);

  const reducedMotion  = useRef(false);
  const [mounted, setMounted] = useState(false);

  // ── Mount ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    reducedMotion.current =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    if (isTablet) pts.current = makeSphere(COUNT_TABLET);

    setMounted(true);
  }, []);

  // ── Resize — also caches rect ──────────────────────────────────────────────
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const size   = parent?.clientWidth ?? 600;
    const dpr    = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width        = size * dpr;
    canvas.height       = size * dpr;
    canvas.style.width  = `${size}px`;
    canvas.style.height = `${size}px`;

    // Invalidate rect cache — will be recalculated next draw frame
    cachedRect.current = null;
  }, []);

  // ── Pointer tracking ───────────────────────────────────────────────────────
  const onMouseMove = useCallback((e: MouseEvent) => {
    cursorVP.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onDocLeave = useCallback(() => {
    cursorVP.current = { x: -9999, y: -9999 };
  }, []);

  // ── Tab visibility — pause / resume RAF ───────────────────────────────────
  const onVisibilityChange = useCallback(() => {
    paused.current = document.hidden;
  }, []);

  // ── Draw ───────────────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    if (paused.current) {
      rafId.current = requestAnimationFrame(draw);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) { rafId.current = requestAnimationFrame(draw); return; }
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx)  { rafId.current = requestAnimationFrame(draw); return; }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W   = canvas.width  / dpr;
    const H   = canvas.height / dpr;
    const cx  = W / 2;
    const cy  = H / 2;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // ── Canvas rect (cached) ── refresh if invalidated
    if (!cachedRect.current) {
      cachedRect.current = canvas.getBoundingClientRect();
    }
    const rect = cachedRect.current;

    // ── Cursor → canvas-local coords ─────────────────────────────────────
    // rect.width reflects CSS scale (e.g. scroll-driven scale).
    // Correct by the ratio of logical size to rendered size.
    const scaleCorrectX = W / rect.width;
    const scaleCorrectY = H / rect.height;
    const vx = cursorVP.current.x;
    const vy = cursorVP.current.y;
    const curX = (vx - rect.left - rect.width  / 2) * scaleCorrectX;
    const curY = (vy - rect.top  - rect.height / 2) * scaleCorrectY;
    const cursorActive = vx > -9000 && !reducedMotion.current;

    // ── Rotation ──────────────────────────────────────────────────────────
    const spd = reducedMotion.current ? ROTATION_SPEED * 0.25 : ROTATION_SPEED;
    rotY.current += spd;

    const cosY = Math.cos(rotY.current);
    const sinY = Math.sin(rotY.current);
    const cosX = Math.cos(TILT_X);
    const sinX = Math.sin(TILT_X);

    // ── Cursor glow — drawn before particles ─────────────────────────────
    if (cursorActive) {
      const gx   = cx + curX;
      const gy   = cy + curY;
      // Theme-aware glow colour + intensity.
      // Dark theme: bright white glow, higher peak alpha — reads as a
      // luminous bloom against the dark background.
      // Light theme: soft dark-charcoal glow, lower peak alpha — a glow
      // that's too strong in light mode looks like a smudge rather than
      // light, so intensity is deliberately reduced here, not just colour.
      const r = isDark ? 255 : 32;
      const g = isDark ? 255 : 32;
      const b = isDark ? 255 : 32;
      const peak = isDark ? GLOW_PEAK : GLOW_PEAK * 0.55;
      const mid  = isDark ? GLOW_MID  : GLOW_MID  * 0.55;
      const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, GLOW_RADIUS);
      grad.addColorStop(0,   `rgba(${r},${g},${b},${peak})`);
      grad.addColorStop(0.4, `rgba(${r},${g},${b},${mid})`);
      grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(gx, gy, GLOW_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Particle colour + theme-aware brightness ──────────────────────────
    // Dark mode: white particles, slightly higher front-alpha — sphere
    // reads as a bright, energetic object against the dark background.
    // Light mode: #202020 charcoal (per spec range #202020–#2A2A2A), with
    // front-alpha pulled down — this is what makes light mode feel like a
    // genuinely softer, lower-contrast object rather than just an inverted
    // colour of the same intensity.
    const pColor      = isDark ? "#ffffff" : "#202020";
    const alphaFrontTh = isDark ? ALPHA_FRONT : ALPHA_FRONT * 0.82;

    // ── Physics + project ─────────────────────────────────────────────────
    const buf: Array<{
      sx: number; sy: number; sz: number; size: number; a: number;
    }> = [];

    for (const p of pts.current) {
      // Rotate Y
      const rx1 =  p.hx * cosY + p.hz * sinY;
      const ry1 =  p.hy;
      const rz1 = -p.hx * sinY + p.hz * cosY;

      // Rotate X
      const rx2 = rx1;
      const ry2 = ry1 * cosX - rz1 * sinX;
      const rz2 = ry1 * sinX + rz1 * cosX;

      // Perspective project — canonical (pre-displacement) position
      const proj   = FOV / (FOV + rz2 + SPHERE_RADIUS);
      const homeSx = cx + rx2 * proj;
      const homeSy = cy + ry2 * proj;

      // ── Repulsion impulse + tangential swirl ────────────────────────
      // Adds velocity (not displacement directly) — the spring above
      // converts that velocity into a smooth, single-stage motion.
      if (cursorActive) {
        const rdx  = (homeSx - cx) - curX;
        const rdy  = (homeSy - cy) - curY;
        const dist = Math.sqrt(rdx * rdx + rdy * rdy);

        if (dist < REPEL_RADIUS && dist > 0.5) {
          const t     = (REPEL_RADIUS - dist) / REPEL_RADIUS;
          const force = Math.pow(t, REPEL_FALLOFF) * REPEL_STRENGTH;

          // Radial push (away from cursor)
          const nx = rdx / dist;
          const ny = rdy / dist;

          // Tangential component — perpendicular to radial, creates swirl
          // Rotate 90° → (-ny, nx). Scale by REPEL_SWIRL * t for smooth falloff.
          const tx = -ny * REPEL_SWIRL * t;
          const ty =  nx * REPEL_SWIRL * t;

          const impulse = force * REPEL_IMPULSE;
          p.vx += (nx + tx) * impulse;
          p.vy += (ny + ty) * impulse;
        }
      }

      // ── Velocity-based critically-damped spring return ─────────────────
      // Single mechanism: a = -k*displacement - c*velocity, applied every
      // frame regardless of whether a repulsion impulse was just added.
      // This is what makes the return feel like one continuous motion
      // (push → smooth glide home) instead of two competing decays.
      const ax = -SPRING_K * p.dx - SPRING_C * p.vx;
      const ay = -SPRING_K * p.dy - SPRING_C * p.vy;
      p.vx += ax;
      p.vy += ay;
      p.dx += p.vx;
      p.dy += p.vy;

      // Clamp displacement magnitude — safety ceiling, rarely hit with the
      // critically-damped model above but kept as a guard against any
      // pathological cursor movement (e.g. very fast mouse teleport).
      const dMag = Math.sqrt(p.dx * p.dx + p.dy * p.dy);
      if (dMag > MAX_DISPLACE) {
        const clampScale = MAX_DISPLACE / dMag;
        p.dx *= clampScale;
        p.dy *= clampScale;
        p.vx *= 0.4;
        p.vy *= 0.4;
      }

      // ── Depth ────────────────────────────────────────────────────────
      const zNorm   = (rz2 + SPHERE_RADIUS) / (2 * SPHERE_RADIUS); // [0, 1]
      const zCurved = Math.pow(zNorm, DEPTH_POWER);
      const a       = ALPHA_BACK  + (alphaFrontTh - ALPHA_BACK)  * zCurved;
      const size    = DOT_BACK    + (DOT_FRONT   - DOT_BACK)    * zCurved;

      buf.push({
        sx:   homeSx + p.dx,
        sy:   homeSy + p.dy,
        sz:   rz2,
        size,
        a,
      });
    }

    // ── Sort back→front ───────────────────────────────────────────────────
    buf.sort((a, b) => a.sz - b.sz);

    // ── Render ────────────────────────────────────────────────────────────
    ctx.fillStyle = pColor;
    for (const pt of buf) {
      ctx.globalAlpha = pt.a;
      ctx.beginPath();
      ctx.arc(pt.sx, pt.sy, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    rafId.current = requestAnimationFrame(draw);
  // isDark in dep array: causes RAF loop to restart with new colour when theme changes
  }, [isDark]);

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;

    resize();

    const ro = new ResizeObserver(() => {
      cachedRect.current = null; // invalidate rect cache
      resize();
    });
    if (canvasRef.current?.parentElement) {
      ro.observe(canvasRef.current.parentElement);
    }

    window.addEventListener("mousemove",            onMouseMove,         { passive: true });
    document.addEventListener("mouseleave",          onDocLeave);
    document.addEventListener("visibilitychange",    onVisibilityChange);

    rafId.current = requestAnimationFrame(draw);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      ro.disconnect();
      window.removeEventListener("mousemove",           onMouseMove);
      document.removeEventListener("mouseleave",         onDocLeave);
      document.removeEventListener("visibilitychange",   onVisibilityChange);
    };
  }, [mounted, draw, resize, onMouseMove, onDocLeave, onVisibilityChange]);

  // ── SSR placeholder ───────────────────────────────────────────────────────
  if (!mounted) {
    return (
      <div aria-hidden="true" style={{ width: "100%", aspectRatio: "1 / 1" }} />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ display: "block", width: "100%", aspectRatio: "1 / 1" }}
    />
  );
}
