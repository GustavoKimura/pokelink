import type { Node, Edge } from "reactflow";
import { MarkerType, Position } from "reactflow";
import type { MapNode } from "../../../domain/models/Map";

const nodeTypeStyles = {
  battle: { background: "#ef4444", border: "#dc2626" },
  rest: { background: "#10b981", border: "#059669" },
  boss: { background: "#8b5cf6", border: "#7c3aed" },
  shop: { background: "#fbbf24", border: "#d97706" },
};

const getNodeLabel = (node: MapNode): string => {
  switch (node.type) {
    case "battle":
      return `⚔️ Nv.${node.level}`;
    case "rest":
      return "🏕️ Descanso";
    case "shop":
      return "🛒 Loja";
    case "boss":
      return `👑 Nv.${node.level}`;
    default:
      return "";
  }
};

export const transformMapDataToFlowElements = (
  mapNodes: MapNode[],
  currentNodeId: string | null,
): { flowNodes: Node[]; flowEdges: Edge[] } => {
  const flowNodes: Node[] = mapNodes.map((node) => ({
    id: node.id,
    position: node.position,
    data: { label: getNodeLabel(node) },
    style: {
      background: nodeTypeStyles[node.type].background,
      border: `2px solid ${nodeTypeStyles[node.type].border}`,
      color: "white",
      borderRadius: "8px",
      padding: "10px",
      width: 120,
      opacity: node.completed ? 0.5 : node.unlocked ? 1 : 0.4,
      cursor: node.unlocked && !node.completed ? "pointer" : "not-allowed",
      boxShadow: node.id === currentNodeId ? "0 0 0 3px #fbbf24" : "none",
    },
    sourcePosition: Position.Top,
    targetPosition: Position.Bottom,
  }));

  const flowEdges: Edge[] = mapNodes.flatMap((node) =>
    node.connections.map((targetId) => ({
      id: `${node.id}-${targetId}`,
      source: node.id,
      target: targetId,
      sourceHandle: "top",
      targetHandle: "bottom",
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed, color: "#6b7280" },
      style: { stroke: "#6b7280", strokeWidth: 2 },
    })),
  );

  return { flowNodes, flowEdges };
};
