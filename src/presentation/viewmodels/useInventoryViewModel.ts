import { useState } from "react";
import toast from "react-hot-toast";
import { useGameStore } from "../../data/stores/useGameStore";
import { ITEMS_DB } from "../../domain/models/Item";
import type { InventoryItem } from "../../domain/models/Item";

export const useInventoryViewModel = () => {
  const {
    player,
    inventory,
    applyItemToPokemon,
    removeItem,
    removeCardFromDeck,
  } = useGameStore((state) => ({
    player: state.player,
    inventory: state.inventory,
    applyItemToPokemon: state.applyItemToPokemon,
    removeItem: state.removeItem,
    removeCardFromDeck: state.removeCardFromDeck,
  }));
  const [showCardRemover, setShowCardRemover] = useState(false);

  const handleUseItem = async (itemId: string, onClose: () => void) => {
    if (!player) return;
    const item = ITEMS_DB[itemId];
    if (!item) return;

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
      if (player.runDeck.length <= 1) {
        toast.error("Não é possível remover a última carta do baralho!");
        return;
      }
      setShowCardRemover(true);
    }
  };

  const handleCardRemove = (cardIndex: number, onClose: () => void) => {
    removeCardFromDeck(cardIndex);
    removeItem("card-remover", 1);
    toast.success("Carta removida com sucesso!");
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
    {} as Record<string, InventoryItem[]>,
  );

  return {
    player,
    groupedItems,
    inventory,
    showCardRemover,
    setShowCardRemover,
    handleUseItem,
    handleCardRemove,
  };
};
