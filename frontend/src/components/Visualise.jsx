
import "@xyflow/react/dist/style.css";
import { useMemo } from "react";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  Position,
} from "@xyflow/react";

import dagre from "dagre";

const NODE_WIDTH = 170;
const NODE_HEIGHT = 50;

function getLayout(nodes, edges) {
  // Remove self-referencing edges and invalid connections
  const nodeIds = new Set(nodes.map((node) => node.id));

  const cleanEdges = edges.filter(
    (edge) =>
      edge.source !== edge.target &&
      nodeIds.has(edge.source) &&
      nodeIds.has(edge.target)
  );

  // Merge duplicate edges while preserving line numbers and types
  const edgeMap = new Map();

  cleanEdges.forEach((edge) => {
    const key = `${edge.source}->${edge.target}->${edge.type || "imports"}`;

    if (!edgeMap.has(key)) {
      edgeMap.set(key, {
        source: edge.source,
        target: edge.target,
        type: edge.type || "imports",
        lines: [],
      });
    }

    if (edge.line != null) {
      edgeMap.get(key).lines.push(edge.line);
    }
  });

  const mergedEdges = [...edgeMap.values()];

  // Dagre graph layout
  const g = new dagre.graphlib.Graph();

  g.setDefaultEdgeLabel(() => ({}));

  g.setGraph({
    rankdir: "LR",
    nodesep: 50,
    ranksep: 140,
  });

  nodes.forEach((node) => {
    g.setNode(node.id, {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    });
  });

  mergedEdges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  // Convert backend nodes into React Flow nodes
  const flowNodes = nodes.map((node) => {
    const pos = g.node(node.id);

    return {
      id: node.id,

      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },

      sourcePosition: Position.Right,
      targetPosition: Position.Left,

      data: {
        label: node.label,
        ...node,
      },
    };
  });

  // Convert backend edges into React Flow edges
  const flowEdges = mergedEdges.map((edge, index) => ({
    id: `edge-${index}`,

    source: edge.source,
    target: edge.target,

    type: "smoothstep",

    label: [
      edge.type,
      edge.lines.length
        ? `line ${[...new Set(edge.lines)].join(", ")}`
        : null,
    ]
      .filter(Boolean)
      .join(" · "),

    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: "#60a5fa",
    },

    style: {
      stroke: "#60a5fa",
      strokeWidth: 1.5,
    },

    labelStyle: {
      fontSize: 10,
      fill: "white",
    },

    labelBgStyle: {
      fill: "#0f172a",
    },

    labelBgPadding: [4, 2],
  }));

  return {
    nodes: flowNodes,
    edges: flowEdges,
  };
}

export default function Visualise({
  nodes = [],
  edges = [],
  onNodeSelect,
  selectedNode,
}) {
  // Recalculate layout only when nodes or edges change
  const layout = useMemo(
    () =>
      nodes.length
        ? getLayout(nodes, edges)
        : null,
    [nodes, edges]
  );

  // Highlight selected node
  const styledNodes = useMemo(() => {
    if (!layout) return [];

    return layout.nodes.map((node) => {
      const selected = node.id === selectedNode;

      return {
        ...node,

        style: {
          width: NODE_WIDTH,
          background: selected ? "#1d4ed8" : "#1e293b",
          color: "white",

          border: selected
            ? "1px solid #93c5fd"
            : "1px solid #475569",

          borderRadius: 8,
          fontSize: 13,
          cursor: "pointer",
        },
      };
    });
  }, [layout, selectedNode]);

  if (!layout) {
    return (
      <p className="p-6 text-slate-300">
        No graph data available.
      </p>
    );
  }

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={styledNodes}
        edges={layout.edges}
        fitView

        onNodeClick={(_, node) =>
          onNodeSelect?.(node.id)
        }

        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        nodesDraggable={false}
      >
        <Background color="#334155" />

        <Controls
          showZoom={false}
          showInteractive={false}
        />

        <MiniMap
          style={{ background: "#0f172a" }}
          nodeColor="#60a5fa"
          maskColor="rgba(0,0,0,0.6)"
        />
      </ReactFlow>
    </div>
  );
}
