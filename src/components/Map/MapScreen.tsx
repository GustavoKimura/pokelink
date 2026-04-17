import { useNavigate } from "react-router-dom";
import ReactFlow, { Background, Controls } from "reactflow";
import type { Node, Edge } from "reactflow";
import "reactflow/dist/style.css";
import type { MapNode } from "../../types/map";
import { useGameStore } from "../../store/gameStore";
import { useAccountStore } from "../../store/accountStore";

interface MapScreenProps {
  nodes: MapNode[];
  currentNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
  onProceed: () => void;
}

const nodeTypes = {
  battle: { background: "#ef4444", border: "#dc2626" },
  rest: { background: "#10b981", border: "#059669" },
  boss: { background: "#8b5cf6", border: "#7c3aed" },
};

export default function MapScreen({
  nodes,
  currentNodeId,
  onNodeSelect,
  onProceed,
}: MapScreenProps) {
  const navigate = useNavigate();
  const { resetAccount } = useAccountStore();
  const { resetRun } = useGameStore();

  const flowNodes: Node[] = nodes.map((node) => ({
    id: node.id,
    position: node.position,
    data: {
      label: `${node.type === "battle" ? "⚔️" : node.type === "rest" ? "🏕️" : "👑"} Nv.${node.level}`,
      type: node.type,
      completed: node.completed,
      unlocked: node.unlocked,
      current: node.id === currentNodeId,
    },
    style: {
      background: nodeTypes[node.type].background,
      border: `2px solid ${nodeTypes[node.type].border}`,
      color: "white",
      borderRadius: "8px",
      padding: "10px",
      width: 120,
      opacity: node.completed ? 0.5 : node.unlocked ? 1 : 0.4,
      cursor: node.unlocked && !node.completed ? "pointer" : "not-allowed",
      boxShadow: node.id === currentNodeId ? "0 0 0 3px #fbbf24" : "none",
    },
  }));

  const flowEdges: Edge[] = nodes.flatMap((node) =>
    node.connections.map((targetId) => ({
      id: `${node.id}-${targetId}`,
      source: node.id,
      target: targetId,
      animated: true,
      style: { stroke: "#6b7280" },
    })),
  );

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    const mapNode = nodes.find((n) => n.id === node.id);
    if (mapNode && mapNode.unlocked && !mapNode.completed) {
      onNodeSelect(node.id);
    }
  };

  const selectedNode = nodes.find((n) => n.id === currentNodeId);
  const canProceed = selectedNode && !selectedNode.completed;

  const handleQuitRun = () => {
    resetRun();
    navigate("/");
  };

  const handleResetAccount = () => {
    resetAccount();
    resetRun();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-4 bg-gray-800 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-yellow-400">PokéLink - Mapa</h1>
        <div className="flex gap-2">
          <button
            onClick={handleQuitRun}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
          >
            Abandonar Run
          </button>
          <button
            onClick={handleResetAccount}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
          >
            Resetar Conta
          </button>
        </div>
      </div>

      <div className="flex-1">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodeClick={handleNodeClick}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
        >
          <Background color="#374151" gap={16} />
          <Controls />
        </ReactFlow>
      </div>

      <div className="p-4 bg-gray-800 flex justify-between items-center">
        <div>
          {selectedNode && (
            <p>
              Nó selecionado:{" "}
              <span className="font-bold">{selectedNode.type}</span> (Nível{" "}
              {selectedNode.level})
            </p>
          )}
        </div>
        <button
          onClick={onProceed}
          disabled={!canProceed}
          className={`
            px-6 py-2 rounded-lg font-semibold
            ${
              canProceed
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-600 cursor-not-allowed"
            }
          `}
        >
          Prosseguir
        </button>
      </div>
    </div>
  );
}
