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
import { useGameViewModel } from "../../viewmodels/useGameViewModel";
import { useAccountStore } from "../../../data/stores/accountStore";
import DeckViewerModal from "../common/DeckViewerModal";
import InventoryModal from "../common/InventoryModal";
import ShopNodeModal from "./ShopNodeModal";
import { BookOpen, Backpack } from "lucide-react";

const nodeTypes = {};
const edgeTypes = {};
const defaultEdgeOptions = {
  type: "default",
  markerEnd: { type: MarkerType.ArrowClosed, color: "#6b7280" },
  style: { stroke: "#6b7280", strokeWidth: 2 },
};

export default function MapScreen() {
  const navigate = useNavigate();
  const { resetAccount } = useAccountStore();
  const {
    mapNodes,
    currentNodeId,
    player,
    gold,
    selectNode,
    proceedToNode,
    resetRun,
    shopInventory,
    acknowledgeShop,
    setShopInventory,
  } = useGameViewModel();

  const [showDeckViewer, setShowDeckViewer] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  const { flowNodes, flowEdges } = useMemo(() => {
    const nodeTypeStyles = {
      battle: { background: "#ef4444", border: "#dc2626" },
      rest: { background: "#10b981", border: "#059669" },
      boss: { background: "#8b5cf6", border: "#7c3aed" },
      shop: { background: "#fbbf24", border: "#d97706" },
    };
    const flowNodes: Node[] = mapNodes.map((node) => ({
      id: node.id,
      position: node.position,
      data: {
        label:
          node.type === "battle"
            ? `⚔️ Nv.${node.level}`
            : node.type === "rest"
              ? "🏕️ Descanso"
              : node.type === "shop"
                ? "🛒 Loja"
                : `👑 Nv.${node.level}`,
      },
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
      })),
    );
    return { flowNodes, flowEdges };
  }, [mapNodes, currentNodeId]);

  const selectedNode = mapNodes.find((n) => n.id === currentNodeId);
  const canProceed =
    selectedNode && selectedNode.unlocked && !selectedNode.completed;

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    const n = mapNodes.find((x) => x.id === node.id);
    if (n && n.unlocked && !n.completed) selectNode(node.id);
  };

  const handleProceed = () => {
    if (!selectedNode) return;
    if (selectedNode.type === "shop" && selectedNode.shopInventory) {
      setShopInventory(selectedNode.shopInventory);
      return;
    }
    proceedToNode();
  };

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-4 bg-gray-800 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-yellow-400">PokéLink - Mapa</h1>
        <div className="flex gap-2">
          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-700 rounded-lg">
            <span>💰</span> {gold}
          </span>
          {player && (
            <>
              <button
                onClick={() => setShowInventory(true)}
                className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
              >
                <Backpack className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowDeckViewer(true)}
                className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
              >
                <BookOpen className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            onClick={() => {
              resetRun();
              navigate("/");
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
          >
            Abandonar Run
          </button>
          <button
            onClick={() => {
              resetAccount();
              resetRun();
              navigate("/");
            }}
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
              className="h-2 bg-green-500 rounded-full"
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
                {selectedNode.type === "rest"
                  ? "descanso"
                  : selectedNode.type === "shop"
                    ? "loja"
                    : selectedNode.type}
              </span>{" "}
              {selectedNode.type !== "rest" &&
                selectedNode.type !== "shop" &&
                `(Nível ${selectedNode.level})`}
            </p>
          )}
        </div>
        <button
          onClick={handleProceed}
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
          pokemon={player.pokemon}
          onClose={() => setShowDeckViewer(false)}
        />
      )}
      {showInventory && (
        <InventoryModal onClose={() => setShowInventory(false)} />
      )}
      {shopInventory && (
        <ShopNodeModal
          inventory={shopInventory}
          onClose={() => {
            acknowledgeShop();
            setShopInventory(null);
          }}
        />
      )}
    </div>
  );
}
