import { useGameStore } from "../../data/stores/useGameStore";
import { useAccountStore } from "../../data/stores/accountStore";
import { useNavigate } from "react-router-dom";

export const useMapViewModel = () => {
  const navigate = useNavigate();
  const {
    mapNodes,
    currentNodeId,
    player,
    gold,
    shopInventory,
    selectNode,
    resetRun,
    acknowledgeShop,
    setShopInventory,
    proceedToNode,
  } = useGameStore((state) => ({
    mapNodes: state.mapNodes,
    currentNodeId: state.currentNodeId,
    player: state.player,
    gold: state.gold,
    shopInventory: state.shopInventory,
    selectNode: state.selectNode,
    resetRun: state.resetRun,
    acknowledgeShop: state.acknowledgeShop,
    setShopInventory: state.setShopInventory,
    proceedToNode: state.proceedToNode,
  }));
  const { resetAccount } = useAccountStore();

  const handleProceedToNode = () => {
    const selectedNode = mapNodes.find((n) => n.id === currentNodeId);
    if (!selectedNode) return;

    if (selectedNode.type === "shop" && selectedNode.shopInventory) {
      setShopInventory(selectedNode.shopInventory);
    }
    proceedToNode();
  };

  const abandonRun = () => {
    resetRun();
    navigate("/");
  };

  const handleFullReset = () => {
    resetAccount();
    resetRun();
    navigate("/");
  };

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
  };
};
