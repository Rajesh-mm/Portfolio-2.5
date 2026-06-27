"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

const STATS = [{value:"~2",label:"Years experience"},{value:"3",label:"Shipped products"},{value:"B2B",label:"Primary focus"},{value:"∞",label:"Curiosity"}];
const INFO  = [{label:"Current role",value:"UX Designer · Embitel Technologies"},{label:"Focus",value:"Enterprise · E-commerce · AI UI"},{label:"Location",value:"Bengaluru · WFH from Davangere"},{label:"Tools",value:"Figma · FigJam · Jira · Confluence"}];

export default function AboutSection() {
  const ref = useRef<HTMLDivElement>(null);
  const {scrollYProgress} = useScroll({target:ref,offset:["start end","end start"]});
  const cY = useTransform(scrollYProgress,[0,1],[30,-30]);

  return (
    <section ref={ref} id="about-snap" aria-label="About" className="noise page-bg-alt"
      style={{padding:"var(--section-y) var(--page-x)",position:"relative",overflow:"hidden"}}>
      <div className="container" style={{display:"grid",gap:"clamp(3rem,6vw,5rem)",position:"relative",zIndex:2}}>
        <motion.p className="label" initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}}
          viewport={{once:true}} transition={{duration:0.5,ease:[0.16,1,0.3,1]}}
          style={{color:"var(--fg-subtle)"}}>About me</motion.p>
        <div style={{display:"grid",gap:"clamp(2rem,4vw,4rem)"}} className="ab-cols">
          <motion.h2 className="display-lg" style={{color:"var(--fg)"}}
            initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}}
            viewport={{once:true}} transition={{duration:0.9,ease:[0.16,1,0.3,1]}}>
            Designing with{" "}<em style={{fontStyle:"italic",color:"var(--fg-muted)"}}>purpose</em>{" "}and clarity.
          </motion.h2>
          <motion.div style={{y:cY}}>
            <motion.p style={{fontFamily:"var(--font-body)",fontSize:"var(--text-body)",lineHeight:1.75,color:"var(--fg-muted)"}}
              initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.7,delay:0.15}}>
              UX Designer at Embitel Technologies, Bengaluru. Research-led, collaborative, and focused on designs that survive contact with engineering and real users.
            </motion.p>
            <motion.p style={{fontFamily:"var(--font-body)",fontSize:"var(--text-body)",lineHeight:1.75,color:"var(--fg-muted)",marginTop:"1rem"}}
              initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.7,delay:0.25}}>
              Great UX isn't just beautiful screens — it's about understanding intent, removing friction, and building systems that hold up after handoff.
            </motion.p>
            <motion.div initial={{opacity:0,y:16}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.6,delay:0.35}} style={{marginTop:"2rem"}}>
              <Link href="/about" data-hover className="link-ul"
                style={{fontFamily:"var(--font-mono)",fontSize:"0.68rem",letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--fg)",display:"inline-flex",alignItems:"center",gap:"0.4rem"}}>
                More about me <span aria-hidden="true">→</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:"0.875rem"}} className="stats-g">
          {STATS.map((s,i)=>(
            <motion.div key={s.label} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}}
              viewport={{once:true}} transition={{duration:0.55,delay:i*0.07}}
              className="card-glass" style={{padding:"clamp(1.25rem,2.5vw,1.75rem)"}}>
              <div style={{fontFamily:"var(--font-display)",fontSize:"clamp(2rem,5vw,3.2rem)",fontWeight:700,color:"var(--fg)",lineHeight:1,letterSpacing:"-0.03em"}}>{s.value}</div>
              <div className="label-sm" style={{color:"var(--fg-subtle)",marginTop:"0.5rem"}}>{s.label}</div>
            </motion.div>
          ))}
        </div>
        {/* Info */}
        <motion.div initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.7,delay:0.2}}>
          {INFO.map(row=>(
            <div key={row.label} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"0.5rem",padding:"1rem 0",borderBottom:"1px solid var(--border)",transition:"border-color var(--dur-theme) ease"}}>
              <span className="label-sm" style={{color:"var(--fg-subtle)",minWidth:"100px"}}>{row.label}</span>
              <span style={{fontFamily:"var(--font-body)",fontSize:"var(--text-sm)",color:"var(--fg-muted)",textAlign:"right"}}>{row.value}</span>
            </div>
          ))}
        </motion.div>
      </div>
      <style>{`@media(min-width:768px){.ab-cols{grid-template-columns:1fr 1fr!important}.stats-g{grid-template-columns:repeat(4,1fr)!important}}`}</style>
    </section>
  );
}
