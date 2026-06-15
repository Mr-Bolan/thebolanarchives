import type { MDXComponents } from "mdx/types";
import { ExperimentFrame } from "@/components/experiments/ExperimentFrame";
import { CodeBlock } from "@/components/writing/CodeBlock";
import { DiagramBlock } from "@/components/writing/DiagramBlock";
import { OpenQuestions } from "@/components/writing/OpenQuestions";
import { SideNote } from "@/components/writing/SideNote";
import { TerminalBlock } from "@/components/writing/TerminalBlock";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    CodeBlock,
    DiagramBlock,
    ExperimentFrame,
    OpenQuestions,
    SideNote,
    TerminalBlock,
    pre: CodeBlock,
    ...components,
  };
}
