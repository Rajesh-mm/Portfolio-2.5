"use client";
import Link from "next/link";
import { motion } from "framer-motion";

const NAV = [
  { href:"/",       label:"Home"    },
  { href:"/work",   label:"Work"    },
  { href:"/about",  label:"About"   },
  { href:"/resume", label:"Résumé"  },
  { href:"/contact",label:"Contact" },
];

// Behance disabled per design decision — kept in code for future reference
// const BEHANCE = { label:"Behance", href:"https://www.behance.net/rajeshmysore1" };

const LINKEDIN = {
  label: "LinkedIn",
  href:  "https://www.linkedin.com/in/rajeshmmysoremath/",
};

export default function Footer() {
  return (
    <footer
      aria-label="Site footer"
      style={{
        background:"var(--bg)", borderTop:"1px solid var(--border)",
        transition:"background var(--dur-theme) ease, border-color var(--dur-theme) ease",
      }}
    >
      <div style={{ padding:"var(--section-y) var(--page-x)" }}>
        <div className="container">
          {/* Big CTA */}
          <motion.div initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ duration:0.9, ease:[0.16,1,0.3,1] }}
            style={{ marginBottom:"clamp(3rem,7vw,6rem)" }}>
            <p className="label" style={{ color:"var(--fg-subtle)", marginBottom:"1.25rem" }}>
              Let's connect
            </p>
            <h2 className="display-lg" style={{ color:"var(--fg)" }}>
              Have a project<br />
              <em style={{ fontStyle:"italic", color:"var(--accent)", transition:"color var(--dur-theme) ease" }}>
                in mind?
              </em>
            </h2>
            <div style={{ marginTop:"2.5rem", display:"flex", flexWrap:"wrap", gap:"1rem" }}>
              <a href="mailto:rajeshmm5321@gmail.com" data-hover data-magnetic
                className="btn-primary" style={{ fontSize:"clamp(0.85rem,1.5vw,1rem)", padding:"1rem 2rem" }}>
                rajeshmm5321@gmail.com <span aria-hidden="true">→</span>
              </a>
              <a href="/resume.pdf" download="Rajesh_Mysoremath_UX_Resume.pdf"
                data-hover className="btn-ghost">
                <span aria-hidden="true">↓</span> Download Resume
              </a>
            </div>
          </motion.div>

          {/* Bottom bar */}
          <div style={{
            display:"flex", flexWrap:"wrap", alignItems:"center",
            justifyContent:"space-between", gap:"1.5rem",
            paddingTop:"2rem", borderTop:"1px solid var(--border)",
            transition:"border-color var(--dur-theme) ease",
          }}>
            <nav aria-label="Footer navigation"
              style={{ display:"flex", flexWrap:"wrap", gap:"clamp(1rem,3vw,2rem)" }}>
              {NAV.map(l => (
                <Link key={l.href} href={l.href} data-hover
                  className="label-sm link-ul"
                  style={{ color:"var(--fg-subtle)", transition:"color var(--dur-mid) ease" }}>
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Only LinkedIn shown — Behance disabled */}
            <a href={LINKEDIN.href} target="_blank" rel="noopener noreferrer"
              data-hover className="label-sm link-ul"
              style={{ color:"var(--fg-subtle)", transition:"color var(--dur-mid) ease" }}>
              {LINKEDIN.label}
            </a>

            <p className="label-sm" style={{ color:"var(--fg-ghost)" }}>
              © {new Date().getFullYear()} Rajesh M Mysoremath
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
