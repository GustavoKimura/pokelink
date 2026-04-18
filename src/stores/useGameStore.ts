import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { GameSlice, LevelUpStep, StoreState, StoreSlice } from "./types";
import { createPlayerSlice } from "./slices/createPlayerSlice";
import { createMapSlice } from "./slices/createMapSlice";
import { createBattleSlice } from "./slices/createBattleSlice";
import { REST_HEAL_PERCENT } from "../config/gameConfig";
import {
  calculateXpGain,
  checkLevelUp,
  calculateCardDisplayDamage,
  calculateShield,
} from "../services/battleService";
import { checkEvolution } from "../services/evolutionService";
import { getLevelUpMoveOptions } from "../services/deckService";

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
      set({
        player: { ...player, currentHp: newHp },
        restHealAmount: heal,
        phase: "rest",
      });
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

    set({ phase: "level_up" });
    const xpGain = calculateXpGain(node.level);
    const updatedPlayer = { ...player, runXp: player.runXp + xpGain };
    const steps: LevelUpStep[] = [];
    let currentPlayerForCalc = { ...updatedPlayer };

    while (true) {
      const levelUpResult = checkLevelUp(
        currentPlayerForCalc.runXp,
        currentPlayerForCalc.level,
      );
      if (!levelUpResult) break;
      const { newLevel, remainingXp } = levelUpResult;
      const oldStats = {
        level: currentPlayerForCalc.level,
        maxHp: currentPlayerForCalc.maxHp,
        attackPower: calculateCardDisplayDamage(currentPlayerForCalc, {
          id: "sample",
          name: "Sample",
          type: "normal",
          power: 40,
          pp: 35,
          energyCost: 1,
          description: "",
          damageClass: "physical",
        }),
        speed: currentPlayerForCalc.pokemon.stats.speed,
        shield: calculateShield(
          currentPlayerForCalc.pokemon.stats.defense,
          currentPlayerForCalc.pokemon.stats.specialDefense,
          currentPlayerForCalc.level,
        ),
      };

      const oldPokemon = currentPlayerForCalc.pokemon;
      currentPlayerForCalc = {
        ...currentPlayerForCalc,
        level: newLevel,
        runXp: remainingXp,
      };
      const evolution = await checkEvolution(oldPokemon, newLevel);
      if (evolution) {
        currentPlayerForCalc.pokemon = evolution;
        steps.push({
          type: "evolution",
          newLevel,
          player: { ...currentPlayerForCalc },
          oldPokemon,
          evolvedPokemon: evolution,
          previousStats: oldStats,
        });
      } else {
        const options = await getLevelUpMoveOptions(
          currentPlayerForCalc.pokemon,
          newLevel,
        );
        steps.push({
          type: "level",
          newLevel,
          player: { ...currentPlayerForCalc },
          options,
          previousStats: oldStats,
        });
      }
    }
    set({ player: currentPlayerForCalc, levelUpQueue: steps });
    get().acknowledgeLevelUp();
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
      levelUpQueue: [],
    });
  },
});

export const useGameStore = create<StoreState>()(
  devtools((...a) => ({
    ...createGameSlice(...a),
    ...createPlayerSlice(...a),
    ...createMapSlice(...a),
    ...createBattleSlice(...a),
  })),
);
