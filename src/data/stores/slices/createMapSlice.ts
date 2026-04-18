import type { MapSlice, StoreSlice } from "../types";
import {
  generateMap,
  unlockNextNodes,
} from "../../../domain/services/mapService";

export const createMapSlice: StoreSlice<MapSlice> = (set, get) => ({
  mapNodes: [],
  currentNodeId: null,
  restHealAmount: null,
  initializeMap: () => {
    const mapNodes = generateMap();
    const startNodes = mapNodes.filter((n) => n.unlocked && !n.completed);
    set({ mapNodes, currentNodeId: startNodes[0]?.id || null });
  },
  selectNode: (nodeId) => set({ currentNodeId: nodeId }),
  completeNode: (nodeId) => {
    const updatedNodes = unlockNextNodes(get().mapNodes, nodeId);
    const finalNodes = updatedNodes.map((n) =>
      n.id === nodeId ? { ...n, completed: true } : n,
    );
    set({ mapNodes: finalNodes, currentNodeId: null });
  },
  acknowledgeRest: () => {
    const { currentNodeId } = get();
    set({ restHealAmount: null, phase: "map" });
    if (currentNodeId) get().completeNode(currentNodeId);
  },
});
