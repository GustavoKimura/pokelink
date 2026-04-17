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

export interface MapState {
  nodes: MapNode[];
  currentNodeId: string | null;
  bossNodeId: string;
}
