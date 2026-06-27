export type Project = {
  slug: string; number: string; year: string; category: string; subCategory: string;
  title: string; tagline: string; problem: string; approach: string; impact: string;
  tags: string[]; role: string; company: string; tools: string; status: string;
  overview: string; context: string;
  painPoints: { id: string; title: string; description: string }[];
  decisions:  { title: string; description: string }[];
  process:    { step: string; title: string; description: string }[];
  insight: string; outcomes: string[]; accentColor: string;
};
export const projects: Project[] = [
  {
    slug:"enterprise-operations-dashboard", number:"01", year:"2024",
    category:"Enterprise · B2B", subCategory:"Dashboard · Design System",
    title:"Enterprise Operations Dashboard",
    tagline:"Simplifying high-volume review tasks through modular structure and clear hierarchy.",
    problem:"Dense, unstructured data with no visual hierarchy — critical info missed during high-volume reviews.",
    approach:"Heuristic audit → modular card redesign → component library → micro-interaction layer.",
    impact:"Faster task scanning, consistent UI, reduced engineering handoff friction.",
    tags:["Dashboard","Design System","Enterprise","B2B"],
    role:"UX Designer", company:"Embitel Technologies", tools:"Figma · FigJam · Jira", status:"Shipped",
    overview:"Designed a modular enterprise operations dashboard that simplifies high-volume review tasks. Focused on information architecture, visual hierarchy, and a reusable Figma component library.",
    context:"The dashboard was used daily by operations teams to review large volumes of structured data. Inconsistent patterns across modules made efficient scanning difficult.",
    painPoints:[
      {id:"01",title:"No visual hierarchy",description:"All data rows had equal visual weight — nothing surfaced priority or status at a glance."},
      {id:"02",title:"Inconsistent patterns",description:"Different modules used different layouts, spacing, and interaction patterns without a shared system."},
      {id:"03",title:"Poor information grouping",description:"Related data points were scattered across rows rather than logically grouped, increasing scan time."},
      {id:"04",title:"Weak feedback states",description:"Actions like save, submit, and error had inconsistent or missing feedback, leaving users uncertain."},
    ],
    decisions:[
      {title:"Modular card layout",description:"Cards create bounded visual units — each item becomes an object rather than a row in a sea of rows, improving scanability."},
      {title:"Structured component library",description:"Building reusable Figma components early prevented inconsistency and reduced engineering handoff time."},
      {title:"Hierarchy within cards",description:"A clear typographic hierarchy inside each card helped users extract information faster."},
      {title:"Consistent micro-interactions",description:"Clear feedback on all interactions reduced uncertainty about whether actions had completed."},
    ],
    process:[
      {step:"01",title:"Audit",description:"Heuristic evaluation of the existing interface — identified inconsistencies and usability gaps across modules."},
      {step:"02",title:"Define",description:"Mapped user tasks and identified the most common high-volume review workflows to prioritise."},
      {step:"03",title:"Wireframe",description:"Low-fidelity wireframes for new card layout and information grouping, reviewed with the team."},
      {step:"04",title:"Component",description:"Structured Figma component library — cards, tables, filters, status badges, feedback states."},
      {step:"05",title:"Prototype",description:"Interactive prototypes for key flows, shared with engineering for feasibility review."},
      {step:"06",title:"Handoff",description:"Annotated specs and component documentation for pixel-accurate implementation."},
    ],
    insight:"The structural changes had more impact than any visual refinement — grouping and hierarchy improved scanning even without formal testing metrics.",
    outcomes:[
      "Modular card layout with consistent hierarchy across all data types",
      "Reusable Figma component library — improved consistency and reduced handoff time",
      "Consistent micro-interactions for all action states (hover, load, success, error)",
      "Better information grouping reduced cognitive load during high-volume reviews",
    ],
    accentColor:"#C8FF57",
  },
  {
    slug:"customer-engagement-platform", number:"02", year:"2024",
    category:"E-commerce · Loyalty", subCategory:"Platform · Multi-store",
    title:"Customer Engagement Platform",
    tagline:"Reducing steps in loyalty enrollment and building scalable UI patterns across store modules.",
    problem:"Loyalty enrollment had too many steps — causing drop-offs and inconsistent UI across store modules.",
    approach:"Workflow audit → enrollment simplification → scalable pattern library → feedback improvements.",
    impact:"Reduced drop-off through leaner flow; consistent UI scaled across multiple store configs.",
    tags:["E-commerce","Loyalty","Platform","Flows"],
    role:"UI/UX Designer", company:"Embitel Technologies", tools:"Figma · FigJam · Jira", status:"Shipped",
    overview:"Redesigned loyalty enrollment and account management flows for a multi-store loyalty platform. Focused on reducing steps, improving completion, and building scalable UI patterns.",
    context:"The platform served multiple retail clients with shared UI but per-store configuration. Enrollment had accumulated steps as features were added without revisiting the overall journey.",
    painPoints:[
      {id:"01",title:"Excess enrollment steps",description:"The enrollment flow asked for too much information upfront, increasing drop-off before completion."},
      {id:"02",title:"Inconsistent UI patterns",description:"Cards, forms, and badges used different spacing and interaction patterns across modules."},
      {id:"03",title:"Unclear content hierarchy",description:"Related information was not grouped clearly, making forms and account sections hard to scan."},
      {id:"04",title:"Missing feedback states",description:"Form submissions lacked success and error states, causing users to repeat actions unnecessarily."},
    ],
    decisions:[
      {title:"Reduced enrollment steps",description:"Deferred non-critical fields to post-registration, reducing the upfront ask and improving completion."},
      {title:"Scalable UI pattern library",description:"Reusable cards, forms, and badge components kept patterns consistent as the platform scaled."},
      {title:"Improved content hierarchy",description:"Consistent grouping and typographic hierarchy reduced parse time per section."},
      {title:"Explicit feedback on actions",description:"Added success, error, and loading states to all form interactions."},
    ],
    process:[
      {step:"01",title:"Audit",description:"Mapped existing enrollment and account flows, identified drop-off points and pattern inconsistencies."},
      {step:"02",title:"Research",description:"User interviews and survey analysis to identify the most common points of confusion."},
      {step:"03",title:"IA",description:"Simplified enrollment journey — removed deferred steps, reordered remaining steps logically."},
      {step:"04",title:"Patterns",description:"Built scalable UI components (cards, forms, badges) for use across multiple store modules."},
      {step:"05",title:"Prototype",description:"Prototyped key flows, reviewed with frontend and QA teams for feasibility and edge cases."},
      {step:"06",title:"Iterate",description:"Iterated based on team feedback and internal review before final handoff."},
    ],
    insight:"The enrollment drop-off was not a UI problem — it was about asking too much too early. Restructuring the information architecture had more impact than any visual change.",
    outcomes:[
      "Reduced steps in loyalty enrollment by deferring non-critical fields",
      "Scalable UI pattern library used across multiple store module configurations",
      "Consistent feedback states across all form interactions",
      "Improved content grouping and hierarchy across account management views",
    ],
    accentColor:"#FF9F57",
  },
  {
    slug:"ai-powered-support-assistant", number:"03", year:"2025",
    category:"AI · Conversational UI", subCategory:"Chat Interface · Support",
    title:"AI-Powered Support Assistant",
    tagline:"Designing a conversational UI that guides users to resolution and hands off cleanly when needed.",
    problem:"Support assistant lacked message type clarity and clean handoff — causing friction and confusion.",
    approach:"Flow mapping → message type system → quick reply patterns → explicit handoff design.",
    impact:"Structured conversation states, reduced free-text friction, clean AI-to-human escalation.",
    tags:["AI","Conversational UI","Support","Chat"],
    role:"UX Designer", company:"Embitel Technologies", tools:"Figma · FigJam", status:"Shipped (v1)",
    overview:"Designed the conversational interface for an AI-driven support assistant — covering message type architecture, quick reply patterns, guided workflows, and the AI-to-human handoff interaction.",
    context:"The product team was building an AI-first support layer to handle common queries before escalation. The challenge was designing an interface that clearly communicated what the assistant could and could not do.",
    painPoints:[
      {id:"01",title:"No message type clarity",description:"All messages looked identical — questions, confirmations, errors, guidance — making conversations hard to scan."},
      {id:"02",title:"Weak guided workflows",description:"Multi-step resolution paths required free-text input rather than guided options, increasing friction."},
      {id:"03",title:"Poor readability",description:"Dense message blocks with no breathing room made it hard to follow the conversation thread."},
      {id:"04",title:"Unstructured handoff",description:"When AI escalated to human, there was no clear signal to the user or context summary for the agent."},
    ],
    decisions:[
      {title:"Structured message types",description:"Distinct visual treatments for AI response, system message, user input, error, and confirmation."},
      {title:"Quick reply for guided flows",description:"Quick reply options replaced open-ended text for common paths, reducing friction."},
      {title:"Readability-first layout",description:"Generous spacing, clear sender labelling, and timestamps improved legibility in longer threads."},
      {title:"Explicit handoff state",description:"A clear handoff state with context summary made escalation feel intentional and transparent."},
    ],
    process:[
      {step:"01",title:"Flows",description:"Mapped common support intents and designed conversation flow diagrams for each resolution path."},
      {step:"02",title:"Types",description:"Defined message type system — AI response, error, confirmation, system message, quick reply."},
      {step:"03",title:"Wireframe",description:"Low-fidelity wireframes for conversation layout, quick reply patterns, and handoff state."},
      {step:"04",title:"Design",description:"High-fidelity UI covering full conversation states — empty, loading, error, and handoff."},
      {step:"05",title:"Align",description:"Worked with engineering to align on interaction logic — AI response timing and fallback states."},
      {step:"06",title:"Iterate",description:"Iterated on quick reply placement, handoff copy, and error handling based on team review."},
    ],
    insight:"Adding quick reply buttons for common paths eliminated the moments where users felt stuck — the most impactful change was structural, not visual.",
    outcomes:[
      "Message type system covering all conversation states — AI, user, system, error, confirmation",
      "Quick reply and guided workflow patterns reducing free-text friction on common paths",
      "Clear handoff interaction with context summary for receiving agents",
      "Readability improvements across message layout, spacing, and sender labelling",
      "Interaction logic aligned with engineering before build — reduced post-handoff defects",
    ],
    accentColor:"#57D4FF",
  },
];
