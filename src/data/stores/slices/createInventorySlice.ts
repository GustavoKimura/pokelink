import type { StoreSlice } from "../types";
import type { InventoryItem } from "../../../domain/models/Item";
import { ITEMS_DB } from "../../../domain/models/Item";
import { applyItemEffect } from "../../../domain/services/itemService";
import { GOLD_ON_SKIP_CARD } from "../../../domain/config/gameConfig";
import type { PlayerPokemon } from "../../../domain/models/Player";
import type { Pokemon } from "../../../domain/models/Pokemon";
import { checkEvolution } from "../../../domain/services/evolutionService";
import { getLevelUpMoveOptions } from "../../../domain/services/deckService";
import {
  calculateCardDisplayDamage,
  calculateShield,
  calculateMaxHp,
} from "../../../domain/services/battleService";

export interface InventorySlice {
  gold: number;
  inventory: InventoryItem[];
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  addItem: (itemId: string, quantity?: number) => void;
  removeItem: (itemId: string, quantity?: number) => void;
  applyItemToPokemon: (
    itemId: string,
    target: PlayerPokemon,
  ) => Promise<{
    success: boolean;
    evolvedPokemon?: Pokemon;
    updatedTarget?: PlayerPokemon;
    levelUp?: boolean;
    healAmount?: number;
  }>;
  getItemQuantity: (itemId: string) => number;
  awardSkipCardGold: () => void;
}

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
    const item = ITEMS_DB[itemId];
    if (!item) return { success: false };
    const quantity = get().getItemQuantity(itemId);
    if (quantity <= 0) return { success: false };
    const result = await applyItemEffect(item, target);
    if (result.success) {
      get().removeItem(itemId, 1);
      if (result.updatedTarget) {
        set({ player: result.updatedTarget });
        if (result.evolvedPokemon) {
          const currentPhase = get().phase;
          if (currentPhase !== "evolution") {
            set({
              phase: "evolution",
              evolutionData: {
                oldPokemon: target.pokemon,
                newPokemon: result.evolvedPokemon,
              },
            });
          }
          return {
            success: true,
            evolvedPokemon: result.evolvedPokemon,
            updatedTarget: result.updatedTarget,
          };
        }
        if (result.levelUp) {
          const { player: updatedPlayer } = get();
          if (updatedPlayer) {
            const evolution = await checkEvolution(
              updatedPlayer.pokemon,
              updatedPlayer.level,
            );
            if (evolution) {
              const evolved: PlayerPokemon = {
                ...updatedPlayer,
                pokemon: evolution,
                maxHp: calculateMaxHp(evolution.stats.hp, updatedPlayer.level),
                currentHp: calculateMaxHp(
                  evolution.stats.hp,
                  updatedPlayer.level,
                ),
                shield: calculateShield(
                  evolution.stats.defense,
                  evolution.stats.specialDefense,
                  updatedPlayer.level,
                ),
              };
              const currentPhase = get().phase;
              if (currentPhase !== "evolution") {
                set({
                  player: evolved,
                  phase: "evolution",
                  evolutionData: {
                    oldPokemon: updatedPlayer.pokemon,
                    newPokemon: evolution,
                  },
                });
              }
              return {
                success: true,
                evolvedPokemon: evolution,
                updatedTarget: evolved,
                levelUp: true,
              };
            }
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
              updatedPlayer.pokemon,
              updatedPlayer.level,
            );
            const previousStats = {
              level: target.level,
              maxHp: target.maxHp,
              attackPower: calculateCardDisplayDamage(target, sampleMove),
              speed: target.pokemon.stats.speed,
              shield: target.shield,
            };
            set({
              phase: "level_up",
              levelUpData: {
                options,
                previousStats,
                playerSnapshot: updatedPlayer,
              },
            });
            return {
              success: true,
              updatedTarget: result.updatedTarget,
              levelUp: true,
            };
          }
        }
        return {
          success: true,
          updatedTarget: result.updatedTarget,
          healAmount: result.healAmount,
        };
      }
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
