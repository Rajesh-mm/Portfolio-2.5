"use client";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
const EXPO:[number,number,number,number]=[0.16,1,0.3,1];
const PROC=[
  {n:"01",t:"Understand",d:"Start with the problem space. Talk to users, review analytics, audit the existing experience to learn before designing."},
  {n:"02",t:"Define",d:"Synthesise research into clear problem statements, user needs, and constraints. Align with stakeholders before going wide."},
  {n:"03",t:"Explore",d:"Low-fidelity ideation — sketches, flows, wireframes. Test assumptions early before committing to high-fidelity."},
  {n:"04",t:"Design",d:"High-fidelity UI with interaction detail, edge cases, error states, and accessibility baked in — not bolted on."},
  {n:"05",t:"Validate",d:"Usability testing, design crits, and internal review. Iterate fast before handoff."},
  {n:"06",t:"Ship",d:"Annotated specs, close developer collaboration, and iteration post-launch. The work isn't done at handoff."},
];
const SKILLS:Record<string,string[]>={
  "UX Methods":["User Research","Usability Testing","Heuristic Evaluation","Information Architecture","Wireframing","Prototyping","Task Flow Mapping"],
  "Design":["Interaction Design","Visual Design","Design Systems","Component Architecture","Responsive Design","Accessibility (WCAG)","Developer Handoff"],
  "Tools":["Figma","FigJam","Jira","Confluence","Maze","Miro","Notion"],
  "Domain":["Enterprise B2B","E-commerce","AI / Conversational UI","Loyalty Platforms","Operations Dashboards"],
};
const TL=[
  {y:"2024–Present",r:"UX Designer",c:"Embitel Technologies",d:"Designing enterprise B2B dashboards, e-commerce loyalty platforms, and AI support interfaces. Working cross-functionally with PM, engineering, and QA teams."},
  {y:"2023–2024",r:"UX Design Intern",c:"Embitel Technologies",d:"Contributed to UX research and design projects during an internship. Completed UX certification, built a portfolio of case studies, and deepened Figma and design-systems skills."},
];
function SL({children}:{children:React.ReactNode}){return<motion.p className="label" initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.5,ease:EXPO}} style={{color:"var(--accent)",marginBottom:"1rem",transition:"color var(--dur-theme) ease"}}>{children}</motion.p>}
function ST({children}:{children:React.ReactNode}){return<motion.h2 className="display-md" initial={{opacity:0,y:28}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.8,ease:EXPO}} style={{color:"var(--fg)",marginBottom:"clamp(2.5rem,5vw,4rem)"}}>{children}</motion.h2>}
export default function AboutPage(){return(
  <>
    <section aria-labelledby="ab-h" style={{background:"var(--bg)",padding:"calc(64px + clamp(3rem,6vw,5rem)) var(--page-x) var(--section-y)",transition:"background var(--dur-theme) ease"}}>
      <div className="container">
        <motion.p className="label" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} style={{color:"var(--fg-subtle)",marginBottom:"1.25rem"}}>About</motion.p>
        <div style={{display:"grid",gap:"clamp(2.5rem,5vw,5rem)"}} className="ab-hg">
          <motion.h1 id="ab-h" className="display-xl" initial={{opacity:0,y:50}} animate={{opacity:1,y:0}} transition={{duration:0.9,ease:EXPO}} style={{color:"var(--fg)"}}>
            Rajesh M<br/><em style={{fontStyle:"italic",color:"var(--accent)",transition:"color var(--dur-theme) ease"}}>Mysoremath.</em>
          </motion.h1>
          <motion.div initial={{opacity:0,y:28}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:0.3}}>
            <p style={{fontFamily:"var(--font-body)",fontSize:"var(--text-body)",lineHeight:1.75,color:"var(--fg-muted)"}}>UX Designer at Embitel Technologies, based in Bengaluru. Research-led, collaborative, and focused on designs that survive contact with engineering and real users.</p>
            <p style={{fontFamily:"var(--font-body)",fontSize:"var(--text-body)",lineHeight:1.75,color:"var(--fg-muted)",marginTop:"1rem"}}>I work across enterprise B2B dashboards, e-commerce platforms, and AI-driven interfaces — with a bias for clear IA, strong hierarchy, and handoff quality.</p>
            <div style={{marginTop:"2rem",display:"flex",flexWrap:"wrap",gap:"1rem"}}>
              <a href="mailto:rajeshmm5321@gmail.com" data-hover data-magnetic className="btn-primary">Get in touch →</a>
              <a href="https://www.linkedin.com/in/rajeshmmysoremath/" target="_blank" rel="noopener noreferrer" data-hover className="btn-ghost">LinkedIn →</a>
              {/* Behance disabled per design decision */}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
    <div className="divider"/>
    <section style={{background:"var(--bg)",padding:"var(--section-y) var(--page-x)",transition:"background var(--dur-theme) ease"}}>
      <div className="container"><SL>How I work</SL><ST>The process.</ST>
        <div style={{display:"grid",gap:"1rem"}} className="proc-g">
          {PROC.map((s,i)=>(
            <motion.div key={s.n} initial={{opacity:0,y:28}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.55,delay:i*0.07}} className="card-glass" style={{padding:"clamp(1.5rem,3vw,2rem)"}}>
              <div style={{fontFamily:"var(--font-display)",fontSize:"clamp(2.5rem,5vw,3.5rem)",fontWeight:700,color:"var(--fg-ghost)",lineHeight:1,marginBottom:"1rem",letterSpacing:"-0.04em"}}>{s.n}</div>
              <h3 style={{fontFamily:"var(--font-display)",fontSize:"clamp(1.2rem,2.5vw,1.5rem)",fontWeight:700,color:"var(--fg)",marginBottom:"0.5rem",letterSpacing:"-0.015em"}}>{s.t}</h3>
              <p style={{fontFamily:"var(--font-body)",fontSize:"var(--text-sm)",color:"var(--fg-muted)",lineHeight:1.65}}>{s.d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    <div className="divider"/>
    <section style={{background:"var(--bg)",padding:"var(--section-y) var(--page-x)",transition:"background var(--dur-theme) ease"}}>
      <div className="container"><SL>Skills &amp; tools</SL><ST>What I bring.</ST>
        <div style={{display:"grid",gap:"clamp(2rem,4vw,3.5rem)"}} className="sk-g">
          {Object.entries(SKILLS).map(([cat,items],i)=>(
            <motion.div key={cat} initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.55,delay:i*0.07}}>
              <h3 className="label-sm" style={{color:"var(--fg-subtle)",marginBottom:"1rem"}}>{cat}</h3>
              <div style={{display:"flex",flexWrap:"wrap",gap:"0.5rem"}}>
                {items.map(sk=><span key={sk} className="tag">{sk}</span>)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    <div className="divider"/>
    <section style={{background:"var(--bg)",padding:"var(--section-y) var(--page-x)",transition:"background var(--dur-theme) ease"}}>
      <div className="container"><SL>Experience</SL><ST>Timeline.</ST>
        {TL.map((item,i)=>(
          <motion.div key={i} initial={{opacity:0,y:22}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:0.55,delay:i*0.1}}
            style={{display:"grid",padding:"clamp(1.5rem,3vw,2.5rem) 0",borderBottom:"1px solid var(--border)",gap:"1rem",transition:"border-color var(--dur-theme) ease"}} className="tl-r">
            <span className="label-sm" style={{color:"var(--fg-subtle)"}}>{item.y}</span>
            <div>
              <h3 style={{fontFamily:"var(--font-display)",fontSize:"clamp(1.1rem,2.5vw,1.5rem)",fontWeight:700,color:"var(--fg)",letterSpacing:"-0.015em"}}>{item.r}</h3>
              <p className="label-sm" style={{color:"var(--accent)",marginTop:"4px",transition:"color var(--dur-theme) ease"}}>{item.c}</p>
            </div>
            <p style={{fontFamily:"var(--font-body)",fontSize:"var(--text-body)",color:"var(--fg-muted)",lineHeight:1.7}}>{item.d}</p>
          </motion.div>
        ))}
      </div>
    </section>
    <Footer/>
    <style>{`@media(min-width:640px){.proc-g{grid-template-columns:repeat(2,1fr)!important}}@media(min-width:768px){.ab-hg{grid-template-columns:1.1fr 0.9fr!important}.proc-g{grid-template-columns:repeat(3,1fr)!important}.sk-g{grid-template-columns:repeat(2,1fr)!important}.tl-r{grid-template-columns:160px 200px 1fr!important;align-items:start}}`}</style>
  </>
);}
