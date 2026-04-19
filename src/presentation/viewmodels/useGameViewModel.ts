import { useGameStore } from "../../data/stores/useGameStore";
import type { PlayerPokemon } from "../../domain/models/Player";
import type { Card } from "../../domain/models/Card";
import { ITEMS_DB } from "../../domain/models/Item";
import toast from "react-hot-toast";

export const useGameViewModel = () => {
  const store = useGameStore();

  const handleProceedToNode = () => {
    const { currentNodeId, mapNodes, setShopInventory, proceedToNode } =
      useGameStore.getState();
    const selectedNode = mapNodes.find((n) => n.id === currentNodeId);
    if (!selectedNode) return;

    if (selectedNode.type === "shop" && selectedNode.shopInventory) {
      setShopInventory(selectedNode.shopInventory);
    } else {
      proceedToNode();
    }
  };

  const applyItemToPlayer = async (itemId: string): Promise<boolean> => {
    const { player, applyItemToPokemon } = useGameStore.getState();
    if (!player) return false;

    const item = ITEMS_DB[itemId];
    if (!item) return false;

    if (item.targetType === "pokemon") {
      if (item.effect.type === "potion" && player.currentHp >= player.maxHp) {
        toast.error("O HP do Pokémon já está cheio!");
        return false;
      }

      const result = await applyItemToPokemon(itemId, player);

      if (result.success) {
        if (result.healAmount) {
          toast.success(`Poção usada! ${result.healAmount} HP restaurado.`);
        }
      } else {
        if (
          item.effect.type === "evolution-stone" ||
          item.effect.type === "trade-cable"
        ) {
          toast.error("Não surtiu efeito...");
        }
      }
      return result.success;
    }
    return true;
  };

  const removeCardFromDeck = (card: Card) => {
    const { player, removeItem } = useGameStore.getState();
    if (!player) return;

    const targetIndex = player.runDeck.findIndex((c) => c.id === card.id);
    if (targetIndex === -1) return;

    const updatedRunDeck = player.runDeck.filter(
      (_, idx) => idx !== targetIndex,
    );
    updatePlayerRunDeck(updatedRunDeck);
    removeItem("card-remover", 1);
    toast.success("Carta removida com sucesso!");
  };

  const handleAcknowledgeRest = () => {
    const { restHealAmount, acknowledgeRest } = useGameStore.getState();
    if (restHealAmount === 0) {
      toast("HP já está cheio!", { icon: "💤" });
    } else if (restHealAmount) {
      toast.success(`Recuperou ${restHealAmount} de HP!`);
    }
    acknowledgeRest();
  };

  const updatePlayerRunDeck = (runDeck: PlayerPokemon["runDeck"]) => {
    const { player } = useGameStore.getState();
    if (player) {
      useGameStore.setState({ player: { ...player, runDeck } });
    }
  };

  return {
    ...store,
    handleProceedToNode,
    applyItemToPlayer,
    removeCardFromDeck,
    handleAcknowledgeRest,
    updatePlayerRunDeck,
  };
};
