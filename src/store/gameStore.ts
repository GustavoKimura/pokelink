import { create } from "zustand";
import type { GameRunState, PlayerPokemon } from "../types";
import { generateMap, unlockNextNodes } from "../utils/mapGenerator";

interface GameStore {
  runState: GameRunState;
  setPlayer: (player: PlayerPokemon) => void;
  startRun: () => void;
  completeNode: (nodeId: string) => void;
  setCurrentNode: (nodeId: string | null) => void;
  updatePlayer: (player: PlayerPokemon) => void;
  setRunPhase: (phase: GameRunState["runPhase"]) => void;
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

  completeNode: (nodeId) =>
    set((state) => {
      const updatedNodes = state.runState.mapNodes.map((node) =>
        node.id === nodeId ? { ...node, completed: true } : node,
      );
      const unlockedNodes = unlockNextNodes(updatedNodes, nodeId);
      return {
        runState: {
          ...state.runState,
          mapNodes: unlockedNodes,
          runPhase: "map",
        },
      };
    }),

  setCurrentNode: (nodeId) =>
    set((state) => ({
      runState: { ...state.runState, currentNodeId: nodeId },
    })),

  updatePlayer: (player) =>
    set((state) => ({
      runState: { ...state.runState, player },
    })),

  setRunPhase: (phase) =>
    set((state) => ({
      runState: { ...state.runState, runPhase: phase },
    })),

  resetRun: () => set({ runState: initialRunState }),
}));
