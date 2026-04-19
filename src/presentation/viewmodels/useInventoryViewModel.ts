import { useState } from "react";
import toast from "react-hot-toast";
import { useGameViewModel } from "./useGameViewModel";
import { ITEMS_DB } from "../../domain/models/Item";

export const useInventoryViewModel = (onClose: () => void) => {
  const { inventory, player, applyItemToPlayer, removeCardFromDeck } =
    useGameViewModel();
  const [showCardRemover, setShowCardRemover] = useState(false);

  const handleUseItem = async (itemId: string) => {
    if (!player) return;
    const item = ITEMS_DB[itemId];
    if (!item) return;

    if (item.targetType === "pokemon") {
      const success = await applyItemToPlayer(itemId);
      if (success) onClose();
    } else if (item.targetType === "card") {
      if (player.runDeck.length <= 1) {
        toast.error("Não é possível remover a última carta do baralho!");
        return;
      }
      setShowCardRemover(true);
    }
  };

  const handleCardRemove = (card: import("../../domain/models/Card").Card) => {
    removeCardFromDeck(card);
    setShowCardRemover(false);
    onClose();
  };

  const groupedItems = inventory.reduce(
    (acc, invItem) => {
      const item = ITEMS_DB[invItem.itemId];
      if (!item) return acc;
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(invItem);
      return acc;
    },
    {} as Record<string, typeof inventory>,
  );

  return {
    player,
    groupedItems,
    inventory,
    showCardRemover,
    handleUseItem,
    handleCardRemove,
    setShowCardRemover,
  };
};
