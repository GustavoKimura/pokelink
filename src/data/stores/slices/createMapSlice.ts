import type { MapSlice, StoreSlice } from "../types";
import {
  generateMap,
  unlockNextNodes,
} from "../../../domain/services/mapService";

export const createMapSlice: StoreSlice<MapSlice> = (set, get) => ({
  mapNodes: [],
  currentNodeId: null,
  restHealAmount: null,
  shopInventory: null,
  initializeMap: () => {
    const mapNodes = generateMap();
    const startNodes = mapNodes.filter((n) => n.unlocked && !n.completed);
    set({ mapNodes, currentNodeId: startNodes[0]?.id || null });
  },
  selectNode: (nodeId) => {
    set({ currentNodeId: nodeId });
  },
  completeNode: (nodeId) => {
    const updatedNodes = unlockNextNodes(get().mapNodes, nodeId);
    const finalNodes = updatedNodes.map((n) =>
      n.id === nodeId ? { ...n, completed: true } : n,
    );
    set({ mapNodes: finalNodes, currentNodeId: null, shopInventory: null });
  },
  acknowledgeRest: () => {
    const { currentNodeId, player } = get();
    if (!currentNodeId || !player) return;
    const heal = Math.floor(player.maxHp * 0.5);
    const newHp = Math.min(player.maxHp, player.currentHp + heal);
    const actualHeal = newHp - player.currentHp;
    set({
      player: { ...player, currentHp: newHp },
      restHealAmount: actualHeal,
      phase: "map",
    });
    get().completeNode(currentNodeId);
  },
  acknowledgeShop: () => {
    const { currentNodeId } = get();
    set({ shopInventory: null, phase: "map" });
    if (currentNodeId) get().completeNode(currentNodeId);
  },
  setShopInventory: (inventory) => set({ shopInventory: inventory }),
});
