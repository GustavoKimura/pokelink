import { useState } from "react";
import toast from "react-hot-toast";
import { useGameStore } from "../../data/stores/useGameStore";
import { ITEMS_DB, SHOP_ITEM_POOL } from "../../domain/models/Item";
import { SHOP_SLOTS, SHOP_REFRESH_COST } from "../../domain/config/gameConfig";

export const useShopViewModel = (initialInventory: string[]) => {
  const { gold, spendGold, addItem } = useGameStore((state) => ({
    gold: state.gold,
    spendGold: state.spendGold,
    addItem: state.addItem,
  }));

  const [items, setItems] = useState<string[]>(initialInventory);
  const [purchased, setPurchased] = useState<Set<number>>(new Set());
  const [refreshed, setRefreshed] = useState(false);

  const handleBuy = (itemId: string, index: number) => {
    if (purchased.has(index)) {
      toast.error("Item já comprado!");
      return;
    }
    const item = ITEMS_DB[itemId];
    if (!item) return;

    if (spendGold(item.price)) {
      addItem(itemId, 1);
      setPurchased(new Set(purchased).add(index));
      toast.success(`${item.displayName} comprado!`);
    } else {
      toast.error("Ouro insuficiente!");
    }
  };

  const handleRefresh = () => {
    if (refreshed) {
      toast.error("Loja já foi atualizada!");
      return;
    }
    if (spendGold(SHOP_REFRESH_COST)) {
      const newItems: string[] = [];
      for (let i = 0; i < SHOP_SLOTS; i++) {
        const randomIndex = Math.floor(Math.random() * SHOP_ITEM_POOL.length);
        newItems.push(SHOP_ITEM_POOL[randomIndex]);
      }
      setItems(newItems);
      setPurchased(new Set());
      setRefreshed(true);
      toast.success("Loja atualizada!");
    } else {
      toast.error(
        `Ouro insuficiente para atualizar! Custo: ${SHOP_REFRESH_COST}💰`,
      );
    }
  };

  const canAffordRefresh = gold >= SHOP_REFRESH_COST && !refreshed;

  return {
    gold,
    items,
    purchased,
    refreshed,
    canAffordRefresh,
    handleBuy,
    handleRefresh,
  };
};
