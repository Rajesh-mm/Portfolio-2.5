import type { Metadata } from "next";
import "./globals.css";
import CustomCursor from "../components/CustomCursor";
import Nav           from "@/components/Nav";
import SmoothScroll  from "@/components/SmoothScroll";
import ThemeProvider from "@/components/ThemeProvider";
import PageLoader    from "@/components/PageLoader";

export const metadata: Metadata = {
  title: "Rajesh M Mysoremath — UX Designer",
  description: "UX Designer at Embitel Technologies, Bengaluru. Research-led design for enterprise B2B dashboards, e-commerce loyalty platforms, and AI-driven interfaces.",
  keywords: ["UX Designer","Product Design","Figma","Enterprise UX","Bengaluru","B2B"],
  authors: [{ name: "Rajesh M Mysoremath" }],
  openGraph: { title:"Rajesh M Mysoremath — UX Designer", description:"Research-led UX design for enterprise B2B, e-commerce, and AI interfaces.", type:"website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
        <meta name="theme-color" content="#0D0D0D"/>
        {/* Blocking script: set data-theme before first paint — prevents flash */}
        <script dangerouslySetInnerHTML={{__html:`(function(){try{var t=localStorage.getItem("pf-theme");var p=window.matchMedia("(prefers-color-scheme:light)").matches?"light":"dark";document.documentElement.setAttribute("data-theme",t||p)}catch(e){}})();`}}/>
      </head>
      <body>
        <ThemeProvider>
          <PageLoader/>
          <a href="#main-content" className="skip-link">Skip to content</a>
          <CustomCursor/>
          <SmoothScroll>
            <Nav/>
            <main id="main-content" tabIndex={-1}>{children}</main>
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
