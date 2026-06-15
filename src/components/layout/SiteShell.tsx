import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Nav, type NavItem } from "@/components/navigation/Nav";

const navItems: NavItem[] = [
  { href: "/", label: "home" },
  { href: "/entries", label: "entries" },
  { href: "/field-notes", label: "field notes" },
  { href: "/build-logs", label: "build logs" },
  { href: "/fragments", label: "fragments" },
  { href: "/patterns", label: "patterns" },
  { href: "/experiments", label: "experiments" },
  { href: "/graveyard", label: "graveyard" },
  { href: "/index", label: "index" },
  { href: "/about", label: "about" },
];

type SiteShellProps = {
  children: ReactNode;
  className?: string;
};

export function SiteShell({ children, className }: SiteShellProps) {
  return (
    <div className={["site-shell", className].filter(Boolean).join(" ")}>
      <a className="skip-link" href="#main-content">
        skip to content
      </a>
      <Header />
      <div className="site-header">
        <div className="site-header-inner">
          <Nav items={navItems} />
        </div>
      </div>
      <main className="site-main" id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
