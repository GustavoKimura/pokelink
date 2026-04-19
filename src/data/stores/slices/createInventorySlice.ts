import type { InventorySlice, LevelUpStep, StoreSlice } from "../types";
import { ITEMS_DB } from "../../../domain/models/Item";
import { applyItemEffect } from "../../../domain/services/itemService";
import { GOLD_ON_SKIP_CARD } from "../../../domain/config/gameConfig";
import {
  calculateCardDisplayDamage,
  calculateShield,
} from "../../../domain/services/battleService";
import { getLevelUpMoveOptions } from "../../../domain/services/deckService";
import { isPlayerUnit } from "../../../domain/services/turnService";

export const createInventorySlice: StoreSlice<InventorySlice> = (set, get) => ({
  gold: 100,
  inventory: [],
  addGold: (amount) => set({ gold: get().gold + amount }),
  spendGold: (amount) => {
    if (get().gold >= amount) {
      set({ gold: get().gold - amount });
      return true;
    }
    return false;
  },
  addItem: (itemId, quantity = 1) => {
    const existing = get().inventory.find((i) => i.itemId === itemId);
    if (existing) {
      set({
        inventory: get().inventory.map((i) =>
          i.itemId === itemId ? { ...i, quantity: i.quantity + quantity } : i,
        ),
      });
    } else {
      set({ inventory: [...get().inventory, { itemId, quantity }] });
    }
  },
  removeItem: (itemId, quantity = 1) => {
    const existing = get().inventory.find((i) => i.itemId === itemId);
    if (!existing) return;
    if (existing.quantity <= quantity) {
      set({ inventory: get().inventory.filter((i) => i.itemId !== itemId) });
    } else {
      set({
        inventory: get().inventory.map((i) =>
          i.itemId === itemId ? { ...i, quantity: i.quantity - quantity } : i,
        ),
      });
    }
  },
  applyItemToPokemon: async (itemId, target) => {
    if (get().getItemQuantity(itemId) <= 0) return { success: false };

    const result = await applyItemEffect(ITEMS_DB[itemId], target);
    if (!result.success) return result;

    get().removeItem(itemId, 1);

    if (result.updatedTarget) {
      set({ player: result.updatedTarget });
      const { phase, turnOrder } = get();
      if (phase === "battle" || phase === "enemy_turn") {
        const updatedTurnOrder = [...turnOrder];
        const playerIndex = updatedTurnOrder.findIndex((u) => isPlayerUnit(u));
        if (playerIndex !== -1) {
          updatedTurnOrder[playerIndex] = {
            ...result.updatedTarget,
            shield: result.updatedTarget.shield,
          };
          set({ turnOrder: updatedTurnOrder });
        }
      }
    }

    if (result.evolution) {
      set({
        phase: "evolution",
        evolutionData: {
          oldPokemon: result.evolution.old,
          newPokemon: result.evolution.new,
        },
      });
    }

    if (result.leveledUp) {
      const { old: oldPlayer, new: newPlayer } = result.leveledUp;
      const sampleMove = {
        id: "sample",
        name: "Sample",
        type: "normal",
        power: 40,
        pp: 35,
        energyCost: 1 as const,
        description: "",
        damageClass: "physical" as const,
      };
      const options = await getLevelUpMoveOptions(
        newPlayer.pokemon,
        newPlayer.level,
      );
      const previousStats = {
        level: oldPlayer.level,
        maxHp: oldPlayer.maxHp,
        attackPower: calculateCardDisplayDamage(oldPlayer, sampleMove),
        speed: oldPlayer.pokemon.stats.speed,
        shield: calculateShield(
          oldPlayer.pokemon.stats.defense,
          oldPlayer.pokemon.stats.specialDefense,
          oldPlayer.level,
        ),
      };
      const levelUpStep: LevelUpStep = {
        type: "level",
        newLevel: newPlayer.level,
        player: newPlayer,
        options,
        previousStats,
      };
      set({
        levelUpQueue: [levelUpStep, ...get().levelUpQueue],
      });
      get().acknowledgeLevelUp();
    }

    return result;
  },
  getItemQuantity: (itemId) => {
    const existing = get().inventory.find((i) => i.itemId === itemId);
    return existing ? existing.quantity : 0;
  },
  awardSkipCardGold: () => {
    set({ gold: get().gold + GOLD_ON_SKIP_CARD });
  },
});
