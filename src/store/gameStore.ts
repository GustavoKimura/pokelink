import { create } from "zustand";
import type { GameRunState, PlayerPokemon } from "../types";
import { generateMap } from "../utils/mapGenerator";

interface GameStore {
  runState: GameRunState;
  setPlayer: (player: PlayerPokemon) => void;
  startRun: () => void;
  setCurrentNode: (nodeId: string | null) => void;
  resetRun: () => void;
}

const initialRunState: GameRunState = {
  mapNodes: [],
  currentNodeId: null,
  player: null,
  runPhase: "map",
};

export const useGameStore = create<GameStore>((set) => ({
  runState: initialRunState,

  setPlayer: (player) =>
    set((state) => ({
      runState: { ...state.runState, player },
    })),

  startRun: () =>
    set((state) => {
      const nodes = generateMap();
      const startNodes = nodes.filter((n) => n.unlocked && !n.completed);
      return {
        runState: {
          ...state.runState,
          mapNodes: nodes,
          currentNodeId: startNodes[0]?.id || null,
          runPhase: "map",
        },
      };
    }),

  setCurrentNode: (nodeId) =>
    set((state) => ({
      runState: { ...state.runState, currentNodeId: nodeId },
    })),

  resetRun: () => set({ runState: initialRunState }),
}));
