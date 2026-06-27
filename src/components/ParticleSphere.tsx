"use client";

/**
 * src/components/ParticleSphere.tsx
 *
 * Premium interactive particle sphere for the hero section.
 *
 * Changes from v1 → v2:
 *  - Repulsion radius enlarged, force multiplier tripled, evaluated against
 *    canonical (pre-displacement) screen position to fix feedback drift
 *  - isHovering gate removed — repulsion active whenever cursor is tracked
 *    near the canvas (fixes the mouseenter/leave timing gap)
 *  - RETURN_LERP increased 0.055 → 0.08 for snappier return after repulsion
 *  - Depth mapped through power curve (zNorm^1.6) for perceptual steepening
 *  - DOT_BASE/DOT_SCALE widened for 3:1 front-to-back size ratio
 *  - ALPHA_BACK lowered to 0.08 for near-invisible back hemisphere
 *  - Scroll: scale → 0.18, opacity starts fading earlier, X drift → -110%
 *  - Spring stiffer (stiffness 140) so scroll changes read immediately
 *  - Wrapper paddingRight added to inset sphere from viewport right edge
 *  - Ambient glow intensity doubled
 */

import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";

// ─── Tuneable constants ───────────────────────────────────────────────────────

const PARTICLE_COUNT  = 880;
const SPHERE_RADIUS   = 165;

// Rotation
const ROTATION_SPEED  = 0.0016; // radians per frame at 60 fps

// Repulsion — evaluated against canonical home projection, not displaced pos
const REPEL_RADIUS = 180;    // px — enlarged from 115 for easier triggering
const REPEL_STRENGTH = 1.8;   // force scalar — was 0.38, now ~3× stronger
const REPEL_IMPULSE  = 24;    // px² multiplier — was 13
const RETURN_LERP     = 0.08;   // spring-back per frame — was 0.055, faster now
const MAX_DISPLACE    = SPHERE_RADIUS * 0.65; // px clamp on displacement

// Depth perception — power-curved for perceptual punch
const DEPTH_POWER     = 1.6;    // exponent applied to linear zNorm
const DOT_BASE        = 0.9;    // back-hemisphere dot radius (px)
const DOT_FRONT       = 2.8;    // front-hemisphere dot radius (px) — was 1.8
const ALPHA_FRONT     = 0.95;   // front alpha
const ALPHA_BACK      = 0.07;   // back alpha — was 0.20, now near-invisible

// Camera
const TILT_X          = 0.18;   // fixed X-axis tilt (radians)
const FOV             = 520;

// ─── Particle type ────────────────────────────────────────────────────────────

interface Pt {
  hx: number; hy: number; hz: number; // canonical home on sphere surface
  dx: number; dy: number;             // screen-space displacement (repel/return)
}

// ─── Fibonacci sphere factory ─────────────────────────────────────────────────

function makeSphere(n: number): Pt[] {
  const pts: Pt[]   = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y  = 1 - (i / (n - 1)) * 2;
    const r  = Math.sqrt(Math.max(0, 1 - y * y));
    const th = goldenAngle * i;
    pts.push({
      hx: Math.cos(th) * r * SPHERE_RADIUS,
      hy: y                * SPHERE_RADIUS,
      hz: Math.sin(th) * r * SPHERE_RADIUS,
      dx: 0,
      dy: 0,
    });
  }
  return pts;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ParticleSphere() {
  const wrapperRef    = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const pts           = useRef<Pt[]>(makeSphere(PARTICLE_COUNT));
  const rotY          = useRef(0);
  const rafId         = useRef<number | null>(null);
  // Cursor position in canvas-centre space. Initialised far away so no
  // accidental repulsion fires before the first real mousemove.
  const cursorLocal   = useRef({ x: -9999, y: -9999 });
  const reducedMotion = useRef(false);
  const [mounted, setMounted] = useState(false);

  // ── Scroll-driven transform ───────────────────────────────────────────────
  // offset: hero top → hero bottom crossing viewport top edge

  const { scrollYProgress } = useScroll({
    target:  wrapperRef,
    offset:  ["start start", "end start"],
  });

  //  Scroll progress → visual values
  //  Scale:   1.0 → 0.18  (much stronger reduction than v1's 0.35)
  //  Opacity: fast fade — fully gone by 55% scroll (was 100%)
  //  X:       drifts 110% left (was 72%)
const rawScale = useTransform(
  scrollYProgress,
  [0, 0.35, 0.7, 1],
  [1, 0.9, 0.65, 0.45]
);

const rawOpacity = useTransform(
  scrollYProgress,
  [0, 0.5, 1],
  [1, 0.8, 0.25]
);

const rawX = useTransform(
  scrollYProgress,
  [0, 0.35, 0.7, 1],
  ["0%", "-10%", "-30%", "-45%"]
);

  // Stiffer spring: stiffness 140 (was 72) so scroll changes read immediately
  // rather than lagging behind user intent.
  const springCfg = { stiffness: 140, damping: 28, mass: 0.6 };
  const scale     = useSpring(rawScale,   springCfg);
  const opacity   = useSpring(rawOpacity, springCfg);

  // ── Mount ────────────────────────────────────────────────────────────────
  useEffect(() => {
    reducedMotion.current =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMounted(true);
  }, []);

  // ── Canvas DPI resize ────────────────────────────────────────────────────
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    const size   = Math.min(parent?.clientWidth ?? 480, 480);
    const dpr    = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width  = `${size}px`;
    canvas.style.height = `${size}px`;
  }, []);

  // ── Pointer tracking ─────────────────────────────────────────────────────
  // mousemove on window (broad capture) — converts to canvas-centre coords.
  // When cursor leaves viewport, reset to far-away sentinel value so the
  // repulsion radius check naturally returns false with no extra isHovering gate.

  const onMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    cursorLocal.current = {
      x: e.clientX - rect.left  - rect.width  / 2,
      y: e.clientY - rect.top   - rect.height / 2,
    };
  }, []);

  const onMouseLeave = useCallback(() => {
    // Reset cursor so repulsion stops when mouse leaves the document
    cursorLocal.current = { x: -9999, y: -9999 };
  }, []);

  // ── Render loop ──────────────────────────────────────────────────────────
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

    const spd = reducedMotion.current ? ROTATION_SPEED * 0.35 : ROTATION_SPEED;
    rotY.current += spd;

    const cosY = Math.cos(rotY.current);
    const sinY = Math.sin(rotY.current);
    const cosX = Math.cos(TILT_X);
    const sinX = Math.sin(TILT_X);

    const curX = cursorLocal.current.x;
    const curY = cursorLocal.current.y;
    // Repulsion is active when cursor is tracked (not at sentinel position)
    const cursorActive = curX > -9000 && !reducedMotion.current;

    // ── Project + physics ────────────────────────────────────────────────
    const buf: Array<{ sx: number; sy: number; sz: number; size: number; a: number }> = [];

    for (const p of pts.current) {
      // ── Rotate Y ──
      const rx1 =  p.hx * cosY + p.hz * sinY;
      const ry1 =  p.hy;
      const rz1 = -p.hx * sinY + p.hz * cosY;

      // ── Rotate X (fixed tilt) ──
      const rx2 = rx1;
      const ry2 = ry1 * cosX - rz1 * sinX;
      const rz2 = ry1 * sinX + rz1 * cosX;

      // ── Perspective project (canonical position — before displacement) ──
      const proj  = FOV / (FOV + rz2 + SPHERE_RADIUS);
      const homeSx = cx + rx2 * proj;   // screen X of undisplaced particle
      const homeSy = cy + ry2 * proj;   // screen Y of undisplaced particle

      // ── Cursor repulsion ─────────────────────────────────────────────────
      // KEY FIX: measure distance from CANONICAL screen position (homeSx/homeSy),
      // not the already-displaced position. This prevents the feedback drift that
      // made repulsion feel jittery and inaccurate in v1.
      if (cursorActive) {
        const dx   = homeSx - cx - curX;  // delta from cursor in canvas-centre space
        const dy   = homeSy - cy - curY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < REPEL_RADIUS && dist > 0.5) {
          // Quadratic falloff: full force at centre, zero at radius edge
          const t     = (REPEL_RADIUS - dist) / REPEL_RADIUS;
          const force = t * t * REPEL_STRENGTH;
          p.dx += (dx / dist) * force * REPEL_IMPULSE;
          p.dy += (dy / dist) * force * REPEL_IMPULSE;
        }
      }

      // ── Spring return ────────────────────────────────────────────────────
      p.dx *= (1 - RETURN_LERP);
      p.dy *= (1 - RETURN_LERP);

      // Hard displacement clamp — prevents particles from flying off entirely
      if (p.dx >  MAX_DISPLACE) p.dx =  MAX_DISPLACE;
      if (p.dx < -MAX_DISPLACE) p.dx = -MAX_DISPLACE;
      if (p.dy >  MAX_DISPLACE) p.dy =  MAX_DISPLACE;
      if (p.dy < -MAX_DISPLACE) p.dy = -MAX_DISPLACE;

      // ── Depth cue ────────────────────────────────────────────────────────
      // zNorm ∈ [0,1]: 0 = back hemisphere, 1 = front hemisphere
      const zNorm   = (rz2 + SPHERE_RADIUS) / (2 * SPHERE_RADIUS);
      // Power curve steepens the midtone — back hemisphere drops off fast,
      // front hemisphere pops. Exponent 1.6 is the perceptual sweet spot.
      const zCurved = Math.pow(zNorm, DEPTH_POWER);

      const a    = ALPHA_BACK + (ALPHA_FRONT - ALPHA_BACK) * zCurved;
      const size = DOT_BASE   + (DOT_FRONT   - DOT_BASE)   * zCurved;

      // Final screen position = canonical projection + displacement
      buf.push({
        sx:   homeSx + p.dx,
        sy:   homeSy + p.dy,
        sz:   rz2,
        size,
        a,
      });
    }

    // ── Sort back→front (painter's algorithm) ────────────────────────────
    buf.sort((a, b) => a.sz - b.sz);

    // ── Draw ─────────────────────────────────────────────────────────────
    // Particle glow
    ctx.shadowBlur = 18;
    ctx.shadowColor = "rgba(255,255,255,0.28)";

    const isLight = 
      document.documentElement.getAttribute("data-theme") === "light";
    
    ctx.fillStyle = isLight ? "#111111" : "#ffffff";
    
    for (const pt of buf) {
      ctx.globalAlpha = pt.a;
      ctx.beginPath();
      ctx.arc(pt.sx, pt.sy, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    rafId.current = requestAnimationFrame(draw);
  }, []);

  // ── Lifecycle ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mounted) return;

    resize();

    const ro     = new ResizeObserver(resize);
    const canvas = canvasRef.current;
    if (canvas?.parentElement) ro.observe(canvas.parentElement);

    window.addEventListener("mousemove",  onMouseMove,  { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);

    rafId.current = requestAnimationFrame(draw);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      ro.disconnect();
      window.removeEventListener("mousemove",  onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [mounted, draw, resize, onMouseMove, onMouseLeave]);

  // ── SSR placeholder ──────────────────────────────────────────────────────
  if (!mounted) {
    return (
      <div
        ref={wrapperRef}
        aria-hidden="true"
        style={{ width: "100%", maxWidth: 480, aspectRatio: "1 / 1" }}
      />
    );
  }

  return (
    <motion.div
      ref={wrapperRef}
      aria-hidden="true"
      style={{
        scale,
        opacity,
        x:               rawX,
        transformOrigin: "center center",
        willChange:      "transform, opacity",
        // Inset from right edge — requirement 5
        paddingRight:    "6%",
        position:        "relative",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        width:           "100%",
        maxWidth:        520,
      }}
    >
      {/* Ambient glow — doubled intensity from v1 */}
      <div
        aria-hidden="true"
        style={{
          position:      "absolute",
          inset:         "10%",
          borderRadius:  "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 45%, transparent 70%)",
          pointerEvents: "none",
          zIndex:        0,
        }}
      />

      <canvas
        ref={canvasRef}
        style={{
          display:     "block",
          width:       "100%",
          aspectRatio: "1 / 1",
          position:    "relative",
          zIndex:      1,
        }}
      />
    </motion.div>
  );
}
