"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = {
  href: string;
  label: string;
};

type NavProps = {
  items: NavItem[];
  currentPath?: string;
};

export function Nav({ items, currentPath }: NavProps) {
  const pathname = currentPath ?? usePathname();

  return (
    <nav aria-label="primary" className="site-nav">
      {items.map((item) => (
        <Link
          aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
          href={item.href}
          key={item.href}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
