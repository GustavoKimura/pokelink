import type { PlayerPokemon } from "./Player";

export type NodeType = "battle" | "rest" | "boss";

export interface MapNode {
  id: string;
  type: NodeType;
  level: number;
  pokemonId?: number;
  position: { x: number; y: number };
  connections: string[];
  completed: boolean;
  unlocked: boolean;
}

export interface GameRunState {
  mapNodes: MapNode[];
  currentNodeId: string | null;
  player: PlayerPokemon | null;
  runPhase: "map" | "battle" | "rest" | "boss" | "victory" | "defeat";
}
