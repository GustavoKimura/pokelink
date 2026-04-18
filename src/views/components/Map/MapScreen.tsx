import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  type Node,
  type Edge,
  MarkerType,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import type { MapNode } from "../../../models/Map";
import type { PlayerPokemon } from "../../../models/Player";
import { useGameStore } from "../../../stores/gameStore";
import { useAccountStore } from "../../../stores/accountStore";
import DeckViewerModal from "../Common/DeckViewerModal";
import { BookOpen } from "lucide-react";

interface MapScreenProps {
  nodes: MapNode[];
  currentNodeId: string | null;
  player: PlayerPokemon | null;
  onNodeSelect: (nodeId: string) => void;
  onProceed: () => void;
}

const nodeTypes = {};
const edgeTypes = {};
const defaultEdgeOptions = {
  type: "default",
  markerEnd: { type: MarkerType.ArrowClosed, color: "#6b7280" },
  style: { stroke: "#6b7280", strokeWidth: 2 },
};

export default function MapScreen({
  nodes,
  currentNodeId,
  player,
  onNodeSelect,
  onProceed,
}: MapScreenProps) {
  const navigate = useNavigate();
  const { resetAccount } = useAccountStore();
  const { resetRun } = useGameStore();
  const [showDeckViewer, setShowDeckViewer] = useState(false);

  const { flowNodes, flowEdges } = useMemo(() => {
    const nodeTypeStyles = {
      battle: { background: "#ef4444", border: "#dc2626" },
      rest: { background: "#10b981", border: "#059669" },
      boss: { background: "#8b5cf6", border: "#7c3aed" },
    };

    const flowNodes: Node[] = nodes.map((node) => {
      const label =
        node.type === "battle"
          ? `⚔️ Nv.${node.level}`
          : node.type === "rest"
            ? "🏕️ Descanso"
            : `👑 Nv.${node.level}`;

      return {
        id: node.id,
        position: node.position,
        data: { label },
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
      };
    });

    const flowEdges: Edge[] = nodes.flatMap((node) =>
      node.connections.map((targetId) => ({
        id: `${node.id}-${targetId}`,
        source: node.id,
        target: targetId,
        sourceHandle: "top",
        targetHandle: "bottom",
        animated: true,
      })),
    );

    return { flowNodes, flowEdges };
  }, [nodes, currentNodeId]);

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    const mapNode = nodes.find((n) => n.id === node.id);
    if (mapNode && mapNode.unlocked && !mapNode.completed) {
      onNodeSelect(node.id);
    }
  };

  const selectedNode = nodes.find((n) => n.id === currentNodeId);
  const canProceed =
    selectedNode && selectedNode.unlocked && !selectedNode.completed;

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
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-4 bg-gray-800 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-yellow-400">PokéLink - Mapa</h1>
        <div className="flex gap-2">
          {player && (
            <button
              onClick={() => setShowDeckViewer(true)}
              className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
              title="Ver Baralho da Run"
            >
              <BookOpen className="w-5 h-5" />
            </button>
          )}
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

      {player && (
        <div className="px-4 py-2 bg-gray-800/80 border-b border-gray-700 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <img
              src={player.pokemon.sprites.animated.front}
              alt={player.pokemon.name}
              className="w-8 h-8 pixelated"
            />
            <span className="font-bold">{player.pokemon.name}</span>
          </div>
          <span>Nv. {player.level}</span>
          <div className="flex-1 h-2 bg-gray-700 rounded-full">
            <div
              className="h-2 bg-green-500 rounded-full transition-all"
              style={{ width: `${(player.currentHp / player.maxHp) * 100}%` }}
            />
          </div>
          <span>
            {player.currentHp}/{player.maxHp}
          </span>
          <div className="flex items-center gap-1">
            <span>XP:</span>
            <div className="w-24 h-1.5 bg-gray-700 rounded-full">
              <div
                className="h-1.5 bg-blue-400 rounded-full"
                style={{
                  width: `${(player.runXp / player.xpToNextLevel) * 100}%`,
                }}
              />
            </div>
            <span>
              {player.runXp}/{player.xpToNextLevel}
            </span>
          </div>
        </div>
      )}

      <div className="flex-1 w-full">
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          onNodeClick={handleNodeClick}
          fitView
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          elevateEdgesOnSelect={false}
        >
          <Background color="#374151" gap={16} />
          <Controls showFitView={false} showInteractive={false} />
        </ReactFlow>
      </div>

      <div className="p-4 bg-gray-800 flex justify-between items-center">
        <div>
          {selectedNode && (
            <p>
              Nó selecionado:{" "}
              <span className="font-bold">
                {selectedNode.type === "rest" ? "descanso" : selectedNode.type}
              </span>{" "}
              {selectedNode.type !== "rest" && `(Nível ${selectedNode.level})`}
            </p>
          )}
        </div>
        <button
          onClick={onProceed}
          disabled={!canProceed}
          className={`px-6 py-2 rounded-lg font-semibold ${
            canProceed
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-600 cursor-not-allowed"
          }`}
        >
          Prosseguir
        </button>
      </div>

      {showDeckViewer && player && (
        <DeckViewerModal
          title="Baralho da Run"
          runDeck={player.runDeck}
          onClose={() => setShowDeckViewer(false)}
        />
      )}
    </div>
  );
}
