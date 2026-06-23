import type { MDXComponents } from "mdx/types";
import { sharedMdxComponents } from "@/components/writing/sharedMdxComponents";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...sharedMdxComponents,
    ...components,
  };
}
