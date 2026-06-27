"use client";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";

const EXPO:[number,number,number,number] = [0.16,1,0.3,1];

// Behance disabled per design decision — kept for future reference
// const BEHANCE = { label:"Behance", value:"/rajeshmysore1", href:"https://www.behance.net/rajeshmysore1" };

const CONTACT_LINKS = [
  { label:"Email",    value:"rajeshmm5321@gmail.com",          href:"mailto:rajeshmm5321@gmail.com" },
  { label:"LinkedIn", value:"https://www.linkedin.com/in/rajeshmmysoremath/", href:"https://www.linkedin.com/in/rajeshmmysoremath/" },
  { label:"Résumé",   value:"Download PDF",                    href:"/resume.pdf", download:"Rajesh_M_Mysoremath_Resume.pdf" },
];

const LOOKING_FOR = [
  "Clear design problems with real user impact",
  "Collaborative, cross-functional teams",
  "Room to contribute to both UX process and UI output",
  "Products that users actively depend on",
];

export default function ContactPage() {
  return (
    <>
      <section aria-labelledby="ct-h" style={{
        background:"var(--bg)",
        padding:"calc(64px + clamp(3rem,6vw,5rem)) var(--page-x) var(--section-y)",
        transition:"background var(--dur-theme) ease",
      }}>
        <div className="container">
          <motion.p className="label" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
            style={{ color:"var(--fg-subtle)", marginBottom:"1.25rem" }}>Contact</motion.p>

          <motion.h1 id="ct-h" className="display-xl"
            initial={{ opacity:0, y:50 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.9, delay:0.08, ease:EXPO }}
            style={{ color:"var(--fg)", marginBottom:"clamp(3rem,6vw,5rem)" }}>
            Let's make<br />
            <em style={{ fontStyle:"italic", color:"var(--accent)", transition:"color var(--dur-theme) ease" }}>
              something real.
            </em>
          </motion.h1>

          <div style={{ display:"grid", gap:"clamp(2.5rem,5vw,5rem)" }} className="ct-g">
            {/* Left: description + links */}
            <motion.div initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.8, delay:0.3 }}>
              <p style={{
                fontFamily:"var(--font-body)", fontSize:"var(--text-body)",
                lineHeight:1.75, color:"var(--fg-muted)",
                marginBottom:"clamp(2rem,4vw,3rem)",
              }}>
                Currently open to full-time UX design roles — enterprise products, B2B, AI/ML interfaces, or design systems. Based in Bengaluru, open to remote or hybrid.
              </p>

              <nav aria-label="Contact links">
                {CONTACT_LINKS.map(c => (
                  <a key={c.label} href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    download={"download" in c ? c.download : undefined}
                    data-hover className="ct-row"
                    style={{
                      display:"flex", alignItems:"center", justifyContent:"space-between",
                      padding:"1.1rem 0", borderBottom:"1px solid var(--border)",
                      transition:`border-color var(--dur-mid) ease`,
                    }}>
                    <div>
                      <p className="label-sm" style={{ color:"var(--fg-subtle)", marginBottom:"4px" }}>{c.label}</p>
                      <p style={{ fontFamily:"var(--font-body)", fontSize:"var(--text-body)", color:"var(--fg)" }}>{c.value}</p>
                    </div>
                    <span className="ct-arr" aria-hidden="true"
                      style={{ color:"var(--fg-ghost)", fontSize:"1.1rem", transition:`color var(--dur-mid) ease, transform var(--dur-mid) var(--ease-out)` }}>
                      {c.label === "Résumé" ? "↓" : "→"}
                    </span>
                  </a>
                ))}
              </nav>
            </motion.div>

            {/* Right: cards */}
            <motion.div initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }}
              transition={{ duration:0.8, delay:0.45 }}
              style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
              {/* Availability card */}
              <div style={{
                padding:"clamp(1.5rem,3vw,2rem)", borderRadius:"1.25rem",
                background:"var(--accent-dim)", border:"1px solid var(--accent-b)",
                transition:"background var(--dur-theme) ease, border-color var(--dur-theme) ease",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"1rem" }}>
                  <span style={{
                    width:8, height:8, borderRadius:"50%", background:"var(--accent)",
                    animation:"dot-pulse 2s ease-in-out infinite", display:"inline-block",
                    transition:"background var(--dur-theme) ease",
                  }} />
                  <span className="label-sm" style={{ color:"var(--accent)", transition:"color var(--dur-theme) ease" }}>
                    Available for opportunities
                  </span>
                </div>
                <p style={{ fontFamily:"var(--font-body)", fontSize:"var(--text-sm)", lineHeight:1.7, color:"var(--fg-muted)" }}>
                  Open to full-time UX roles. Most interested in products where design directly impacts user outcomes.
                </p>
              </div>

              {/* Looking for */}
              <div className="card-glass" style={{ padding:"clamp(1.5rem,3vw,2rem)" }}>
                <h2 style={{
                  fontFamily:"var(--font-display)", fontSize:"clamp(1.1rem,2vw,1.4rem)",
                  fontWeight:700, color:"var(--fg)", marginBottom:"1.25rem", letterSpacing:"-0.015em",
                }}>
                  What I'm looking for
                </h2>
                {LOOKING_FOR.map(item => (
                  <div key={item} style={{
                    display:"flex", alignItems:"flex-start", gap:"0.75rem",
                    padding:"0.75rem 0", borderBottom:"1px solid var(--border)",
                    transition:"border-color var(--dur-theme) ease",
                  }}>
                    <span style={{ color:"var(--accent)", marginTop:"3px", fontSize:"0.6rem", flexShrink:0, transition:"color var(--dur-theme) ease" }} aria-hidden="true">✦</span>
                    <p style={{ fontFamily:"var(--font-body)", fontSize:"var(--text-sm)", color:"var(--fg-muted)", lineHeight:1.6 }}>{item}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
        @keyframes dot-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @media(min-width:768px){ .ct-g { grid-template-columns:1fr 1fr !important; } }
        .ct-row:hover { border-color:var(--accent-b) !important; }
        .ct-row:hover .ct-arr { color:var(--accent) !important; transform:translateX(4px); }
      `}</style>
    </>
  );
}
