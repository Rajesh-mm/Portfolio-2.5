"use client";
import { useEffect, useRef } from "react";

/**
 * Premium cursor — production final
 *
 * Dot  (z:9999): 8px accent dot, always visible.
 *   No blend mode — works on every surface: lime buttons, cream cards, dark bg.
 *   Hover: becomes hollow ring (transparent + box-shadow outline).
 *   Theme color from CSS var(--accent); switches via CSS transition.
 *
 * Ring (z:9998): 38px trailing circle.
 *   Lerps at 0.1 factor — smooth lag behind dot.
 *   Stretches directionally on fast movement (velocity squish).
 *   Magnetic pull toward [data-magnetic] elements.
 *   Expands/glows on hover state.
 *
 * States: default → hover → text → click
 * Touch + reduced-motion: cursor hidden, body cursor restored.
 */
export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer:coarse)").matches)          return;
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;

    const dot  = dotRef.current!;
    const ring = ringRef.current!;

    let mx = -400, my = -400;
    let rx = -400, ry = -400;
    let prevMx = -400, prevMy = -400;
    let vx = 0,  vy = 0;
    let magEl: Element | null = null;
    let hidden = false;
    let state  = "default";
    let raf: number;

    const LERP       = 0.095;  // ring lag
    const VEL_DECAY  = 0.76;   // velocity smoothing
    const MAX_STRETCH = 0.36;  // max stretch ratio
    const MAG_PULL   = 0.32;   // magnetic pull (0 = none, 1 = snap)

    /* ── Position ─────────────────────────────────────────── */
    function onMove(e: MouseEvent) {
      prevMx = mx; prevMy = my;
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      magEl = (e.target as HTMLElement).closest("[data-magnetic]");
    }

    /* ── RAF: ring lerp + stretch + magnetic ─────────────── */
    function tick() {
      vx = vx * VEL_DECAY + (mx - prevMx) * (1 - VEL_DECAY);
      vy = vy * VEL_DECAY + (my - prevMy) * (1 - VEL_DECAY);
      prevMx = mx; prevMy = my;

      const speed = Math.sqrt(vx * vx + vy * vy);

      // Magnetic target
      let tx = mx, ty = my;
      if (magEl) {
        const r = magEl.getBoundingClientRect();
        tx = mx + (r.left + r.width  / 2 - mx) * MAG_PULL;
        ty = my + (r.top  + r.height / 2 - my) * MAG_PULL;
      }

      rx += (tx - rx) * LERP;
      ry += (ty - ry) * LERP;

      // Directional stretch
      let sx = 1, sy = 1, angle = 0;
      if (speed > 1.5 && !hidden) {
        const s = Math.min(speed * 0.032, MAX_STRETCH);
        sx = 1 + s; sy = 1 - s * 0.42;
        angle = Math.atan2(vy, vx) * (180 / Math.PI);
      }

      ring.style.transform =
        `translate(${rx}px,${ry}px) translate(-50%,-50%) ` +
        `rotate(${angle}deg) scaleX(${sx}) scaleY(${sy})`;

      raf = requestAnimationFrame(tick);
    }

    /* ── State machine ────────────────────────────────────── */
    const DOT_C  = ["cursor--hover","cursor--text","cursor--click"];
    const RING_C = ["cursor-ring--hover","cursor-ring--text"];

    function setState(next: string) {
      if (next === state) return;
      state = next;
      dot.classList.remove(...DOT_C);
      ring.classList.remove(...RING_C);
      if (next === "hover") {
        dot.classList.add("cursor--hover");
        ring.classList.add("cursor-ring--hover");
      } else if (next === "text") {
        dot.classList.add("cursor--text");
        ring.classList.add("cursor-ring--text");
      }
    }

    function onOver(e: MouseEvent) {
      const t = e.target as HTMLElement;
      if (t.closest("[data-cursor='text']"))                        { setState("text");  return; }
      if (t.closest("a,button,[data-hover],input,select,textarea")) { setState("hover"); return; }
      setState("default");
    }

    const onDown  = () => dot.classList.add("cursor--click");
    const onUp    = () => dot.classList.remove("cursor--click");
    const onLeave = () => { hidden = true;  dot.classList.add("cursor--hidden");    ring.classList.add("cursor--hidden"); };
    const onEnter = () => { hidden = false; dot.classList.remove("cursor--hidden"); ring.classList.remove("cursor--hidden"); };

    document.addEventListener("mousemove",  onMove,  { passive:true });
    document.addEventListener("mouseover",  onOver,  { passive:true });
    document.addEventListener("mousedown",  onDown);
    document.addEventListener("mouseup",    onUp);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onEnter);
    raf = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener("mousemove",  onMove);
      document.removeEventListener("mouseover",  onOver);
      document.removeEventListener("mousedown",  onDown);
      document.removeEventListener("mouseup",    onUp);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onEnter);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  className="cursor"      aria-hidden="true" style={{ pointerEvents:"none" }} />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true" style={{ pointerEvents:"none" }} />
    </>
  );
}
