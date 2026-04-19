import { useState, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { useGameStore } from "../../data/stores/useGameStore";
import { ITEMS_DB } from "../../domain/models/Item";
import type { InventoryItem } from "../../domain/models/Item";

export const useInventoryViewModel = () => {
  const player = useGameStore((state) => state.player);
  const inventory = useGameStore((state) => state.inventory);
  const applyItemToPokemon = useGameStore((state) => state.applyItemToPokemon);
  const removeItem = useGameStore((state) => state.removeItem);
  const removeCardFromDeck = useGameStore((state) => state.removeCardFromDeck);
  const phase = useGameStore((state) => state.phase);
  const [showCardRemover, setShowCardRemover] = useState(false);

  const isInBattle = phase === "battle" || phase === "enemy_turn";

  const handleUseItem = useCallback(
    async (itemId: string, onClose: () => void) => {
      if (!player) return;
      const item = ITEMS_DB[itemId];
      if (!item) return;

      if (isInBattle && itemId !== "potion") {
        toast.error("Este item não pode ser usado durante a batalha!");
        return;
      }

      if (item.targetType === "pokemon") {
        if (item.effect.type === "potion" && player.currentHp >= player.maxHp) {
          toast.error("O HP do Pokémon já está cheio!");
          return;
        }
        const result = await applyItemToPokemon(itemId, player);
        if (result.success) {
          if (result.healAmount) {
            toast.success(`Poção usada! ${result.healAmount} HP restaurado.`);
          }
          onClose();
        } else if (
          item.effect.type === "evolution-stone" ||
          item.effect.type === "trade-cable"
        ) {
          toast.error("Não surtiu efeito...");
        }
      } else if (item.targetType === "card") {
        if (isInBattle) {
          toast.error("Remover carta não é permitido durante a batalha!");
          return;
        }
        if (player.runDeck.length <= 1) {
          toast.error("Não é possível remover a última carta do baralho!");
          return;
        }
        setShowCardRemover(true);
      }
    },
    [player, applyItemToPokemon, isInBattle],
  );

  const handleCardRemove = useCallback(
    (cardIndex: number, onClose: () => void) => {
      removeCardFromDeck(cardIndex);
      removeItem("card-remover", 1);
      toast.success("Carta removida com sucesso!");
      setShowCardRemover(false);
      onClose();
    },
    [removeCardFromDeck, removeItem],
  );

  const groupedItems = useMemo(() => {
    return inventory.reduce(
      (acc, invItem) => {
        const item = ITEMS_DB[invItem.itemId];
        if (!item) return acc;
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(invItem);
        return acc;
      },
      {} as Record<string, InventoryItem[]>,
    );
  }, [inventory]);

  return {
    player,
    groupedItems,
    inventory,
    showCardRemover,
    setShowCardRemover,
    handleUseItem,
    handleCardRemove,
    isInBattle,
  };
};
