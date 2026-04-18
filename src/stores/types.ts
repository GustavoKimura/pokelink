import type { StateCreator } from "zustand";
import type {
  PlayerPokemon,
  EnemyPokemon,
  PreviousStats,
} from "../models/Player";
import type { Pokemon } from "../models/Pokemon";
import type { Card } from "../models/Card";
import type { MapNode } from "../models/Map";

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
  initializeMap: () => void;
  selectNode: (nodeId: string) => void;
  completeNode: (nodeId: string) => void;
  acknowledgeRest: () => void;
}

export interface BattleSlice {
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
}

export interface GameSlice {
  phase:
    | "loading"
    | "map"
    | "battle"
    | "rest"
    | "victory"
    | "defeat"
    | "level_up"
    | "evolution";
  initializeRun: (starterId: number, customDeck?: Card[]) => Promise<void>;
  proceedToNode: () => Promise<void>;
  endBattle: (victory: boolean) => Promise<void>;
  resetRun: () => void;
}

export type StoreState = PlayerSlice & MapSlice & BattleSlice & GameSlice;

export type StoreSlice<T> = StateCreator<
  StoreState,
  [["zustand/devtools", never]],
  [],
  T
>;
