import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import "@/styles/global.css";

export const metadata: Metadata = {
  title: "thebolanarchives",
  description: "A private index of public experiments.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
