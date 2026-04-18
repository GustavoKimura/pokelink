import type { StateCreator } from "zustand";
import type {
  PlayerPokemon,
  EnemyPokemon,
  PreviousStats,
} from "../../domain/models/Player";
import type { Pokemon } from "../../domain/models/Pokemon";
import type { Card } from "../../domain/models/Card";
import type { MapNode } from "../../domain/models/Map";
import type { InventoryItem } from "../../domain/models/Item";

export interface LevelUpStep {
  type: "level" | "evolution";
  newLevel: number;
  player: PlayerPokemon;
  oldPokemon?: Pokemon;
  evolvedPokemon?: Pokemon;
  options?: Card[];
  previousStats: PreviousStats;
}

export interface PlayerSlice {
  player: PlayerPokemon | null;
  levelUpData: {
    options: Card[];
    previousStats: PreviousStats;
    playerSnapshot: PlayerPokemon;
  } | null;
  evolutionData: {
    oldPokemon: Pokemon;
    newPokemon: Pokemon;
  } | null;
  levelUpQueue: LevelUpStep[];
  initializePlayer: (
    starterId: number,
    customDeck?: Card[],
  ) => Promise<PlayerPokemon>;
  acknowledgeLevelUp: (selectedCard?: Card) => void;
  acknowledgeEvolution: () => void;
}

export interface MapSlice {
  mapNodes: MapNode[];
  currentNodeId: string | null;
  restHealAmount: number | null;
  shopInventory: string[] | null;
  initializeMap: () => void;
  selectNode: (nodeId: string) => void;
  completeNode: (nodeId: string) => void;
  acknowledgeRest: () => void;
  acknowledgeShop: () => void;
  setShopInventory: (inventory: string[] | null) => void;
}

export interface BattleSlice {
  battleKey: number;
  enemies: EnemyPokemon[];
  turnOrder: (PlayerPokemon | EnemyPokemon)[];
  currentTurnIndex: number;
  battleLog: string[];
  selectedCard: Card | null;
  isTargeting: boolean;
  initializeBattle: (enemyNode: MapNode) => Promise<void>;
  selectCard: (card: Card) => void;
  selectTarget: (targetId: number) => void;
  cancelTarget: () => void;
  endTurn: () => void;
  executeEnemyAction: () => void;
  refreshBattle: () => void;
}

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

export interface GameSlice {
  phase:
    | "loading"
    | "map"
    | "battle"
    | "rest"
    | "shop"
    | "victory"
    | "defeat"
    | "level_up"
    | "evolution"
    | "enemy_turn";
  initializeRun: (starterId: number, customDeck?: Card[]) => Promise<void>;
  proceedToNode: () => Promise<void>;
  endBattle: (victory: boolean) => Promise<void>;
  resetRun: () => void;
}

export type StoreState = PlayerSlice &
  MapSlice &
  BattleSlice &
  GameSlice &
  InventorySlice;

export type StoreSlice<T> = StateCreator<
  StoreState,
  [["zustand/devtools", never]],
  [],
  T
>;
