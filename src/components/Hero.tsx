"use client";

import { useRef, useEffect, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import ParticleSphere from "./ParticleSphere";

const SKILLS = [
  "User Research","Wireframing","Prototyping","Usability Testing","Interaction Design",
  "Information Architecture","Design Systems","Figma","FigJam","Developer Handoff",
  "Agile","WCAG","B2B Enterprise","E-commerce","AI Interfaces","Component Architecture",
];

// Deterministic dots — stable SSR/CSR, no hydration mismatch
const DOTS = Array.from({ length: 150 }, (_, i) => ({
  id:i, x:(i*73)%97, y:(i*53+17)%97,
  op:0.05+(i%5)*0.022, sz:i%4===0 ? 2 : 1.5,
}));

const EXPO:[number,number,number,number] = [0.16,1,0.3,1];

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  // Tuned springs — responsive but calm
  const sx = useSpring(mx, { stiffness:42, damping:20, mass:1.0 });
  const sy = useSpring(my, { stiffness:42, damping:20, mass:1.0 });

  // Three parallax depth layers
  const g1x = useTransform(sx, [-1,1], [-9,9]);
  const g1y = useTransform(sy, [-1,1], [-6,6]);
  const g2x = useTransform(sx, [-1,1], [-18,18]);
  const g2y = useTransform(sy, [-1,1], [-12,12]);
  const glX = useTransform(sx, [-1,1], [-28,28]);
  const glY = useTransform(sy, [-1,1], [-18,18]);
  const tX  = useTransform(sx, [-1,1], [-3.5,3.5]);
  const tY  = useTransform(sy, [-1,1], [-2.5,2.5]);

  const onMove = useCallback((e: MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(((e.clientX - r.left) / r.width  - 0.5) * 2);
    my.set(((e.clientY - r.top)  / r.height - 0.5) * 2);
  }, [mx, my]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    window.addEventListener("mousemove", onMove, { passive:true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [onMove]);

  return (
    <section
      ref={ref}
      aria-label="Hero"
      style={{
        position:"relative", width:"100%", minHeight:"100svh", background:"var(--bg)",
        display:"flex", flexDirection:"column", overflow:"hidden",
        transition:"background var(--dur-theme) ease",
      }}
    >
      {/* Layer 1: grid lines — slowest */}
      <motion.div
        aria-hidden="true"
        style={{
          position:"absolute", inset:0, x:g1x, y:g1y,
          backgroundImage:
            "linear-gradient(var(--fg-ghost) 1px,transparent 1px)," +
            "linear-gradient(90deg,var(--fg-ghost) 1px,transparent 1px)",
          backgroundSize:"72px 72px", pointerEvents:"none",
          transition:"background-image var(--dur-theme) ease",
        }}
      />

      {/* Layer 2: scatter dots — medium depth */}
      <motion.div
        aria-hidden="true"
        style={{ position:"absolute", inset:0, pointerEvents:"none", x:g2x, y:g2y }}
      >
        {DOTS.map(d => (
          <div key={d.id} style={{
            position:"absolute", left:`${d.x}%`, top:`${d.y}%`,
            width:`${d.sz}px`, height:`${d.sz}px`,
            borderRadius:"50%", background:"var(--fg)", opacity:d.op,
          }} />
        ))}
      </motion.div>

      {/* Accent glow */}
      <motion.div
        aria-hidden="true"
        style={{
          position:"absolute",
          width:"min(700px,85vw)", height:"min(700px,85vw)",
          top:"5%", right:"-15%",
          background:"radial-gradient(circle,var(--accent-dim) 0%,transparent 70%)",
          pointerEvents:"none", x:glX, y:glY,
          transition:"background var(--dur-theme) ease",
        }}
      />

      {/* Particle sphere — desktop right side */}
      <div className="sphere-wrap" style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
        <ParticleSphere
        />
      </div>

      {/* Main content */}
      <div style={{
        position:"relative", zIndex:10,
        display:"flex", flexDirection:"column", justifyContent:"space-between",
        minHeight:"100svh", padding:"0 var(--page-x)",
        paddingTop:"calc(64px + clamp(2rem,5vw,4rem))",
      }}>
        {/* Availability badge */}
        <motion.div
          initial={{ opacity:0, y:16 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.7, delay:0.1, ease:EXPO }}
          style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"0.75rem" }}
        >
          <span style={{
            display:"inline-flex", alignItems:"center", gap:"0.5rem",
            padding:"0.35rem 0.9rem", borderRadius:"100px",
            border:"1px solid var(--accent-b)", background:"var(--accent-dim)",
            fontFamily:"var(--font-mono)", fontSize:"0.62rem",
            letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--accent)",
            transition:"border-color var(--dur-theme) ease,background var(--dur-theme) ease,color var(--dur-theme) ease",
          }}>
            <span style={{
              width:6, height:6, borderRadius:"50%", background:"var(--accent)",
              animation:"dot-pulse 2s ease-in-out infinite", display:"inline-block", flexShrink:0,
            }} />
            Available for opportunities
          </span>
          <span className="label-sm" style={{ color:"var(--fg-subtle)" }}>
            Bengaluru · 2025–26
          </span>
        </motion.div>

        {/* Headline — data-cursor="text" expands ring on hover */}
        <motion.div
          style={{
            x:tX, y:tY, flex:1, display:"flex", flexDirection:"column",
            justifyContent:"center", paddingBlock:"clamp(3rem,6vw,5rem)",
            maxWidth:"clamp(300px,55vw,680px)", // keep text away from sphere on desktop
          }}
        >
          <div data-cursor="text">
            <motion.h1
              className="display-xl" style={{ color:"var(--fg)" }}
              initial={{ opacity:0, y:64 }}
              animate={{ opacity:1, y:0 }}
              transition={{ duration:1, delay:0.08, ease:EXPO }}
            >
              Designing
            </motion.h1>

            <motion.div
              initial={{ opacity:0, y:64 }}
              animate={{ opacity:1, y:0 }}
              transition={{ duration:1, delay:0.15, ease:EXPO }}
              style={{ display:"flex", flexWrap:"wrap", alignItems:"baseline", gap:"clamp(0.5rem,2vw,1.2rem)" }}
            >
              <span className="display-xl" style={{
                fontStyle:"italic", color:"var(--accent)",
                transition:"color var(--dur-theme) ease",
              }}>for</span>
              <span className="display-xl" style={{ color:"var(--fg)" }}>the gap.</span>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity:0, y:28 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.85, delay:0.5, ease:EXPO }}
            style={{
              marginTop:"clamp(1.5rem,3vw,2.5rem)", maxWidth:"520px",
              fontFamily:"var(--font-body)", fontSize:"var(--text-body)",
              lineHeight:1.75, color:"var(--fg-muted)",
            }}
          >
            The gap between how software works and how users expect it to work
            is where most products fail.{" "}
            <span style={{ color:"var(--fg)" }}>I close that gap</span> — through
            research, clear IA, and close collaboration with engineering.
          </motion.p>

          <motion.div
            initial={{ opacity:0, y:20 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.75, delay:0.68, ease:EXPO }}
            style={{
              marginTop:"clamp(2rem,4vw,3rem)",
              display:"flex", flexWrap:"wrap", alignItems:"center", gap:"1.25rem",
            }}
          >
            <Link href="/work" data-hover data-magnetic className="btn-primary">
              View work <span aria-hidden="true">→</span>
            </Link>
            <Link href="/about" data-hover className="link-ul"
              style={{
                fontFamily:"var(--font-mono)", fontSize:"0.68rem", letterSpacing:"0.1em",
                textTransform:"uppercase", color:"var(--fg-subtle)",
                transition:"color var(--dur-mid) ease",
              }}
            >
              About me
            </Link>
          </motion.div>
        </motion.div>

        {/* Skills ticker — single-track -50% seamless loop */}
        <motion.div
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          transition={{ delay:1.05, duration:0.85, ease:EXPO }}
          aria-hidden="true"
          style={{
            borderTop:"1px solid var(--border)",
            paddingBlock:"clamp(0.85rem,1.5vw,1.1rem)",
            transition:"border-color var(--dur-theme) ease",
            // overflow:"hidden",
            contain:"layout",
          }}
        >
          <div className="ticker-wrap">
            <div className="ticker-track">
              {[...SKILLS, ...SKILLS].map((s, i) => (
                <span key={i} style={{
                  display:"inline-flex", alignItems:"center", gap:"0.5rem",
                  paddingInline:"clamp(1.1rem,2vw,1.6rem)", flexShrink:0, whiteSpace:"nowrap",
                }}>
                  <span style={{
                    fontFamily:"var(--font-mono)", fontSize:"0.7rem", letterSpacing:"0.12em",
                    textTransform:"uppercase",
                    // Improved contrast: 0.82 opacity — passes WCAG AA on both themes
                    color:"var(--fg)", opacity:0.82,
                    transition:"color var(--dur-theme) ease",
                  }}>
                    {s}
                  </span>
                  <span aria-hidden="true" style={{
                    color: i % 4 === 0 ? "var(--accent)" : "var(--fg)",
                    opacity: i % 4 === 0 ? 0.7 : 0.25,
                    fontSize:"0.45rem",
                    transition:"color var(--dur-theme) ease",
                  }}>●</span>
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes dot-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        /* Hide sphere on small screens to avoid overlap with text */
        @media(max-width:767px){ .sphere-wrap{ display:none; } }
      `}</style>
    </section>
  );
}
