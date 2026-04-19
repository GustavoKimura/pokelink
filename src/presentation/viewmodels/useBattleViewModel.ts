import { useState, useMemo } from "react";
import { useGameStore } from "../../data/stores/useGameStore";

export const useBattleViewModel = () => {
  const [showPlayerDeck, setShowPlayerDeck] = useState(false);
  const [showEnemyDeck, setShowEnemyDeck] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  const player = useGameStore((state) => state.player);
  const enemies = useGameStore((state) => state.enemies);
  const isTargeting = useGameStore((state) => state.isTargeting);
  const battleLog = useGameStore((state) => state.battleLog);
  const gold = useGameStore((state) => state.gold);
  const selectCard = useGameStore((state) => state.selectCard);
  const selectTarget = useGameStore((state) => state.selectTarget);
  const cancelTarget = useGameStore((state) => state.cancelTarget);
  const endTurn = useGameStore((state) => state.endTurn);
  const turnOrder = useGameStore((state) => state.turnOrder);
  const currentTurnIndex = useGameStore((state) => state.currentTurnIndex);

  const isPlayerTurn = useMemo(() => {
    return !!(
      player && turnOrder[currentTurnIndex]?.pokemon.id === player.pokemon.id
    );
  }, [player, turnOrder, currentTurnIndex]);

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
