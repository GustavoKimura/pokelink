import { v4 as uuidv4 } from "uuid";
import type { MapNode } from "../types/map";

const STARTER_IDS = [133, 92, 246];
const BOSS_ID = 6;

export function generateMap(): MapNode[] {
  const nodes: MapNode[] = [];
  const rows = 5;
  const cols = 4;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const isBossRow = row === rows - 1;
      const isBottomRow = row === 0;

      let type: "battle" | "rest" | "boss";
      let pokemonId: number | undefined;

      if (isBossRow) {
        if (col !== 1 && col !== 2) continue;
        type = "boss";
        pokemonId = BOSS_ID;
      } else if (isBottomRow) {
        type = "battle";
        pokemonId = STARTER_IDS[Math.floor(Math.random() * STARTER_IDS.length)];
      } else {
        const rand = Math.random();
        type = rand < 0.7 ? "battle" : "rest";
        if (type === "battle") {
          pokemonId =
            STARTER_IDS[Math.floor(Math.random() * STARTER_IDS.length)];
        }
      }

      const level = 2 + row * 3 + Math.floor(Math.random() * 3);

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

  for (let row = 0; row < rows - 1; row++) {
    const currentRowY = (rows - 1 - row) * 150 + 100;
    const nextRowY = (rows - 1 - (row + 1)) * 150 + 100;
    const currentRowNodes = nodes.filter((n) => n.position.y === currentRowY);
    const nextRowNodes = nodes.filter((n) => n.position.y === nextRowY);

    for (const node of currentRowNodes) {
      const currentCol = Math.floor((node.position.x - 100) / 200);
      const possibleTargets = nextRowNodes.filter((n) => {
        const targetCol = Math.floor((n.position.x - 100) / 200);
        return Math.abs(targetCol - currentCol) <= 1;
      });

      if (possibleTargets.length === 0) continue;

      const connectionCount = Math.min(2, possibleTargets.length);
      for (let i = 0; i < connectionCount; i++) {
        const target =
          possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
        if (!node.connections.includes(target.id)) {
          node.connections.push(target.id);
        }
      }

      if (node.connections.length === 0 && possibleTargets.length > 0) {
        node.connections.push(possibleTargets[0].id);
      }
    }

    for (const target of nextRowNodes) {
      const hasIncoming = currentRowNodes.some((src) =>
        src.connections.includes(target.id),
      );
      if (!hasIncoming) {
        const targetCol = Math.floor((target.position.x - 100) / 200);
        const sources = currentRowNodes.filter((src) => {
          const srcCol = Math.floor((src.position.x - 100) / 200);
          return Math.abs(srcCol - targetCol) <= 1;
        });
        if (sources.length > 0) {
          const source = sources[Math.floor(Math.random() * sources.length)];
          if (!source.connections.includes(target.id)) {
            source.connections.push(target.id);
          }
        } else {
          const source =
            currentRowNodes[Math.floor(Math.random() * currentRowNodes.length)];
          if (!source.connections.includes(target.id)) {
            source.connections.push(target.id);
          }
        }
      }
    }
  }

  return nodes;
}

export function unlockNextNodes(
  nodes: MapNode[],
  completedNodeId: string,
): MapNode[] {
  const completedNode = nodes.find((n) => n.id === completedNodeId);
  if (!completedNode) return nodes;

  return nodes.map((node) => {
    if (completedNode.connections.includes(node.id)) {
      return { ...node, unlocked: true };
    }
    return node;
  });
}

export function getAvailableNodes(nodes: MapNode[]): MapNode[] {
  return nodes.filter((n) => n.unlocked && !n.completed);
}
