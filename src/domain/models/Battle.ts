import type { PlayerPokemon, EnemyPokemon } from "./Player";
import type { Card } from "./Card";

export interface BattleState {
  phase:
    | "selecting_starter"
    | "map"
    | "battle"
    | "rest"
    | "boss"
    | "victory"
    | "defeat"
    | "enemy_turn";
  player: PlayerPokemon | null;
  enemies: EnemyPokemon[];
  turnOrder: (PlayerPokemon | EnemyPokemon)[];
  currentTurnIndex: number;
  log: string[];
  selectedMove: Card | null;
  selectingTarget: boolean;
}
