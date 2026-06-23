"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { ArchiveGraph as ArchiveGraphData, GraphNode } from "@/lib/graph";

type ArchiveGraphProps = {
  graph: ArchiveGraphData;
};

type Positioned = GraphNode & { x: number; y: number };

const WIDTH = 880;
const HEIGHT = 620;

export function ArchiveGraph({ graph }: ArchiveGraphProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusTag = searchParams.get("tag") ?? undefined;
  const [hoverId, setHoverId] = useState<string | null>(null);
  const activeId = hoverId ?? (focusTag ? `tag:${focusTag}` : null);

  const positioned = useMemo(() => layout(graph), [graph]);
  const adjacency = useMemo(() => buildAdjacency(graph), [graph]);

  const focusId = activeId;
  const focusNeighbors = focusId ? adjacency.get(focusId) ?? new Set<string>() : null;

  const isDimmed = (id: string) => {
    if (!focusId) return false;
    if (id === focusId) return false;
    return !focusNeighbors?.has(id);
  };

  const isEdgeActive = (source: string, target: string) => {
    if (!focusId) return false;
    return source === focusId || target === focusId;
  };

  return (
    <div className="archive-graph" data-has-focus={focusId ? "true" : "false"}>
      <div className="archive-graph-viewport">
        <svg
          className="archive-graph-svg"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={`archive graph: ${graph.nodes.length} nodes, ${graph.edges.length} connections`}
          preserveAspectRatio="xMidYMid meet"
        >
          <g className="archive-graph-edges">
            {graph.edges.map((edge) => {
              const a = positioned.get(edge.source);
              const b = positioned.get(edge.target);
              if (!a || !b) return null;
              const dim = focusId && !isEdgeActive(edge.source, edge.target);
              return (
                <line
                  key={`${edge.kind}:${edge.source}:${edge.target}`}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className="archive-graph-edge"
                  data-kind={edge.kind}
                  data-dim={dim ? "true" : "false"}
                />
              );
            })}
          </g>
          <g className="archive-graph-nodes">
            {[...positioned.values()].map((node) => {
              const radius = nodeRadius(node);
              const dim = isDimmed(node.id);
              const label = node.kind === "tag" ? `#${node.label}` : node.label;
              return (
                <g
                  key={node.id}
                  className="archive-graph-node"
                  data-kind={node.kind}
                  data-dim={dim ? "true" : "false"}
                  data-active={node.id === focusId ? "true" : "false"}
                  transform={`translate(${node.x} ${node.y})`}
                  tabIndex={0}
                  role="button"
                  aria-label={
                    node.kind === "record"
                      ? `record: ${node.label} (${node.type}), ${node.degree} connections`
                      : `tag: ${node.label}, ${node.degree} records`
                  }
                  onMouseEnter={() => setHoverId(node.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onFocus={() => setHoverId(node.id)}
                  onBlur={() => setHoverId(null)}
                  onClick={() => activate(node, router)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      activate(node, router);
                    }
                  }}
                >
                  <circle r={radius} className="archive-graph-dot" />
                  <text className="archive-graph-label" x={radius + 4} y={4}>
                    {label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <p className="archive-graph-hint">
        records and tags. hover or focus a node to trace its connections; click a record to
        open it, or a tag to gather everything it touches.
      </p>

      <details className="archive-graph-fallback">
        <summary>list view</summary>
        <ul className="archive-graph-list">
          {graph.nodes
            .filter((node) => node.kind === "record")
            .map((node) => (
              <li key={node.id}>
                <Link href={node.route ?? "/index"}>{node.label}</Link>
                <span className="archive-graph-list-meta">
                  {" "}
                  — {node.type}, {node.degree} connections
                </span>
              </li>
            ))}
        </ul>
      </details>
    </div>
  );
}

function activate(node: GraphNode, router: ReturnType<typeof useRouter>) {
  if (node.kind === "record" && node.route) {
    router.push(node.route);
  }
}

function nodeRadius(node: GraphNode): number {
  const base = node.kind === "record" ? 7 : 4;
  return base + Math.min(node.degree, 6);
}

function buildAdjacency(graph: ArchiveGraphData): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  const link = (a: string, b: string) => {
    if (!map.has(a)) map.set(a, new Set());
    map.get(a)!.add(b);
  };
  for (const edge of graph.edges) {
    link(edge.source, edge.target);
    link(edge.target, edge.source);
  }
  return map;
}

// Deterministic Fruchterman-Reingold layout. No randomness so server and client agree and
// the static export is stable.
function layout(graph: ArchiveGraphData): Map<string, Positioned> {
  const nodes = graph.nodes;
  const n = Math.max(nodes.length, 1);
  const area = WIDTH * HEIGHT;
  const k = Math.sqrt(area / n) * 0.72;
  const index = new Map(nodes.map((node, i) => [node.id, i]));

  // seed on a circle, deterministic by index
  const pos = nodes.map((_, i) => {
    const angle = (i / n) * Math.PI * 2;
    const ring = 1 - (i % 3) * 0.18;
    return {
      x: WIDTH / 2 + Math.cos(angle) * (WIDTH / 3) * ring,
      y: HEIGHT / 2 + Math.sin(angle) * (HEIGHT / 3) * ring,
    };
  });

  const edges = graph.edges
    .map((edge) => [index.get(edge.source), index.get(edge.target)] as const)
    .filter(([a, b]) => a !== undefined && b !== undefined) as Array<readonly [number, number]>;

  const iterations = 220;
  let temperature = WIDTH / 8;
  const cool = temperature / (iterations + 1);

  for (let step = 0; step < iterations; step += 1) {
    const disp = pos.map(() => ({ x: 0, y: 0 }));

    for (let i = 0; i < n; i += 1) {
      for (let j = i + 1; j < n; j += 1) {
        let dx = pos[i].x - pos[j].x;
        let dy = pos[i].y - pos[j].y;
        let dist = Math.hypot(dx, dy) || 0.01;
        if (dist < 0.01) {
          dx = (i - j) * 0.01;
          dy = 0.01;
          dist = 0.01;
        }
        const repulse = (k * k) / dist;
        const ux = (dx / dist) * repulse;
        const uy = (dy / dist) * repulse;
        disp[i].x += ux;
        disp[i].y += uy;
        disp[j].x -= ux;
        disp[j].y -= uy;
      }
    }

    for (const [a, b] of edges) {
      const dx = pos[a].x - pos[b].x;
      const dy = pos[a].y - pos[b].y;
      const dist = Math.hypot(dx, dy) || 0.01;
      const attract = (dist * dist) / k;
      const ux = (dx / dist) * attract;
      const uy = (dy / dist) * attract;
      disp[a].x -= ux;
      disp[a].y -= uy;
      disp[b].x += ux;
      disp[b].y += uy;
    }

    for (let i = 0; i < n; i += 1) {
      const d = Math.hypot(disp[i].x, disp[i].y) || 0.01;
      pos[i].x += (disp[i].x / d) * Math.min(d, temperature);
      pos[i].y += (disp[i].y / d) * Math.min(d, temperature);
      pos[i].x = Math.max(30, Math.min(WIDTH - 30, pos[i].x));
      pos[i].y = Math.max(24, Math.min(HEIGHT - 24, pos[i].y));
    }

    temperature -= cool;
  }

  const out = new Map<string, Positioned>();
  nodes.forEach((node, i) => {
    out.set(node.id, { ...node, x: round(pos[i].x), y: round(pos[i].y) });
  });
  return out;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
