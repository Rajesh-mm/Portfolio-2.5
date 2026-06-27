"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Footer from "@/components/Footer";

const EXPO: [number,number,number,number] = [0.16,1,0.3,1];

const EXPERIENCE = [
  {
    period: "2024 – Present",
    role: "UX Designer",
    company: "Embitel Technologies",
    location: "Bengaluru, India",
    points: [
      "Designed modular enterprise operations dashboard — improved scanability across high-volume review workflows",
      "Rebuilt loyalty enrollment flows for a multi-store e-commerce platform — reduced enrollment friction",
      "Designed conversational UI for an AI support assistant — message type system, quick reply patterns, handoff interaction",
      "Worked cross-functionally with PM, engineering, and QA — close collaboration from discovery through handoff",
      "Built and maintained a Figma component library shared across product modules",
    ],
  },
  {
    period: "2023 – 2024",
    role: "Transitioning into UX Design",
    company: "Embitel Technologies",
    location: "Bengaluru, India",
    points: [
      "Completed professional UX certification",
      "Developed a portfolio of case studies covering research, IA, wireframing, and interaction design",
      "Deepened Figma, design systems, and developer handoff skills",
    ],
  },
];

const SKILLS = [
  { cat: "UX Methods",  items: "User Research · Usability Testing · Heuristic Evaluation · Information Architecture · Wireframing · Prototyping · Task Flow Mapping" },
  { cat: "Design",      items: "Interaction Design · Visual Design · Design Systems · Component Architecture · Responsive Design · Accessibility (WCAG) · Developer Handoff" },
  { cat: "Tools",       items: "Figma · FigJam · Jira · Confluence · Maze · Miro · Notion" },
  { cat: "Domain",      items: "Enterprise B2B · E-commerce · AI / Conversational UI · Loyalty Platforms · Operations Dashboards" },
];

export default function ResumePage() {
  return (
    <>
      <section
        aria-labelledby="resume-h"
        style={{
          background: "var(--bg)",
          padding: "calc(64px + clamp(3rem,6vw,5rem)) var(--page-x) var(--section-y)",
          transition: "background var(--dur-theme) ease",
        }}
      >
        <div className="container">
          {/* Header */}
          <motion.div
            initial={{ opacity:0, y:16 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.6, ease:EXPO }}
            style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:"2rem", marginBottom:"clamp(3rem,5vw,5rem)" }}
          >
            <div>
              <p className="label" style={{ color:"var(--fg-subtle)", marginBottom:"0.75rem" }}>
                Résumé
              </p>
              <h1 id="resume-h" className="display-lg" style={{ color:"var(--fg)" }}>
                Rajesh M<br />
                <em style={{ fontStyle:"italic", color:"var(--accent)", transition:"color var(--dur-theme) ease" }}>
                  Mysoremath.
                </em>
              </h1>
              <p style={{
                fontFamily:"var(--font-body)", fontSize:"var(--text-body)",
                color:"var(--fg-muted)", marginTop:"1rem",
              }}>
                UX Designer · Bengaluru, India · rajeshmm5321@gmail.com
              </p>
              <p style={{
                fontFamily:"var(--font-mono)", fontSize:"0.65rem",
                letterSpacing:"0.1em", textTransform:"uppercase",
                color:"var(--fg-subtle)", marginTop:"0.4rem",
              }}>
                https://www.linkedin.com/in/rajeshmmysoremath/
              </p>
            </div>

            {/* Download CTA */}
            <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem", alignItems:"flex-start" }}>
              <a
                href="/resume.pdf"
                download="Rajesh_Mysoremath_UX_Resume.pdf"
                data-hover
                data-magnetic
                className="btn-primary"
                style={{ gap:"0.5rem" }}
              >
                <span aria-hidden="true">↓</span> Download PDF
              </a>
              <Link
                href="/contact"
                data-hover
                className="btn-ghost"
                style={{ fontSize:"0.82rem" }}
              >
                Get in touch →
              </Link>
            </div>
          </motion.div>

          <div className="divider" style={{ marginInline:0, marginBottom:"clamp(3rem,5vw,4rem)" }} />

          {/* Experience */}
          <motion.div
            initial={{ opacity:0, y:24 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.7, delay:0.15, ease:EXPO }}
          >
            <p className="label" style={{ color:"var(--accent)", marginBottom:"2rem", transition:"color var(--dur-theme) ease" }}>
              Experience
            </p>
            {EXPERIENCE.map((job, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gap: "1rem",
                  padding: "clamp(1.5rem,3vw,2.5rem) 0",
                  borderBottom: "1px solid var(--border)",
                  transition: "border-color var(--dur-theme) ease",
                }}
                className="exp-row"
              >
                <div>
                  <span className="label-sm" style={{ color:"var(--fg-subtle)" }}>
                    {job.period}
                  </span>
                </div>
                <div>
                  <h2 style={{
                    fontFamily:"var(--font-display)",
                    fontSize:"clamp(1.1rem,2.5vw,1.5rem)",
                    fontWeight:700, color:"var(--fg)", letterSpacing:"-0.015em",
                  }}>
                    {job.role}
                  </h2>
                  <p className="label-sm" style={{ color:"var(--accent)", marginTop:"4px", transition:"color var(--dur-theme) ease" }}>
                    {job.company}{job.location ? ` · ${job.location}` : ""}
                  </p>
                </div>
                <ul style={{ paddingLeft:0, listStyle:"none", display:"flex", flexDirection:"column", gap:"0.6rem" }}>
                  {job.points.map((pt, j) => (
                    <li key={j} style={{ display:"flex", alignItems:"flex-start", gap:"0.75rem" }}>
                      <span style={{ color:"var(--accent)", flexShrink:0, marginTop:"3px", fontSize:"0.5rem", transition:"color var(--dur-theme) ease" }} aria-hidden="true">✦</span>
                      <p style={{ fontFamily:"var(--font-body)", fontSize:"var(--text-sm)", color:"var(--fg-muted)", lineHeight:1.65 }}>
                        {pt}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </motion.div>

          <div style={{ marginTop:"clamp(3rem,5vw,5rem)" }} />

          {/* Skills */}
          <motion.div
            initial={{ opacity:0, y:24 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:0.7, delay:0.3, ease:EXPO }}
          >
            <p className="label" style={{ color:"var(--accent)", marginBottom:"2rem", transition:"color var(--dur-theme) ease" }}>
              Skills &amp; tools
            </p>
            <div style={{ display:"grid", gap:"1.5rem" }} className="sk-grid">
              {SKILLS.map(s => (
                <div
                  key={s.cat}
                  style={{
                    display:"grid", gap:"0.5rem",
                    padding:"1.25rem 0",
                    borderBottom:"1px solid var(--border)",
                    transition:"border-color var(--dur-theme) ease",
                  }}
                  className="sk-row"
                >
                  <span className="label-sm" style={{ color:"var(--fg-subtle)", minWidth:"130px" }}>
                    {s.cat}
                  </span>
                  <p style={{ fontFamily:"var(--font-body)", fontSize:"var(--text-sm)", color:"var(--fg-muted)", lineHeight:1.6 }}>
                    {s.items}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Download reminder */}
          <motion.div
            initial={{ opacity:0 }}
            animate={{ opacity:1 }}
            transition={{ duration:0.6, delay:0.5 }}
            style={{ marginTop:"clamp(3rem,5vw,5rem)", display:"flex", gap:"1rem", flexWrap:"wrap" }}
          >
            <a
              href="/resume.pdf"
              download="Rajesh_Mysoremath_UX_Resume.pdf"
              data-hover
              data-magnetic
              className="btn-primary"
            >
              <span aria-hidden="true">↓</span> Download PDF
            </a>
            <Link href="/work" data-hover className="btn-ghost">
              View case studies →
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />

      <style>{`
        @media(min-width:768px){
          .exp-row { grid-template-columns: 160px 220px 1fr !important; align-items:start; }
          .sk-row  { grid-template-columns: 130px 1fr !important; align-items:start; }
        }
      `}</style>
    </>
  );
}
