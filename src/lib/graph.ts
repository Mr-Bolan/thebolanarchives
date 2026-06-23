import type { ArchiveItem } from "@/lib/content";
import { getAllArchiveItems } from "@/lib/content";

// The Blackbox Garden graph: an Obsidian-style map of the archive. Nodes are records and
// tags; edges are explicit `related` links, shared-tag membership, and series membership.
// Pure and deterministic so the /garden route can build it at static-export time.

export type GraphNodeKind = "record" | "tag";

export type GraphNode = {
  id: string;
  kind: GraphNodeKind;
  label: string;
  degree: number;
  route?: string;
  type?: string;
  status?: string;
  slug?: string;
  tag?: string;
};

export type GraphEdgeKind = "related" | "tag" | "series";

export type GraphEdge = {
  source: string;
  target: string;
  kind: GraphEdgeKind;
};

export type ArchiveGraph = {
  generated: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export function recordNodeId(slug: string): string {
  return `record:${slug}`;
}

export function tagNodeId(tag: string): string {
  return `tag:${tag}`;
}

export function buildArchiveGraph(items: ArchiveItem[]): ArchiveGraph {
  const recordSlugs = new Set(items.map((item) => item.slug));
  const nodes = new Map<string, GraphNode>();
  const edgeKeys = new Set<string>();
  const edges: GraphEdge[] = [];

  const addEdge = (source: string, target: string, kind: GraphEdgeKind) => {
    if (source === target) return;
    // dedupe undirected pairs per kind
    const [a, b] = [source, target].sort();
    const key = `${kind}:${a}|${b}`;
    if (edgeKeys.has(key)) return;
    edgeKeys.add(key);
    edges.push({ source, target, kind });
  };

  for (const item of items) {
    nodes.set(recordNodeId(item.slug), {
      id: recordNodeId(item.slug),
      kind: "record",
      label: item.title,
      degree: 0,
      route: item.route,
      type: item.type,
      status: item.status,
      slug: item.slug,
    });
  }

  for (const item of items) {
    const fromId = recordNodeId(item.slug);

    for (const relatedSlug of item.related) {
      if (recordSlugs.has(relatedSlug)) {
        addEdge(fromId, recordNodeId(relatedSlug), "related");
      }
    }

    for (const tag of item.tags) {
      const tagId = tagNodeId(tag);
      if (!nodes.has(tagId)) {
        nodes.set(tagId, { id: tagId, kind: "tag", label: tag, degree: 0, tag });
      }
      addEdge(fromId, tagId, "tag");
    }
  }

  // series edges: connect records that share a series value
  const bySeries = new Map<string, ArchiveItem[]>();
  for (const item of items) {
    if (!item.series) continue;
    const group = bySeries.get(item.series) ?? [];
    group.push(item);
    bySeries.set(item.series, group);
  }
  for (const group of bySeries.values()) {
    const ordered = [...group].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
    for (let i = 0; i < ordered.length - 1; i += 1) {
      addEdge(recordNodeId(ordered[i].slug), recordNodeId(ordered[i + 1].slug), "series");
    }
  }

  for (const edge of edges) {
    const source = nodes.get(edge.source);
    const target = nodes.get(edge.target);
    if (source) source.degree += 1;
    if (target) target.degree += 1;
  }

  return {
    generated: new Date().toISOString(),
    nodes: [...nodes.values()],
    edges,
  };
}

export function getArchiveGraph(): ArchiveGraph {
  return buildArchiveGraph(getAllArchiveItems());
}
