"use client";
import { useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { projects } from "@/data/projects";

const EASE:[number,number,number,number] = [0.22,1,0.36,1];
const DUR = 0.42;

export default function WorkSection() {
  const sRef  = useRef<HTMLDivElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  const [drag,setDrag]   = useState(false);
  const [sx,  setSx]     = useState(0);
  const [ss,  setSs]     = useState(0);
  const [moved,setMoved] = useState(false);

  const {scrollYProgress} = useScroll({target:sRef,offset:["start end","end start"]});
  const hY = useTransform(scrollYProgress,[0,0.35],[36,0]);
  const hO = useTransform(scrollYProgress,[0,0.28],[0,1]);

  const onDown = useCallback((e:React.PointerEvent)=>{
    if(!strip.current) return;
    setDrag(true); setMoved(false); setSx(e.clientX); setSs(strip.current.scrollLeft);
    strip.current.setPointerCapture(e.pointerId);
  },[]);
  const onMove = useCallback((e:React.PointerEvent)=>{
    if(!drag||!strip.current) return;
    const d=sx-e.clientX; if(Math.abs(d)>4) setMoved(true);
    strip.current.scrollLeft=ss+d*1.2;
  },[drag,sx,ss]);
  const onUp = useCallback(()=>setDrag(false),[]);

  return (
    <section ref={sRef} id="work" aria-label="Selected work"
      style={{background:"var(--bg)",paddingBlock:"var(--section-y)",transition:"background var(--dur-theme) ease"}}>
      <motion.div style={{y:hY,opacity:hO}} className="container">
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",
          flexWrap:"wrap",gap:"1rem",padding:"0 var(--page-x)",marginBottom:"clamp(2.5rem,5vw,4rem)"}}>
          <div>
            <p className="label" style={{color:"var(--accent)",marginBottom:"0.75rem",transition:"color var(--dur-theme) ease"}}>Selected work</p>
            <h2 className="display-lg" style={{color:"var(--fg)"}}>Case studies</h2>
          </div>
          <p className="label-sm" style={{color:"var(--fg-ghost)",marginBottom:"0.4rem"}} aria-hidden="true">Drag to explore →</p>
        </div>
      </motion.div>

      <div ref={strip} className="h-scroll" role="list" aria-label="Project cards"
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}
        style={{paddingInline:"var(--page-x)",paddingBlock:"16px",cursor:drag?"grabbing":"grab",userSelect:"none"}}>
        <div style={{display:"flex",gap:"1.25rem",width:"max-content",alignItems:"stretch"}}>
          {projects.map((p,i)=><Card key={p.slug} project={p} index={i} moved={moved}/>)}
          {/* End tile */}
          <motion.div role="listitem"
            initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}}
            viewport={{once:true}} transition={{duration:0.5,delay:0.35,ease:EASE}}
            style={{flexShrink:0,width:"clamp(200px,20vw,260px)",height:"clamp(380px,48vw,480px)",
              display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"1.25rem",
              border:"1px dashed var(--border-h)",transition:"border-color var(--dur-theme) ease",scrollSnapAlign:"center"}}>
            <Link href="/work" data-hover
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"1rem"}}>
              <div className="all-arr" style={{width:44,height:44,borderRadius:"50%",
                background:"var(--accent-dim)",border:"1px solid var(--accent-b)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:"1rem",color:"var(--accent)",
                transition:`transform ${DUR}s ${EASE.join(",")},background var(--dur-mid) ease`}}>→</div>
              <span className="label-sm" style={{color:"var(--fg-subtle)"}}>All projects</span>
            </Link>
          </motion.div>
        </div>
      </div>
      <style>{`.all-arr:hover{transform:scale(1.1)}`}</style>
    </section>
  );
}

function Card({project:p,index,moved}:{project:(typeof projects)[0];index:number;moved:boolean}) {
  const [hov,setHov] = useState(false);
  return (
    /* Layout layer: owns dimensions + isolation. Never transformed. */
    <article role="listitem"
      style={{flexShrink:0,width:"clamp(300px,32vw,380px)",height:"clamp(380px,48vw,480px)",
        scrollSnapAlign:"center",isolation:"isolate",position:"relative"}}>
      {/* Entrance layer: whileInView only — separate from hover */}
      <motion.div initial={{opacity:0,y:32}} whileInView={{opacity:1,y:0}}
        viewport={{once:true,margin:"-60px"}}
        transition={{duration:0.6,delay:index*0.09,ease:[0.16,1,0.3,1]}}
        style={{height:"100%"}}>
        <Link href={`/case-studies/${p.slug}`} data-hover tabIndex={0}
          aria-label={`${p.title} — ${p.category}`}
          onClick={e=>{if(moved)e.preventDefault();}}
          onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
          style={{display:"block",height:"100%"}}>
          {/* Transform layer: scale only, box-shadow outside clip */}
          <motion.div animate={{scale:hov?1.006:1}}
            transition={{duration:DUR,ease:EASE}}
            style={{height:"100%",borderRadius:"1.25rem",willChange:"transform",
              boxShadow:hov?"0 6px 24px rgba(0,0,0,0.09),0 2px 6px rgba(0,0,0,0.05)":"0 1px 3px rgba(0,0,0,0.04)",
              transition:`box-shadow ${DUR}s ease`}}>
            {/* Visual chrome: border + radius + overflow clip */}
            <div style={{position:"absolute",inset:0,borderRadius:"1.25rem",overflow:"hidden",
              border:"1px solid",borderColor:hov?"var(--border-h)":"var(--border)",
              background:hov?"var(--bg-card-h)":"var(--bg-card)",
              display:"flex",flexDirection:"column",justifyContent:"space-between",
              padding:"clamp(1.5rem,3vw,2rem)",
              transition:`background ${DUR}s ease,border-color ${DUR}s ease`}}>
              {/* Accent glow — clipped by overflow:hidden */}
              <div aria-hidden="true" style={{position:"absolute",top:0,right:0,
                width:"200px",height:"200px",pointerEvents:"none",
                background:`radial-gradient(circle,${p.accentColor}16 0%,transparent 70%)`,
                transform:"translate(35%,-35%)",opacity:hov?1:0.5,
                transition:`opacity ${DUR}s ease`}}/>
              {/* Top */}
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1.5rem"}}>
                  <span className="label-sm" style={{color:"var(--fg-subtle)"}}>{p.year}</span>
                  <span style={{padding:"0.22rem 0.7rem",borderRadius:"100px",
                    fontFamily:"var(--font-mono)",fontSize:"0.58rem",letterSpacing:"0.1em",textTransform:"uppercase",
                    color:p.accentColor,background:`${p.accentColor}14`,border:`1px solid ${p.accentColor}28`}}>
                    {p.tags[0]}
                  </span>
                </div>
                <div aria-hidden="true" style={{fontFamily:"var(--font-display)",
                  fontSize:"clamp(2.5rem,5vw,4rem)",fontWeight:700,color:"var(--fg-ghost)",
                  lineHeight:1,marginBottom:"0.75rem",letterSpacing:"-0.04em"}}>{p.number}</div>
                <h3 style={{fontFamily:"var(--font-display)",fontSize:"clamp(1.25rem,2.2vw,1.65rem)",
                  fontWeight:700,color:"var(--fg)",lineHeight:1.15,letterSpacing:"-0.02em"}}>{p.title}</h3>
              </div>
              {/* P/A/I + footer */}
              <div>
                <div style={{display:"flex",flexDirection:"column",gap:"0.75rem",marginBottom:"1.25rem"}}>
                  {([["Problem",p.problem],["Approach",p.approach],["Impact",p.impact]] as const).map(([lbl,val])=>(
                    <div key={lbl}>
                      <p style={{fontFamily:"var(--font-mono)",fontSize:"0.56rem",letterSpacing:"0.1em",
                        textTransform:"uppercase",color:p.accentColor,opacity:0.75,marginBottom:"3px"}}>{lbl}</p>
                      <p style={{fontFamily:"var(--font-body)",fontSize:"var(--text-sm)",
                        color:"var(--fg-muted)",lineHeight:1.5}}>{val}</p>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                  paddingTop:"1rem",borderTop:"1px solid var(--border)",transition:"border-color var(--dur-theme) ease"}}>
                  <span className="label-sm" style={{color:"var(--fg-subtle)"}}>{p.role}</span>
                  <motion.span animate={{x:hov?4:0,color:hov?p.accentColor:"var(--fg-ghost)"}}
                    transition={{duration:0.22,ease:EASE}} style={{fontSize:"0.95rem"}} aria-hidden="true">→</motion.span>
                </div>
              </div>
            </div>
          </motion.div>
        </Link>
      </motion.div>
    </article>
  );
}
