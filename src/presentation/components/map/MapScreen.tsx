import { useMemo } from "react";
import ReactFlow, { Background, Controls, type Node } from "reactflow";
import "reactflow/dist/style.css";
import { useMapViewModel } from "../../viewmodels/useMapViewModel";
import { transformMapDataToFlowElements } from "./mapFlowTransformer";
import DeckViewerModal from "../common/DeckViewerModal";
import InventoryModal from "../common/InventoryModal";
import ShopNodeModal from "./ShopNodeModal";
import PlayerStatusBar from "../common/PlayerStatusBar";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import Pill from "../ui/Pill";
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
    canProceed,
    selectedNode,
    showDeckViewer,
    setShowDeckViewer,
    showInventory,
    setShowInventory,
  } = useMapViewModel();

  const { flowNodes, flowEdges } = useMemo(
    () => transformMapDataToFlowElements(mapNodes, currentNodeId),
    [mapNodes, currentNodeId],
  );

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
          <Pill>
            <span>💰</span> {gold}
          </Pill>
          {player && (
            <>
              <IconButton onClick={() => setShowInventory(true)}>
                <Backpack className="w-5 h-5" />
              </IconButton>
              <IconButton onClick={() => setShowDeckViewer(true)}>
                <BookOpen className="w-5 h-5" />
              </IconButton>
            </>
          )}
          <Button variant="danger" size="sm" onClick={abandonRun}>
            Abandonar Run
          </Button>
          <Button variant="secondary" size="sm" onClick={handleFullReset}>
            Resetar Conta
          </Button>
        </div>
      </div>
      {player && <PlayerStatusBar player={player} />}
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
        <Button onClick={handleProceedToNode} disabled={!canProceed}>
          Prosseguir
        </Button>
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
