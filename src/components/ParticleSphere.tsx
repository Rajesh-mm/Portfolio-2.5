"use client";

import { useRef, useEffect, useCallback } from "react";

interface Props {
  /** Radius of sphere in pixels */
  radius?: number;
  /** Number of particles */
  count?: number;
  /** Rotation speed (radians/frame) */
  speed?: number;
  /** Mouse repel radius in px */
  repelRadius?: number;
  /** Theme: 'dark' | 'light' */
  theme?: string;
}

/**
 * ParticleSphere — canvas-based interactive sphere
 *
 * Architecture:
 *  • Fibonacci sphere algorithm for even particle distribution
 *  • Y-axis auto-rotation with spring-damped cursor tilt
 *  • Cursor repulsion: particles within repelRadius spring away then return
 *  • Perspective projection for depth (near = larger + brighter)
 *  • Scroll-driven: container moves left + fades via CSS transform
 *  • Single rAF loop — GPU-composited canvas
 *  • Skips on prefers-reduced-motion
 */
export default function ParticleSphere({
  radius   = 200,
  count    = 420,
  speed    = 0.0018,
  repelRadius = 110,
  theme    = "dark",
}: Props) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const wrapRef      = useRef<HTMLDivElement>(null);
  const mouseRef     = useRef({ x: -9999, y: -9999 });
  const scrollRef    = useRef(0);

  const buildSphere = useCallback(() => {
    const golden = (1 + Math.sqrt(5)) / 2;
    return Array.from({ length: count }, (_, i) => {
      const theta = Math.acos(1 - 2 * (i + 0.5) / count);
      const phi   = 2 * Math.PI * i / golden;
      return {
        ox: Math.sin(theta) * Math.cos(phi) * radius,
        oy: Math.sin(theta) * Math.sin(phi) * radius,
        oz: Math.cos(theta) * radius,
        // Current (may be displaced by repulsion)
        dx: 0, dy: 0, dz: 0, // displacement
        vdx: 0, vdy: 0, vdz: 0, // velocity of displacement
      };
    });
  }, [count, radius]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    if (reduced) return;

    const canvas = canvasRef.current!;
    const wrap   = wrapRef.current!;
    const ctx    = canvas.getContext("2d")!;
    const pts    = buildSphere();

    let angle    = 0;
    let tiltX    = 0, tiltY = 0; // cursor tilt (spring)
    let vtiltX   = 0, vtiltY = 0;
    let raf: number;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w   = wrap.offsetWidth;
      const h   = wrap.offsetHeight;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width  = w + "px";
      canvas.style.height = h + "px";
      ctx.scale(dpr, dpr);
    }

    function onMouseMove(e: MouseEvent) {
      const rect = wrap.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left - wrap.offsetWidth  / 2,
        y: e.clientY - rect.top  - wrap.offsetHeight / 2,
      };
    }
    function onMouseLeave() { mouseRef.current = { x: -9999, y: -9999 }; }
    function onScroll() { scrollRef.current = window.scrollY; }

    function draw() {
      const W = wrap.offsetWidth;
      const H = wrap.offsetHeight;
      const cx = W / 2;
      const cy = H / 2;
      const mouse = mouseRef.current;
      const scroll = scrollRef.current;

      ctx.clearRect(0, 0, W, H);

      // Scroll-driven parallax on the wrapper (CSS transform)
      const heroH   = window.innerHeight;
      const progress = Math.min(scroll / (heroH * 0.85), 1);
      wrap.style.transform  = `translateX(${-progress * 40}%) scale(${1 - progress * 0.18})`;
      wrap.style.opacity    = String(1 - progress * 0.55);

      // Cursor tilt (spring toward mouse)
      const targetTX = mouse.x / (W * 0.5) * 0.12;
      const targetTY = mouse.y / (H * 0.5) * 0.10;
      vtiltX += (targetTX - tiltX) * 0.04; vtiltX *= 0.82;
      vtiltY += (targetTY - tiltY) * 0.04; vtiltY *= 0.82;
      tiltX += vtiltX; tiltY += vtiltY;

      angle += speed;

      // Pre-compute rotation matrices (Y-axis + slight X from tilt)
      const cosA = Math.cos(angle + tiltX);
      const sinA = Math.sin(angle + tiltX);
      const cosT = Math.cos(tiltY);
      const sinT = Math.sin(tiltY);

      // Particle list with projected coords for depth sorting
      const isDark  = theme !== "light";
      const baseAlpha = isDark ? 0.75 : 0.55;

      const projected = pts.map(p => {
        // Spring repulsion: particles spring away from cursor
        const wx = p.ox + p.dx;
        const wy = p.oy + p.dy;
        const wz = p.oz + p.dz;

        // Project to screen (before repulsion check — use original pos)
        // Y-axis rotation
        const rx = wx * cosA + wz * sinA;
        const ry = wy;
        const rz = -wx * sinA + wz * cosA;
        // X-axis tilt
        const fx = rx;
        const fy = ry * cosT - rz * sinT;
        const fz = ry * sinT + rz * cosT;

        // Perspective
        const persp = 700;
        const scale  = persp / (persp - fz * 0.6);
        const px = cx + fx * scale;
        const py = cy + fy * scale;

        // Cursor repulsion on 2D screen space
        const dx2d = px - (cx + mouse.x);
        const dy2d = py - (cy + mouse.y);
        const dist = Math.sqrt(dx2d * dx2d + dy2d * dy2d);

        if (dist < repelRadius && dist > 1) {
          const force  = (1 - dist / repelRadius) * 28;
          const nx = dx2d / dist;
          const ny = dy2d / dist;
          p.vdx += nx * force * 0.18;
          p.vdy += ny * force * 0.18;
        }
        // Spring back to origin
        p.vdx += -p.dx * 0.06; p.vdx *= 0.78;
        p.vdy += -p.dy * 0.06; p.vdy *= 0.78;
        p.vdz += -p.dz * 0.06; p.vdz *= 0.78;
        p.dx += p.vdx; p.dy += p.vdy; p.dz += p.vdz;

        // Depth-based alpha and size
        const depthFactor = (fz + radius) / (radius * 2); // 0 (back) → 1 (front)
        const alpha = baseAlpha * (0.25 + depthFactor * 0.75);
        const dotR  = 0.8 + depthFactor * 0.9;

        return { px, py, alpha, dotR, depth: fz };
      });

      // Sort by depth (back to front for proper overlap)
      projected.sort((a, b) => a.depth - b.depth);

      const dotColor = isDark ? "247,245,242" : "13,13,13";
      for (const p of projected) {
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.dotR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dotColor},${p.alpha.toFixed(3)})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize",    resize,       { passive: true });
    wrap.addEventListener("mousemove",   onMouseMove,  { passive: true });
    wrap.addEventListener("mouseleave",  onMouseLeave);
    window.addEventListener("scroll",    onScroll,     { passive: true });
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",   resize);
      wrap.removeEventListener("mousemove",  onMouseMove);
      wrap.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll",   onScroll);
    };
  }, [buildSphere, speed, repelRadius, radius, theme]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      style={{
        position: "absolute",
        right:  "clamp(-4rem, -2vw, 0rem)",
        top:    "50%",
        transform: "translateY(-50%)",
        width:  "clamp(320px, 42vw, 560px)",
        height: "clamp(320px, 42vw, 560px)",
        pointerEvents: "none",
        zIndex: 2,
        willChange: "transform, opacity",
        transition: "none", // JS handles this
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display:"block", width:"100%", height:"100%" }}
      />
    </div>
  );
}
