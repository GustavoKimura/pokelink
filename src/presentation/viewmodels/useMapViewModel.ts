import { useState, useCallback } from "react";
import { useGameStore } from "../../data/stores/useGameStore";
import { useAccountStore } from "../../data/stores/accountStore";
import { useNavigate } from "react-router-dom";

export const useMapViewModel = () => {
  const navigate = useNavigate();
  const [showDeckViewer, setShowDeckViewer] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  const mapNodes = useGameStore((state) => state.mapNodes);
  const currentNodeId = useGameStore((state) => state.currentNodeId);
  const player = useGameStore((state) => state.player);
  const gold = useGameStore((state) => state.gold);
  const shopInventory = useGameStore((state) => state.shopInventory);
  const selectNode = useGameStore((state) => state.selectNode);
  const resetRun = useGameStore((state) => state.resetRun);
  const acknowledgeShop = useGameStore((state) => state.acknowledgeShop);
  const setShopInventory = useGameStore((state) => state.setShopInventory);
  const proceedToNode = useGameStore((state) => state.proceedToNode);
  const { resetAccount } = useAccountStore();

  const selectedNode = mapNodes.find((n) => n.id === currentNodeId);
  const canProceed =
    selectedNode && selectedNode.unlocked && !selectedNode.completed;

  const handleProceedToNode = useCallback(() => {
    if (!selectedNode) return;

    if (selectedNode.type === "shop" && selectedNode.shopInventory) {
      setShopInventory(selectedNode.shopInventory);
    }
    proceedToNode();
  }, [selectedNode, setShopInventory, proceedToNode]);

  const abandonRun = useCallback(() => {
    resetRun();
    navigate("/");
  }, [resetRun, navigate]);

  const handleFullReset = useCallback(() => {
    resetAccount();
    resetRun();
    navigate("/");
  }, [resetAccount, resetRun, navigate]);

  return {
    mapNodes,
    currentNodeId,
    player,
    gold,
    shopInventory,
    selectNode,
    acknowledgeShop,
    setShopInventory,
    handleProceedToNode,
    abandonRun,
    handleFullReset,
    selectedNode,
    canProceed,
    showDeckViewer,
    setShowDeckViewer,
    showInventory,
    setShowInventory,
  };
};
