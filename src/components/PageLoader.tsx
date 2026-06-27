"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * PageLoader — first visit only (sessionStorage flag).
 * Fast, minimal, intentional. 1.8s total, then fades.
 * Inspired by zarcerog.com — letter reveal + line sweep.
 */
export default function PageLoader() {
  const [visible, setVisible] = useState(false);
  const [phase,   setPhase]   = useState<"in"|"hold"|"out">("in");

  useEffect(() => {
    if (sessionStorage.getItem("pf-seen")) return;
    sessionStorage.setItem("pf-seen", "1");
    setVisible(true);
    const t1 = setTimeout(() => setPhase("hold"), 500);
    const t2 = setTimeout(() => setPhase("out"),  1400);
    const t3 = setTimeout(() => setVisible(false), 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="loader"
          initial={{ opacity:1 }}
          exit={{ opacity:0 }}
          transition={{ duration:0.48, ease:[0.16,1,0.3,1] }}
          style={{
            position:"fixed", inset:0, zIndex:10000,
            background:"#0A0A0A",
            display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            gap:"2rem",
          }}
          aria-hidden="true"
        >
          {/* Wordmark — chars reveal with stagger */}
          <div style={{ overflow:"hidden", display:"flex", gap:"0.02em" }}>
            {"RAJESH".split("").map((ch, i) => (
              <motion.span
                key={i}
                initial={{ y:"100%", opacity:0 }}
                animate={{ y: phase === "out" ? "-100%" : "0%", opacity: phase === "out" ? 0 : 1 }}
                transition={{
                  y:       { duration:0.5, delay: phase === "out" ? 0 : i * 0.06, ease:[0.16,1,0.3,1] },
                  opacity: { duration:0.35, delay: phase === "out" ? 0 : i * 0.06 },
                }}
                style={{
                  display:"inline-block",
                  fontFamily:"var(--font-display)",
                  fontSize:"clamp(2.5rem,7vw,5.5rem)",
                  fontWeight:700,
                  color:"#F5F3EF",
                  letterSpacing:"-0.03em",
                  lineHeight:1,
                }}
              >
                {ch}
              </motion.span>
            ))}
            <motion.em
              initial={{ y:"100%", opacity:0 }}
              animate={{ y: phase === "out" ? "-100%" : "0%", opacity: phase === "out" ? 0 : 1 }}
              transition={{
                y:       { duration:0.5, delay: phase === "out" ? 0 : 6 * 0.06, ease:[0.16,1,0.3,1] },
                opacity: { duration:0.35, delay: phase === "out" ? 0 : 6 * 0.06 },
              }}
              style={{
                display:"inline-block", marginLeft:"0.35em",
                fontFamily:"var(--font-display)",
                fontSize:"clamp(2.5rem,7vw,5.5rem)",
                fontWeight:700, fontStyle:"italic",
                color:"#C9FF5A",
                letterSpacing:"-0.03em",
                lineHeight:1,
              }}
            >
              M
            </motion.em>
          </div>

          {/* Progress line */}
          <div style={{
            width:"clamp(100px,14vw,160px)", height:"1px",
            background:"rgba(245,243,239,0.08)", borderRadius:"2px",
            overflow:"hidden", position:"relative",
          }}>
            <motion.div
              initial={{ width:"0%" }}
              animate={{ width: phase === "in" ? "40%" : phase === "hold" ? "88%" : "100%" }}
              transition={{ duration:0.6, ease:[0.16,1,0.3,1] }}
              style={{
                position:"absolute", left:0, top:0, height:"100%",
                background:"#C9FF5A", borderRadius:"2px",
              }}
            />
          </div>

          {/* Role */}
          <motion.p
            initial={{ opacity:0 }}
            animate={{ opacity: phase === "out" ? 0 : 0.32 }}
            transition={{ duration:0.4, delay:0.25 }}
            style={{
              fontFamily:"var(--font-mono)", fontSize:"0.6rem",
              letterSpacing:"0.18em", textTransform:"uppercase", color:"#F5F3EF",
            }}
          >
            UX Designer · Bengaluru
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
