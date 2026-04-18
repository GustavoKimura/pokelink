import { v4 as uuidv4 } from "uuid";
import type { MapNode } from "../models/Map";
import {
  MAP_ROWS,
  MAP_COLS,
  BOSS_ID,
  WILD_POKEMON_IDS,
} from "../config/gameConfig";

export const generateMap = (): MapNode[] => {
  const nodes: MapNode[] = [];
  const rows = MAP_ROWS;
  const cols = MAP_COLS;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const isBossRow = row === rows - 1;
      const isBottomRow = row === 0;
      let type: "battle" | "rest" | "boss";
      let pokemonId: number | undefined;
      if (isBossRow) {
        if (col !== 2) continue;
        type = "boss";
        pokemonId = BOSS_ID;
      } else if (isBottomRow) {
        type = "battle";
        pokemonId =
          WILD_POKEMON_IDS[Math.floor(Math.random() * WILD_POKEMON_IDS.length)];
      } else {
        type = Math.random() < 0.7 ? "battle" : "rest";
        if (type === "battle")
          pokemonId =
            WILD_POKEMON_IDS[
              Math.floor(Math.random() * WILD_POKEMON_IDS.length)
            ];
      }
      const level = isBottomRow
        ? 1
        : 2 + (row - 1) * 3 + Math.floor(Math.random() * 3);
      const y = (rows - 1 - row) * 150 + 100;
      nodes.push({
        id: uuidv4(),
        type,
        level,
        pokemonId,
        position: { x: col * 200 + 100, y },
        connections: [],
        completed: false,
        unlocked: row === 0,
      });
    }
  }
  const bossNode = nodes.find((n) => n.type === "boss");
  if (!bossNode) return nodes;
  for (let row = 0; row < rows - 1; row++) {
    const currentRowY = (rows - 1 - row) * 150 + 100;
    const nextRowY = (rows - 1 - (row + 1)) * 150 + 100;
    const currentRowNodes = nodes.filter((n) => n.position.y === currentRowY);
    const nextRowNodes = nodes.filter((n) => n.position.y === nextRowY);
    if (row === rows - 2) {
      for (const node of currentRowNodes) node.connections = [bossNode.id];
      continue;
    }
    for (const node of currentRowNodes) {
      const currentCol = Math.floor((node.position.x - 100) / 200);
      const possibleTargets = nextRowNodes.filter(
        (n) =>
          Math.abs(Math.floor((n.position.x - 100) / 200) - currentCol) <= 1,
      );
      if (possibleTargets.length === 0) continue;
      const connectionCount = Math.min(2, possibleTargets.length);
      for (let i = 0; i < connectionCount; i++) {
        const target =
          possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
        if (!node.connections.includes(target.id))
          node.connections.push(target.id);
      }
      if (node.connections.length === 0 && possibleTargets.length > 0)
        node.connections.push(possibleTargets[0].id);
    }
    for (const target of nextRowNodes) {
      const hasIncoming = currentRowNodes.some((src) =>
        src.connections.includes(target.id),
      );
      if (!hasIncoming) {
        const targetCol = Math.floor((target.position.x - 100) / 200);
        const sources = currentRowNodes.filter(
          (src) =>
            Math.abs(Math.floor((src.position.x - 100) / 200) - targetCol) <= 1,
        );
        if (sources.length > 0) {
          const source = sources[Math.floor(Math.random() * sources.length)];
          if (!source.connections.includes(target.id))
            source.connections.push(target.id);
        } else {
          const source =
            currentRowNodes[Math.floor(Math.random() * currentRowNodes.length)];
          if (!source.connections.includes(target.id))
            source.connections.push(target.id);
        }
      }
    }
  }
  return nodes;
};

export const unlockNextNodes = (
  nodes: MapNode[],
  completedNodeId: string,
): MapNode[] => {
  const completedNode = nodes.find((n) => n.id === completedNodeId);
  if (!completedNode) return nodes;
  return nodes.map((node) => {
    if (completedNode.connections.includes(node.id)) {
      return { ...node, unlocked: true };
    }
    if (
      node.position.y === completedNode.position.y &&
      node.id !== completedNodeId
    ) {
      return { ...node, unlocked: false };
    }
    return node;
  });
};
