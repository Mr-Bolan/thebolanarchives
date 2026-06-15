import type { ReactNode } from "react";

type SideNoteProps = {
  children: ReactNode;
  kind?: "note" | "warning" | "definition" | "evidence";
};

const labels = {
  note: "note",
  warning: "warning",
  definition: "definition",
  evidence: "evidence",
};

export function SideNote({ children, kind = "note" }: SideNoteProps) {
  return (
    <aside className="side-note" data-kind={kind} role="note">
      <p className="side-note-label">{labels[kind]}</p>
      <div>{children}</div>
    </aside>
  );
}
