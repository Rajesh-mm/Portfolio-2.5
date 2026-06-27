"use client";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { projects } from "@/data/projects";
import Footer from "@/components/Footer";
const EXPO:[number,number,number,number]=[0.16,1,0.3,1];

function SW({id,label,children}:{id?:string;label:string;children:React.ReactNode}){return(
  <section id={id} style={{padding:"var(--section-y) var(--page-x)",background:"var(--bg)",transition:"background var(--dur-theme) ease"}}>
    <div className="container">
      <motion.p className="label-sm" initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} style={{color:"var(--fg-ghost)",marginBottom:"1.25rem"}}>{label}</motion.p>
      {children}
    </div>
  </section>
);}
function SH({children}:{children:React.ReactNode}){return(
  <motion.h2 className="display-md" initial={{opacity:0,y:28}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.8,ease:EXPO}} style={{color:"var(--fg)",marginBottom:"clamp(2rem,4vw,3.5rem)"}}>{children}</motion.h2>
);}

export default function CaseStudyPage(){
  const {slug}=useParams<{slug:string}>();
  const p=projects.find(x=>x.slug===slug);
  if(!p) return notFound();
  const idx=projects.findIndex(x=>x.slug===slug);
  const next=projects[(idx+1)%projects.length];
  return(
    <>
      <section aria-labelledby="cs-t" style={{background:"var(--bg)",padding:"calc(64px + clamp(3rem,6vw,5rem)) var(--page-x) var(--section-y)",position:"relative",overflow:"hidden",transition:"background var(--dur-theme) ease"}}>
        <div aria-hidden="true" style={{position:"absolute",top:0,right:0,width:"min(700px,80vw)",height:"min(700px,80vw)",background:`radial-gradient(circle,${p.accentColor}10 0%,transparent 70%)`,transform:"translate(25%,-25%)",pointerEvents:"none"}}/>
        <div className="container">
          <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:0.5}} style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"3rem"}}>
            <Link href="/work" data-hover className="label-sm" style={{color:"var(--fg-subtle)",transition:`color var(--dur-mid) ease`}} onMouseOver={e=>(e.currentTarget.style.color="var(--fg)")} onMouseOut={e=>(e.currentTarget.style.color="var(--fg-subtle)")}>← Work</Link>
            <span style={{color:"var(--border-h)"}}>/</span>
            <span className="label-sm" style={{color:p.accentColor,opacity:0.8}}>{p.number}</span>
          </motion.div>
          <motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} transition={{duration:0.6,delay:0.1}} style={{display:"flex",flexWrap:"wrap",gap:"0.6rem",marginBottom:"1.5rem"}}>
            <span style={{padding:"0.25rem 0.8rem",borderRadius:"100px",fontFamily:"var(--font-mono)",fontSize:"0.58rem",letterSpacing:"0.1em",textTransform:"uppercase",color:p.accentColor,background:`${p.accentColor}14`,border:`1px solid ${p.accentColor}30`}}>{p.category}</span>
            <span className="label-sm" style={{color:"var(--fg-subtle)",alignSelf:"center"}}>{p.year}</span>
          </motion.div>
          <motion.h1 id="cs-t" className="display-xl" initial={{opacity:0,y:55}} animate={{opacity:1,y:0}} transition={{duration:1,delay:0.12,ease:EXPO}} style={{color:"var(--fg)",maxWidth:"900px"}} data-cursor="text">{p.title}</motion.h1>
          <motion.p initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:0.35}} style={{marginTop:"1.5rem",maxWidth:"600px",fontFamily:"var(--font-body)",fontSize:"var(--text-body)",lineHeight:1.7,color:"var(--fg-muted)"}}>{p.tagline}</motion.p>
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.7,delay:0.5}}
            style={{display:"grid",marginTop:"clamp(2.5rem,5vw,4rem)",paddingTop:"clamp(1.5rem,3vw,2rem)",borderTop:"1px solid var(--border)",gap:"1.5rem",transition:"border-color var(--dur-theme) ease"}} className="meta-g">
            {([["Role",p.role],["Company",p.company],["Tools",p.tools],["Status",p.status]]as const).map(([l,v])=>(
              <div key={l}><p className="label-sm" style={{color:"var(--fg-ghost)",marginBottom:"5px"}}>{l}</p><p style={{fontFamily:"var(--font-body)",fontSize:"var(--text-sm)",color:"var(--fg)"}}>{v}</p></div>
            ))}
          </motion.div>
        </div>
      </section>
      <div className="divider"/>
      <SW id="overview" label="Overview">
        <div style={{display:"grid",gap:"clamp(2.5rem,5vw,4rem)"}} className="ov-g">
          <div>
            <p style={{fontFamily:"var(--font-body)",fontSize:"clamp(1.05rem,2vw,1.25rem)",lineHeight:1.75,color:"var(--fg-muted)"}}>{p.overview}</p>
            <p style={{marginTop:"1rem",fontFamily:"var(--font-body)",fontSize:"var(--text-body)",lineHeight:1.75,color:"var(--fg-subtle)"}}>{p.context}</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:"0.85rem"}}>
            {([["Problem",p.problem],["Approach",p.approach],["Impact",p.impact]]as const).map(([l,v])=>(
              <motion.div key={l} initial={{opacity:0,x:18}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:0.5}}
                style={{padding:"1.1rem 1.25rem",borderRadius:"0.875rem",background:`${p.accentColor}07`,border:`1px solid ${p.accentColor}1e`}}>
                <p style={{fontFamily:"var(--font-mono)",fontSize:"0.56rem",letterSpacing:"0.12em",textTransform:"uppercase",color:p.accentColor,marginBottom:"6px"}}>{l}</p>
                <p style={{fontFamily:"var(--font-body)",fontSize:"var(--text-sm)",color:"var(--fg-muted)",lineHeight:1.55}}>{v}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </SW>
      <div className="divider"/>
      <SW id="pain-points" label="Pain points"><SH>What wasn't working.</SH>
        <div style={{display:"grid",gap:"1rem"}} className="pp-g">
          {p.painPoints.map((pt,i)=>(
            <motion.div key={pt.id} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5,delay:i*0.07}} className="card-glass" style={{padding:"clamp(1.5rem,3vw,2rem)"}}>
              <div aria-hidden="true" style={{fontFamily:"var(--font-display)",fontSize:"clamp(2rem,4vw,3rem)",fontWeight:700,color:"var(--fg-ghost)",lineHeight:1,marginBottom:"1rem",letterSpacing:"-0.04em"}}>{pt.id}</div>
              <h3 style={{fontFamily:"var(--font-display)",fontSize:"clamp(1.1rem,2.2vw,1.35rem)",fontWeight:700,color:"var(--fg)",marginBottom:"0.5rem",letterSpacing:"-0.015em"}}>{pt.title}</h3>
              <p style={{fontFamily:"var(--font-body)",fontSize:"var(--text-sm)",color:"var(--fg-muted)",lineHeight:1.65}}>{pt.description}</p>
            </motion.div>
          ))}
        </div>
      </SW>
      <div className="divider"/>
      <SW id="process" label="Process"><SH>How I approached it.</SH>
        {p.process.map((s,i)=>(
          <motion.div key={s.step} initial={{opacity:0,x:-18}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:0.5,delay:i*0.06}}
            style={{display:"grid",gap:"1rem",padding:"clamp(1.25rem,3vw,2rem) 0",borderBottom:"1px solid var(--border)",alignItems:"start",transition:"border-color var(--dur-theme) ease"}} className="proc-s">
            <span className="label-sm" style={{color:p.accentColor,opacity:0.75}}>{s.step}</span>
            <h3 style={{fontFamily:"var(--font-display)",fontSize:"clamp(1.1rem,2.5vw,1.5rem)",fontWeight:700,color:"var(--fg)",letterSpacing:"-0.015em"}}>{s.title}</h3>
            <p style={{fontFamily:"var(--font-body)",fontSize:"var(--text-body)",color:"var(--fg-muted)",lineHeight:1.65}}>{s.description}</p>
          </motion.div>
        ))}
      </SW>
      <div className="divider"/>
      <SW id="decisions" label="Design decisions"><SH>Key choices made.</SH>
        <div style={{display:"grid",gap:"1rem"}} className="dec-g">
          {p.decisions.map((d,i)=>(
            <motion.div key={d.title} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5,delay:i*0.07}}
              style={{padding:"clamp(1.5rem,3vw,2rem)",borderRadius:"1.25rem",background:`${p.accentColor}06`,border:`1px solid ${p.accentColor}18`,transition:`background var(--dur-mid) ease,border-color var(--dur-mid) ease,transform var(--dur-mid) var(--ease-card)`}} className="dec-card">
              <div style={{width:32,height:32,borderRadius:"50%",background:`${p.accentColor}18`,border:`1px solid ${p.accentColor}35`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"1.25rem",fontSize:"0.6rem",color:p.accentColor}} aria-hidden="true">✦</div>
              <h3 style={{fontFamily:"var(--font-display)",fontSize:"clamp(1.1rem,2.2vw,1.35rem)",fontWeight:700,color:"var(--fg)",marginBottom:"0.5rem",letterSpacing:"-0.015em"}}>{d.title}</h3>
              <p style={{fontFamily:"var(--font-body)",fontSize:"var(--text-sm)",color:"var(--fg-muted)",lineHeight:1.65}}>{d.description}</p>
            </motion.div>
          ))}
        </div>
      </SW>
      <div className="divider"/>
      <SW id="insight" label="Key insight">
        <motion.blockquote initial={{opacity:0,y:28}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.9}}
          style={{fontFamily:"var(--font-display)",fontSize:"clamp(1.5rem,3.5vw,3rem)",fontWeight:600,lineHeight:1.25,letterSpacing:"-0.02em",color:"var(--fg)",fontStyle:"italic",maxWidth:"900px",borderLeft:`3px solid ${p.accentColor}`,paddingLeft:"1.5rem"}}>
          "{p.insight}"
        </motion.blockquote>
      </SW>
      <div className="divider"/>
      <SW id="outcomes" label="Outcomes"><SH>What shipped.</SH>
        {p.outcomes.map((out,i)=>(
          <motion.div key={i} initial={{opacity:0,x:-14}} whileInView={{opacity:1,x:0}} viewport={{once:true}} transition={{duration:0.45,delay:i*0.07}}
            style={{display:"flex",alignItems:"flex-start",gap:"1rem",padding:"1.1rem 0",borderBottom:"1px solid var(--border)",transition:"border-color var(--dur-theme) ease"}}>
            <span style={{color:p.accentColor,marginTop:"4px",fontSize:"0.6rem",flexShrink:0}} aria-hidden="true">✦</span>
            <p style={{fontFamily:"var(--font-body)",fontSize:"var(--text-body)",color:"var(--fg-muted)",lineHeight:1.65}}>{out}</p>
          </motion.div>
        ))}
      </SW>
      <div className="divider"/>
      <section style={{padding:"var(--section-y) var(--page-x)",background:"var(--bg)",transition:"background var(--dur-theme) ease"}}>
        <div className="container">
          <p className="label-sm" style={{color:"var(--fg-ghost)",marginBottom:"2rem"}}>Next project</p>
          <Link href={`/case-studies/${next.slug}`} data-hover className="next-p" style={{display:"block"}}>
            <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:"1.5rem"}}>
              <h2 className="display-lg next-t" style={{color:"var(--fg)",transition:`color var(--dur-mid) ease`}}>{next.title}</h2>
              <span className="next-a" aria-hidden="true" style={{fontSize:"1.5rem",color:"var(--fg-ghost)",transition:`color var(--dur-mid) ease,transform var(--dur-mid) var(--ease-out)`,flexShrink:0,paddingBottom:"0.5rem"}}>→</span>
            </div>
            <div style={{marginTop:"1rem",display:"flex",flexWrap:"wrap",gap:"0.5rem"}}>
              {next.tags.map(t=><span key={t} className="tag">{t}</span>)}
            </div>
          </Link>
        </div>
      </section>
      <Footer/>
      <style>{`
        @media(min-width:768px){.meta-g{grid-template-columns:repeat(4,1fr)!important}.ov-g{grid-template-columns:1.2fr 0.8fr!important}.pp-g{grid-template-columns:repeat(2,1fr)!important}.proc-s{grid-template-columns:64px 200px 1fr!important}.dec-g{grid-template-columns:repeat(2,1fr)!important}}
        .dec-card:hover{background:${p.accentColor}10!important;border-color:${p.accentColor}28!important;transform:translateY(-3px)}
        .next-p:hover .next-t{color:var(--accent)!important}
        .next-p:hover .next-a{color:var(--accent)!important;transform:translateX(8px)}
      `}</style>
    </>
  );
}
