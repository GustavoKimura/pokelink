import { useGameStore } from "../../data/stores/useGameStore";

export const useBattleViewModel = () => {
  const {
    player,
    enemies,
    isTargeting,
    battleLog,
    gold,
    selectCard,
    selectTarget,
    cancelTarget,
    endTurn,
    turnOrder,
    currentTurnIndex,
  } = useGameStore((state) => ({
    player: state.player,
    enemies: state.enemies,
    isTargeting: state.isTargeting,
    battleLog: state.battleLog,
    gold: state.gold,
    selectCard: state.selectCard,
    selectTarget: state.selectTarget,
    cancelTarget: state.cancelTarget,
    endTurn: state.endTurn,
    turnOrder: state.turnOrder,
    currentTurnIndex: state.currentTurnIndex,
  }));

  return {
    player,
    enemies,
    isTargeting,
    battleLog,
    gold,
    selectCard,
    selectTarget,
    cancelTarget,
    endTurn,
    turnOrder,
    currentTurnIndex,
  };
};
