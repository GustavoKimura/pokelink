import type { Pokemon } from "./Pokemon";
import type { Card } from "./Card";

export interface PlayerPokemon {
  pokemon: Pokemon;
  level: number;
  currentHp: number;
  maxHp: number;
  shield: number;
  runDeck: Card[];
  drawPile: Card[];
  hand: Card[];
  discardPile: Card[];
  energy: number;
  revives: number;
  runXp: number;
  xpToNextLevel: number;
}

export interface EnemyPokemon {
  pokemon: Pokemon;
  level: number;
  currentHp: number;
  maxHp: number;
  shield: number;
  runDeck: Card[];
  drawPile: Card[];
  hand: Card[];
  discardPile: Card[];
  energy: number;
}

export interface PreviousStats {
  level: number;
  maxHp: number;
  attackPower: number;
  speed: number;
  shield: number;
}
