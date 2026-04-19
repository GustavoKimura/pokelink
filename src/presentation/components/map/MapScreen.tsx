import { useMemo, useState } from "react";
import ReactFlow, { Background, Controls, type Node } from "reactflow";
import "reactflow/dist/style.css";
import { useMapViewModel } from "../../viewmodels/useMapViewModel";
import { transformMapDataToFlowElements } from "./mapFlowTransformer";
import DeckViewerModal from "../common/DeckViewerModal";
import InventoryModal from "../common/InventoryModal";
import ShopNodeModal from "./ShopNodeModal";
import { BookOpen, Backpack } from "lucide-react";

export default function MapScreen() {
  const {
    mapNodes,
    currentNodeId,
    player,
    gold,
    selectNode,
    shopInventory,
    acknowledgeShop,
    setShopInventory,
    handleProceedToNode,
    abandonRun,
    handleFullReset,
  } = useMapViewModel();

  const [showDeckViewer, setShowDeckViewer] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  const { flowNodes, flowEdges } = useMemo(
    () => transformMapDataToFlowElements(mapNodes, currentNodeId),
    [mapNodes, currentNodeId],
  );

  const selectedNode = mapNodes.find((n) => n.id === currentNodeId);
  const canProceed =
    selectedNode && selectedNode.unlocked && !selectedNode.completed;

  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    const mapNode = mapNodes.find((n) => n.id === node.id);
    if (mapNode && mapNode.unlocked && !mapNode.completed) {
      selectNode(node.id);
    }
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
            onClick={abandonRun}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
          >
            Abandonar Run
          </button>
          <button
            onClick={handleFullReset}
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
          onClick={handleProceedToNode}
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
          level={player.level}
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
