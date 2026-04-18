export interface Pokemon {
  id: number;
  name: string;
  types: string[];
  sprites: Sprites;
  stats: Stats;
  moves: MoveRef[];
}

export interface Sprites {
  front: string;
  back: string;
  animated: { front: string; back: string };
  official: string;
}

export interface Stats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface MoveRef {
  name: string;
  url: string;
  levelLearnedAt: number;
}
