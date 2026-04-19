import { useGameStore } from "../../data/stores/useGameStore";

export const useGameViewModel = () => {
  const { resetRun } = useGameStore((state) => ({
    resetRun: state.resetRun,
  }));

  return { resetRun };
};
