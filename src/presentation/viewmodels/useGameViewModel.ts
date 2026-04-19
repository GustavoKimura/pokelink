import { useGameStore } from "../../data/stores/useGameStore";

export const useGameViewModel = () => {
  const resetRun = useGameStore((state) => state.resetRun);
  return { resetRun };
};
