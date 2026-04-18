import { useGameStore } from "../../data/stores/useGameStore";

export const useGameViewModel = () => {
  return useGameStore();
};
