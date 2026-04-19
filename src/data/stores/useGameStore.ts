import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { GameSlice, StoreState, StoreSlice } from "./types";
import { createPlayerSlice } from "./slices/createPlayerSlice";
import { createMapSlice } from "./slices/createMapSlice";
import { createBattleSlice } from "./slices/createBattleSlice";
import { createInventorySlice } from "./slices/createInventorySlice";
import { REST_HEAL_PERCENT } from "../../domain/config/gameConfig";
import { calculateXpGain } from "../../domain/services/battleService";
import { processLevelUps } from "../../domain/services/levelingService";

const createGameSlice: StoreSlice<GameSlice> = (set, get) => ({
  phase: "loading",
  initializeRun: async (starterId, customDeck) => {
    set({ phase: "loading" });
    await get().initializePlayer(starterId, customDeck);
    get().initializeMap();
    set({ phase: "map" });
  },
  proceedToNode: async () => {
    const { currentNodeId, mapNodes, player } = get();
    if (!currentNodeId || !player) return;
    const node = mapNodes.find((n) => n.id === currentNodeId);
    if (!node) return;

    if (node.type === "rest") {
      const heal = Math.floor(player.maxHp * REST_HEAL_PERCENT);
      const newHp = Math.min(player.maxHp, player.currentHp + heal);
      const actualHeal = newHp - player.currentHp;
      set({
        player: { ...player, currentHp: newHp },
        restHealAmount: actualHeal,
        phase: "rest",
      });
      return;
    }

    if (node.type === "shop") {
      set({ phase: "shop" });
      return;
    }

    set({ phase: "battle" });
    await get().initializeBattle(node);
  },
  endBattle: async (victory) => {
    if (!victory) {
      set({ phase: "defeat" });
      return;
    }
    const { player, currentNodeId, mapNodes } = get();
    const node = mapNodes.find((n) => n.id === currentNodeId);
    if (!player || !node) return;

    if (node.type === "boss") {
      set({ phase: "victory" });
      return;
    }

    const xpGain = calculateXpGain(node.level);
    const playerWithXp = { ...player, runXp: player.runXp + xpGain };
    const { updatedPlayer, levelUpSteps } = await processLevelUps(playerWithXp);

    if (levelUpSteps.length > 0) {
      set({ player: updatedPlayer, levelUpQueue: levelUpSteps });
      get().acknowledgeLevelUp();
    } else {
      set({ phase: "map", player: updatedPlayer });
      if (currentNodeId) {
        get().completeNode(currentNodeId);
      }
    }
  },
  resetRun: () => {
    set({
      phase: "loading",
      player: null,
      mapNodes: [],
      currentNodeId: null,
      enemies: [],
      turnOrder: [],
      currentTurnIndex: 0,
      battleLog: [],
      selectedCard: null,
      isTargeting: false,
      levelUpData: null,
      evolutionData: null,
      restHealAmount: null,
      shopInventory: null,
      levelUpQueue: [],
      gold: 100,
      inventory: [],
    });
  },
});

export const useGameStore = create<StoreState>()(
  devtools((...a) => ({
    ...createGameSlice(...a),
    ...createPlayerSlice(...a),
    ...createMapSlice(...a),
    ...createBattleSlice(...a),
    ...createInventorySlice(...a),
  })),
);
