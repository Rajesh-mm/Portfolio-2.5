"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeProvider";

const LINKS = [
  { href:"/",        label:"Home"    },
  { href:"/work",    label:"Work"    },
  { href:"/about",   label:"About"   },
  { href:"/resume",  label:"Résumé"  },
  { href:"/contact", label:"Contact" },
];

function Sun() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}
function Moon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export default function Nav() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const onScroll = useCallback(() => setScrolled(window.scrollY > 48), []);
  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive:true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open]);

  return (
    <>
      <header
        role="banner"
        style={{
          position:"fixed", top:0, left:0, right:0, zIndex:200, height:"64px",
          padding:"0 var(--page-x)", display:"flex", alignItems:"center", justifyContent:"space-between",
          background:    scrolled ? "var(--bg-glass)"                   : "transparent",
          backdropFilter:scrolled ? "blur(18px) saturate(1.8)"          : "blur(0px)",
          WebkitBackdropFilter: scrolled ? "blur(18px) saturate(1.8)"  : "blur(0px)",
          borderBottom:  "1px solid " + (scrolled ? "var(--bg-glass-b)" : "transparent"),
          boxShadow:     scrolled ? "var(--shadow-nav)" : "none",
          transition: "background var(--dur-theme) ease, border-color var(--dur-theme) ease, box-shadow var(--dur-theme) ease",
        }}
      >
        {/* Wordmark */}
        <Link href="/" aria-label="Home — Rajesh M Mysoremath" data-hover>
          <div style={{ display:"flex", alignItems:"center", gap:"0.5rem" }}>
            <div
              className="logo-dot"
              style={{
                width:28, height:28, borderRadius:"50%", background:"var(--accent)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontFamily:"var(--font-mono)", fontSize:"0.7rem", fontWeight:500,
                color:"#0D0D0D", flexShrink:0,
                transition:"background var(--dur-theme) ease, transform var(--dur-mid) var(--ease-out)",
              }}
            >R</div>
            <span style={{
              fontFamily:"var(--font-body)", fontWeight:400, fontSize:"0.9rem",
              color:"var(--fg)", letterSpacing:"-0.01em",
              transition:"color var(--dur-theme) ease",
            }}>Rajesh M</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main navigation">
          <div className="desk-nav" style={{ display:"flex", alignItems:"center", gap:"1.75rem" }}>
            {LINKS.map(l => (
              <Link key={l.href} href={l.href} data-hover
                aria-current={pathname === l.href ? "page" : undefined}
                className="nav-lnk"
                style={{
                  fontFamily:"var(--font-mono)", fontSize:"0.66rem", letterSpacing:"0.12em",
                  textTransform:"uppercase",
                  color: pathname === l.href ? "var(--accent)" : "var(--fg-subtle)",
                  borderBottom: pathname === l.href ? "1px solid var(--accent)" : "1px solid transparent",
                  paddingBottom:"2px",
                  transition:"color var(--dur-mid) ease, border-color var(--dur-mid) ease",
                }}
              >{l.label}</Link>
            ))}

            {/* Theme toggle */}
            <button onClick={toggle} className="theme-toggle" data-hover
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
              {theme === "dark" ? <Sun /> : <Moon />}
            </button>

            {/* Download Resume CTA */}
            <a
              href="/resume.pdf"
              download="Rajesh_Mysoremath_UX_Resume.pdf"
              data-hover data-magnetic
              className="btn-primary"
              style={{ padding:"0.4rem 1rem", fontSize:"0.62rem", letterSpacing:"0.08em", textTransform:"uppercase", gap:"0.4rem" }}
            >
              <span aria-hidden="true">↓</span> Resume
            </a>
          </div>
        </nav>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open} data-hover
          className="ham"
          style={{ display:"none", flexDirection:"column", gap:"5px", padding:"6px", background:"none", border:"none" }}
        >
          {[0,1,2].map(i => (
            <span key={i} style={{
              display:"block",
              width:  open && i===1 ? "0" : "20px",
              height:"1.5px", background:"var(--fg)", borderRadius:"2px",
              transition:`transform var(--dur-mid) var(--ease-out), opacity var(--dur-fast) ease, width var(--dur-fast) ease`,
              transform: open&&i===0 ? "rotate(45deg) translate(4.5px,4.5px)" : open&&i===2 ? "rotate(-45deg) translate(4.5px,-4.5px)" : "none",
              opacity: open && i===1 ? 0 : 1,
            }} />
          ))}
        </button>
      </header>

      <style>{`
        @media(max-width:767px){ .desk-nav{display:none!important} .ham{display:flex!important} }
        .nav-lnk:hover { color:var(--fg)!important; }
        .logo-dot:hover { transform:scale(1.1)!important; }
      `}</style>

      {/* Mobile fullscreen menu */}
      <AnimatePresence>
        {open && (
          <motion.div role="dialog" aria-modal="true" aria-label="Navigation menu"
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            transition={{ duration:0.28, ease:[0.16,1,0.3,1] }}
            style={{
              position:"fixed", inset:0, zIndex:190, background:"var(--bg)",
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"0.25rem",
            }}
          >
            {LINKS.map((l, i) => (
              <motion.div key={l.href}
                initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                transition={{ delay:i*0.06, duration:0.4, ease:[0.16,1,0.3,1] }}>
                <Link href={l.href} data-hover
                  style={{
                    fontFamily:"var(--font-display)",
                    fontSize:"clamp(2.2rem,7vw,3.5rem)",
                    fontWeight:700,
                    color: pathname === l.href ? "var(--accent)" : "var(--fg)",
                    display:"block", padding:"0.2rem 0", letterSpacing:"-0.02em",
                  }}
                >{l.label}</Link>
              </motion.div>
            ))}
            {/* Download in mobile menu */}
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.36 }}
              style={{ marginTop:"1.5rem", display:"flex", gap:"0.75rem" }}>
              <a href="/resume.pdf" download="Rajesh_Mysoremath_UX_Resume.pdf"
                data-hover className="btn-primary" style={{ fontSize:"0.8rem" }}>
                ↓ Download Resume
              </a>
              <button onClick={toggle} data-hover className="btn-ghost" style={{ fontSize:"0.75rem" }}>
                {theme === "dark" ? "☀ Light" : "☾ Dark"}
              </button>
            </motion.div>
            <p style={{
              position:"absolute", bottom:"2.5rem",
              fontFamily:"var(--font-mono)", fontSize:"0.62rem",
              letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--fg-ghost)",
            }}>
              Bengaluru · Open to opportunities
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
