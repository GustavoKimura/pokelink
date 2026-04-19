import { useCallback } from "react";
import { useGameStore } from "../../data/stores/useGameStore";
import type { Card } from "../../domain/models/Card";
import toast from "react-hot-toast";

export const useGameOrchestratorViewModel = () => {
  const phase = useGameStore((state) => state.phase);
  const levelUpData = useGameStore((state) => state.levelUpData);
  const evolutionData = useGameStore((state) => state.evolutionData);
  const battleKey = useGameStore((state) => state.battleKey);
  const restHealAmount = useGameStore((state) => state.restHealAmount);
  const initializeRun = useGameStore((state) => state.initializeRun);
  const acknowledgeLevelUp = useGameStore((state) => state.acknowledgeLevelUp);
  const acknowledgeEvolution = useGameStore(
    (state) => state.acknowledgeEvolution,
  );
  const acknowledgeRest = useGameStore((state) => state.acknowledgeRest);
  const refreshBattle = useGameStore((state) => state.refreshBattle);
  const executeEnemyAction = useGameStore((state) => state.executeEnemyAction);

  const handleAcknowledgeRest = useCallback(() => {
    if (restHealAmount === 0) {
      toast("HP já está cheio!", { icon: "💤" });
    } else if (restHealAmount) {
      toast.success(`Recuperou ${restHealAmount} de HP!`);
    }
    acknowledgeRest();
  }, [restHealAmount, acknowledgeRest]);

  return {
    phase,
    levelUpData,
    evolutionData,
    battleKey,
    initializeRun: useCallback(
      (starterId: number, customDeck?: Card[]) =>
        initializeRun(starterId, customDeck),
      [initializeRun],
    ),
    acknowledgeLevelUp,
    acknowledgeEvolution,
    handleAcknowledgeRest,
    refreshBattle,
    executeEnemyAction,
  };
};
