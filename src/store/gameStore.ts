import { create } from "zustand";
import type { GameRunState, PlayerPokemon } from "../types";
import { generateMap } from "../utils/mapGenerator";

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
      const completedNode = state.runState.mapNodes.find(
        (n) => n.id === nodeId,
      );
      if (!completedNode) return state;

      const updatedNodes = state.runState.mapNodes.map((node) => {
        if (node.id === nodeId) {
          return { ...node, completed: true };
        }
        if (completedNode.connections.includes(node.id)) {
          return { ...node, unlocked: true };
        }
        if (!node.completed) {
          return { ...node, unlocked: false };
        }
        return node;
      });

      return {
        runState: {
          ...state.runState,
          mapNodes: updatedNodes,
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
