export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  sprites: {
    front: string;
    back: string;
    animated: {
      front: string;
      back: string;
    };
    official: string;
  };
  stats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  moves: {
    name: string;
    url: string;
    levelLearnedAt: number;
  }[];
}

export interface StarterOption {
  id: number;
  name: string;
  displayName: string;
  unlocked: boolean;
  requiredXp: number;
  description: string;
}

export interface Card {
  id: string;
  name: string;
  type: string;
  power: number;
  pp: number;
  energyCost: 1 | 2 | 3;
  description: string;
}

export interface PlayerPokemon {
  pokemon: Pokemon;
  level: number;
  currentHp: number;
  maxHp: number;
  deck: Card[];
  hand: Card[];
  discardPile: Card[];
  energy: number;
  revives: number;
  runXp: number;
}

export interface EnemyPokemon {
  pokemon: Pokemon;
  level: number;
  currentHp: number;
  maxHp: number;
  deck: Card[];
  hand: Card[];
  discardPile: Card[];
  energy: number;
}

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
