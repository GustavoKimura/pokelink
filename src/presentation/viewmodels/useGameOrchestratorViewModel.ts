import { useGameStore } from "../../data/stores/useGameStore";
import type { Card } from "../../domain/models/Card";
import toast from "react-hot-toast";

export const useGameOrchestratorViewModel = () => {
  const {
    phase,
    levelUpData,
    evolutionData,
    battleKey,
    restHealAmount,
    initializeRun,
    acknowledgeLevelUp,
    acknowledgeEvolution,
    acknowledgeRest,
    refreshBattle,
    executeEnemyAction,
  } = useGameStore((state) => ({
    phase: state.phase,
    levelUpData: state.levelUpData,
    evolutionData: state.evolutionData,
    battleKey: state.battleKey,
    restHealAmount: state.restHealAmount,
    initializeRun: state.initializeRun,
    acknowledgeLevelUp: state.acknowledgeLevelUp,
    acknowledgeEvolution: state.acknowledgeEvolution,
    acknowledgeRest: state.acknowledgeRest,
    refreshBattle: state.refreshBattle,
    executeEnemyAction: state.executeEnemyAction,
  }));

  const handleAcknowledgeRest = () => {
    if (restHealAmount === 0) {
      toast("HP já está cheio!", { icon: "💤" });
    } else if (restHealAmount) {
      toast.success(`Recuperou ${restHealAmount} de HP!`);
    }
    acknowledgeRest();
  };

  return {
    phase,
    levelUpData,
    evolutionData,
    battleKey,
    initializeRun: (starterId: number, customDeck?: Card[]) =>
      initializeRun(starterId, customDeck),
    acknowledgeLevelUp,
    acknowledgeEvolution,
    handleAcknowledgeRest,
    refreshBattle,
    executeEnemyAction,
  };
};
