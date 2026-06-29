"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import type { ArchiveGraph as ArchiveGraphData, GraphNode } from "@/lib/graph";

type ArchiveGraphProps = {
  graph: ArchiveGraphData;
};

type Positioned = GraphNode & { x: number; y: number };
type ViewBox = { x: number; y: number; width: number; height: number };
type DragState =
  | {
      kind: "node";
      id: string;
      startGraph: { x: number; y: number };
      startClient: { x: number; y: number };
      origin: { x: number; y: number };
      followers: Array<{ id: string; origin: { x: number; y: number } }>;
      moved: boolean;
    }
  | {
      kind: "pan";
      startClient: { x: number; y: number };
      origin: ViewBox;
      moved: boolean;
    };

const WIDTH = 880;
const HEIGHT = 620;
const INITIAL_VIEWBOX: ViewBox = { x: 0, y: 0, width: WIDTH, height: HEIGHT };
const MIN_VIEWBOX_WIDTH = 260;
const MAX_VIEWBOX_WIDTH = WIDTH * 1.8;

export function ArchiveGraph({ graph }: ArchiveGraphProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const focusTag = searchParams.get("tag") ?? undefined;
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [viewBox, setViewBox] = useState<ViewBox>(INITIAL_VIEWBOX);
  const [movedNodes, setMovedNodes] = useState<Record<string, { x: number; y: number }>>({});
  const [isDragging, setIsDragging] = useState(false);
  const activeId = hoverId ?? (focusTag ? `tag:${focusTag}` : null);

  const layoutPositions = useMemo(() => layout(graph), [graph]);
  const positioned = useMemo(() => {
    const out = new Map(layoutPositions);
    for (const [id, position] of Object.entries(movedNodes)) {
      const node = out.get(id);
      if (node) out.set(id, { ...node, ...position });
    }
    return out;
  }, [layoutPositions, movedNodes]);
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

  const pointFromEvent = (event: { clientX: number; clientY: number }) => {
    const svg = svgRef.current;
    const rect = svg?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: viewBox.x + ((event.clientX - rect.left) / rect.width) * viewBox.width,
      y: viewBox.y + ((event.clientY - rect.top) / rect.height) * viewBox.height,
    };
  };

  const zoomAt = (factor: number, center = viewBoxCenter(viewBox)) => {
    setViewBox((current) => {
      const width = clamp(current.width * factor, MIN_VIEWBOX_WIDTH, MAX_VIEWBOX_WIDTH);
      const height = width * (HEIGHT / WIDTH);
      const ratio = width / current.width;
      return {
        x: center.x - (center.x - current.x) * ratio,
        y: center.y - (center.y - current.y) * ratio,
        width,
        height,
      };
    });
  };

  const resetGraph = () => {
    setViewBox(INITIAL_VIEWBOX);
    setMovedNodes({});
  };

  const moveNode = (id: string, x: number, y: number) => {
    moveNodes([{ id, x, y }]);
  };

  const moveNodes = (updates: Array<{ id: string; x: number; y: number }>) => {
    setMovedNodes((current) => ({
      ...current,
      ...Object.fromEntries(
        updates.map(({ id, x, y }) => [
          id,
          {
            x: clamp(x, 24, WIDTH - 24),
            y: clamp(y, 24, HEIGHT - 24),
          },
        ]),
      ),
    }));
  };

  const startNodeDrag = (event: ReactPointerEvent<SVGGElement>, node: Positioned) => {
    event.preventDefault();
    event.stopPropagation();
    svgRef.current?.setPointerCapture(event.pointerId);
    const startGraph = pointFromEvent(event);
    dragRef.current = {
      kind: "node",
      id: node.id,
      startGraph,
      startClient: { x: event.clientX, y: event.clientY },
      origin: { x: node.x, y: node.y },
      followers: tagFollowers(node, positioned, adjacency),
      moved: false,
    };
    setHoverId(node.id);
    setIsDragging(true);
  };

  const startPan = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      kind: "pan",
      startClient: { x: event.clientX, y: event.clientY },
      origin: viewBox,
      moved: false,
    };
    setIsDragging(true);
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const clientDelta = {
      x: event.clientX - drag.startClient.x,
      y: event.clientY - drag.startClient.y,
    };
    if (Math.hypot(clientDelta.x, clientDelta.y) > 3) drag.moved = true;

    if (drag.kind === "pan") {
      const svg = svgRef.current;
      const rect = svg?.getBoundingClientRect();
      if (!rect) return;
      setViewBox({
        ...drag.origin,
        x: drag.origin.x - (clientDelta.x / rect.width) * drag.origin.width,
        y: drag.origin.y - (clientDelta.y / rect.height) * drag.origin.height,
      });
      return;
    }

    const point = pointFromEvent(event);
    const dx = point.x - drag.startGraph.x;
    const dy = point.y - drag.startGraph.y;
    moveNodes([
      { id: drag.id, x: drag.origin.x + dx, y: drag.origin.y + dy },
      ...drag.followers.map((follower) => ({
        id: follower.id,
        x: follower.origin.x + dx,
        y: follower.origin.y + dy,
      })),
    ]);
  };

  const handlePointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (drag?.kind === "node" && !drag.moved) {
      const node = positioned.get(drag.id);
      if (node) activate(node, router);
    }
  };

  const handleWheel = (event: ReactWheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    zoomAt(event.deltaY > 0 ? 1.12 : 0.88, pointFromEvent(event));
  };

  const nudgeNode = (node: Positioned, dx: number, dy: number) => {
    moveNode(node.id, node.x + dx, node.y + dy);
  };

  return (
    <div
      className="archive-graph"
      data-has-focus={focusId ? "true" : "false"}
      data-dragging={isDragging ? "true" : "false"}
    >
      <div className="archive-graph-controls" aria-label="graph controls">
        <button type="button" onClick={() => zoomAt(0.8)} aria-label="zoom in">
          +
        </button>
        <button type="button" onClick={() => zoomAt(1.25)} aria-label="zoom out">
          -
        </button>
        <button type="button" onClick={resetGraph}>
          reset
        </button>
      </div>
      <div className="archive-graph-viewport">
        <svg
          ref={svgRef}
          className="archive-graph-svg"
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          role="img"
          aria-label={`archive graph: ${graph.nodes.length} nodes, ${graph.edges.length} connections`}
          preserveAspectRatio="xMidYMid meet"
          onPointerDown={startPan}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onWheel={handleWheel}
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
                  onPointerDown={(event) => startNodeDrag(event, node)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      activate(node, router);
                      return;
                    }
                    const amount = event.shiftKey ? 24 : 8;
                    if (event.key === "ArrowUp") {
                      event.preventDefault();
                      nudgeNode(node, 0, -amount);
                    } else if (event.key === "ArrowDown") {
                      event.preventDefault();
                      nudgeNode(node, 0, amount);
                    } else if (event.key === "ArrowLeft") {
                      event.preventDefault();
                      nudgeNode(node, -amount, 0);
                    } else if (event.key === "ArrowRight") {
                      event.preventDefault();
                      nudgeNode(node, amount, 0);
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
        records and tags. zoom, pan the field, or drag a node clear; click a record to open
        it, or a tag to gather everything it touches.
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
  } else if (node.kind === "tag" && node.tag) {
    router.push(`/garden?tag=${encodeURIComponent(node.tag)}`);
  }
}

function viewBoxCenter(viewBox: ViewBox) {
  return {
    x: viewBox.x + viewBox.width / 2,
    y: viewBox.y + viewBox.height / 2,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
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

function tagFollowers(
  node: Positioned,
  positioned: Map<string, Positioned>,
  adjacency: Map<string, Set<string>>,
) {
  if (node.kind !== "record") return [];
  return [...(adjacency.get(node.id) ?? [])]
    .map((id) => positioned.get(id))
    .filter((neighbor): neighbor is Positioned => neighbor?.kind === "tag")
    .map((neighbor) => ({ id: neighbor.id, origin: { x: neighbor.x, y: neighbor.y } }));
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
