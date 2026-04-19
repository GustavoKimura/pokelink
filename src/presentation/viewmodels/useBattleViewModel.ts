import { useState } from "react";
import { useGameStore } from "../../data/stores/useGameStore";

export const useBattleViewModel = () => {
  const [showPlayerDeck, setShowPlayerDeck] = useState(false);
  const [showEnemyDeck, setShowEnemyDeck] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

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

  const isPlayerTurn = !!(
    player && turnOrder[currentTurnIndex]?.pokemon.id === player.pokemon.id
  );

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
    isPlayerTurn,
    showPlayerDeck,
    setShowPlayerDeck,
    showEnemyDeck,
    setShowEnemyDeck,
    showInventory,
    setShowInventory,
  };
};
