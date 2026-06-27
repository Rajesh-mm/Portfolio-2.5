"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { projects } from "@/data/projects";
import Footer from "@/components/Footer";
const EXPO:[number,number,number,number]=[0.16,1,0.3,1];
export default function WorkPage() {
  const [hov,setHov]=useState<string|null>(null);
  return (
    <>
      <section aria-labelledby="work-h" style={{background:"var(--bg)",padding:"calc(64px + clamp(3rem,6vw,5rem)) var(--page-x) clamp(3rem,6vw,5rem)",transition:"background var(--dur-theme) ease"}}>
        <div className="container">
          <motion.p className="label" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.6}} style={{color:"var(--fg-subtle)",marginBottom:"1.25rem"}}>All work · {projects.length} case studies</motion.p>
          <motion.h1 id="work-h" className="display-xl" initial={{opacity:0,y:50}} animate={{opacity:1,y:0}} transition={{duration:0.9,delay:0.08,ease:EXPO}} style={{color:"var(--fg)",maxWidth:"900px"}}>
            Selected<br/><em style={{fontStyle:"italic",color:"var(--accent)",transition:"color var(--dur-theme) ease"}}>case studies.</em>
          </motion.h1>
          <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.28}}
            style={{marginTop:"2rem",maxWidth:"500px",fontFamily:"var(--font-body)",fontSize:"var(--text-body)",lineHeight:1.7,color:"var(--fg-muted)"}}>
            Enterprise B2B dashboards, e-commerce loyalty platforms, and AI conversational UI. Real problems, clear rationale, shipped work.
          </motion.p>
        </div>
      </section>
      <div className="divider"/>
      <section aria-label="Project list" style={{background:"var(--bg)",padding:"0 var(--page-x)",transition:"background var(--dur-theme) ease"}}>
        <div className="container">
          {projects.map((p,i)=>(
            <motion.div key={p.slug} initial={{opacity:0,y:28}} animate={{opacity:1,y:0}} transition={{duration:0.55,delay:0.1+i*0.08}}>
              <Link href={`/case-studies/${p.slug}`} data-hover aria-label={`${p.title} — ${p.category}`}
                onMouseEnter={()=>setHov(p.slug)} onMouseLeave={()=>setHov(null)}>
                <article style={{display:"grid",gridTemplateColumns:"auto 1fr auto",gap:"clamp(1rem,4vw,3.5rem)",
                  alignItems:"start",padding:"clamp(1.5rem,3vw,2.5rem) 0",borderBottom:"1px solid var(--border)",
                  transition:`opacity var(--dur-mid) ease, border-color var(--dur-theme) ease`,
                  opacity:hov&&hov!==p.slug?0.3:1}} className="w-row">
                  <span className="label-sm" style={{color:"var(--fg-ghost)",paddingTop:"4px"}}>{p.number}</span>
                  <div style={{display:"grid",gap:"1.25rem"}} className="w-inner">
                    <div>
                      <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:"0.6rem",marginBottom:"0.6rem"}}>
                        <span style={{padding:"0.2rem 0.65rem",borderRadius:"100px",fontFamily:"var(--font-mono)",fontSize:"0.56rem",letterSpacing:"0.1em",textTransform:"uppercase",color:p.accentColor,background:`${p.accentColor}14`,border:`1px solid ${p.accentColor}28`}}>{p.year}</span>
                        <span className="label-sm" style={{color:"var(--fg-subtle)"}}>{p.category}</span>
                      </div>
                      <h2 style={{fontFamily:"var(--font-display)",fontSize:"clamp(1.4rem,3vw,2.5rem)",fontWeight:700,color:"var(--fg)",lineHeight:1.1,letterSpacing:"-0.02em"}}>{p.title}</h2>
                      <p style={{marginTop:"0.4rem",fontFamily:"var(--font-body)",fontSize:"var(--text-sm)",color:"var(--fg-subtle)",lineHeight:1.5}}>{p.tagline}</p>
                    </div>
                    <div style={{display:"grid",gap:"0.6rem"}} className="pai-g">
                      {([["Problem",p.problem],["Approach",p.approach],["Impact",p.impact]]as const).map(([l,v])=>(
                        <div key={l} style={{display:"flex",gap:"0.75rem",alignItems:"flex-start"}}>
                          <span style={{fontFamily:"var(--font-mono)",fontSize:"0.55rem",letterSpacing:"0.1em",textTransform:"uppercase",color:p.accentColor,opacity:0.7,minWidth:"52px",paddingTop:"2px",flexShrink:0}}>{l}</span>
                          <p style={{fontFamily:"var(--font-body)",fontSize:"var(--text-sm)",color:"var(--fg-muted)",lineHeight:1.5}}>{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <motion.span animate={{x:hov===p.slug?6:0,color:hov===p.slug?p.accentColor:"var(--fg-ghost)"}}
                    transition={{duration:0.2}} style={{fontSize:"1.3rem",paddingTop:"4px",flexShrink:0}} aria-hidden="true">→</motion.span>
                </article>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
      <Footer/>
      <style>{`@media(min-width:768px){.w-inner{grid-template-columns:1fr 1fr!important}.pai-g{gap:0.5rem!important}}`}</style>
    </>
  );
}
