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
const NODE_HEIGHT = 44;

function getLayout(graph) {
  // 1. remove self loops (main.jsx -> main.jsx)
  const cleanEdges = graph.edges.filter((e) => e.source !== e.target);

  // 2. merge duplicate edges between the same 2 files
  //    ex: line 3 + line 7 becomes "lines 3, 7"
  const edgeMap = {};
  cleanEdges.forEach((edge) => {
    const key = `${edge.source}->${edge.target}`;
    if (!edgeMap[key]) {
      edgeMap[key] = { source: edge.source, target: edge.target, lines: [] };
    }
    edgeMap[key].lines.push(edge.line);
  });
  const mergedEdges = Object.values(edgeMap);

  // 3. let dagre decide the positions
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "LR", nodesep: 40, ranksep: 140 });

  graph.nodes.forEach((node) => {
    g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });
  mergedEdges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const nodes = graph.nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      id: node.id,
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: { label: node.label },
      style: {
        width: NODE_WIDTH,
        background: "#1e293b",
        color: "white",
        border: "1px solid #475569",
        borderRadius: 8,
        fontSize: 13,
      },
    };
  });

  const edges = mergedEdges.map((edge, index) => ({
    id: `edge-${index}`,
    source: edge.source,
    target: edge.target,
    type: "smoothstep",
    label: `line ${edge.lines.join(", ")}`,
    markerEnd: { type: MarkerType.ArrowClosed, color: "#60a5fa" },
    style: { stroke: "#60a5fa", strokeWidth: 1.5 },
    labelStyle: { fontSize: 10, fill: "white" },
    labelBgStyle: { fill: "#0f172a" },
    labelBgPadding: [4, 2],
  }));

  return { nodes, edges };
}

export default function Visualise({ graph }) {
  const layout = useMemo(
    () => (graph?.nodes?.length ? getLayout(graph) : null),
    [graph]
  );

  if (!layout) {
    return <p className="p-6">No graph data available.</p>;
  }

  const { nodes, edges } = layout;

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        nodesDraggable={false}
      >
        <Background color="#334155" />
        <Controls showZoom={false} showInteractive={false} />
        <MiniMap
          style={{ background: "#0f172a" }}
          nodeColor="#60a5fa"
          maskColor="rgba(0,0,0,0.6)"
        />
      </ReactFlow>
    </div>
  );
}