import type { MDXComponents } from "mdx/types";
import { ExperimentFrame } from "@/components/experiments/ExperimentFrame";
import { CodeBlock } from "@/components/writing/CodeBlock";
import { DiagramBlock } from "@/components/writing/DiagramBlock";
import { OpenQuestions } from "@/components/writing/OpenQuestions";
import { SideNote } from "@/components/writing/SideNote";
import { TerminalBlock } from "@/components/writing/TerminalBlock";

// Single source of truth for the writing components available inside MDX. Both the Next.js
// `useMDXComponents` hook (mdx-components.tsx) and the runtime MdxRenderer consume this so
// the two registrations cannot drift apart.
export const sharedMdxComponents: MDXComponents = {
  CodeBlock,
  DiagramBlock,
  ExperimentFrame,
  OpenQuestions,
  SideNote,
  TerminalBlock,
  pre: CodeBlock,
};
