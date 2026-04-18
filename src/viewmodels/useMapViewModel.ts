import { useState, useCallback } from "react";
import type { MapNode } from "../models/Map";
import type { EnemyPokemon } from "../models/Player";
import { generateMap, unlockNextNodes } from "../services/mapService";
import { getPokemon } from "../services/pokeApi";
import {
  buildInitialDeck,
  shuffleArray,
  drawCards,
} from "../services/deckService";
import { calculateMaxHp, calculateShield } from "../services/battleService";
import { MAX_ENERGY, CARDS_PER_TURN } from "../config/gameConfig";

export const useMapViewModel = () => {
  const [nodes, setNodes] = useState<MapNode[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);

  const startNewRun = useCallback(() => {
    const newNodes = generateMap();
    const startNodes = newNodes.filter((n) => n.unlocked && !n.completed);
    setNodes(newNodes);
    setCurrentNodeId(startNodes[0]?.id || null);
  }, []);

  const completeNode = useCallback((nodeId: string) => {
    setNodes((prev) => unlockNextNodes(prev, nodeId));
  }, []);

  const setCurrentNode = useCallback(
    (nodeId: string | null) => setCurrentNodeId(nodeId),
    [],
  );

  const getNodeById = useCallback(
    (id: string) => nodes.find((n) => n.id === id),
    [nodes],
  );

  const prepareEncounter = useCallback(
    async (node: MapNode): Promise<EnemyPokemon> => {
      const enemyPokemon = await getPokemon(node.pokemonId!);
      const enemyRunDeck = await buildInitialDeck(enemyPokemon);
      const shuffledEnemyDraw = shuffleArray([...enemyRunDeck]);
      const { drawn: enemyHand, newDeck: enemyDrawPile } = drawCards(
        shuffledEnemyDraw,
        [],
        CARDS_PER_TURN,
      );
      return {
        pokemon: enemyPokemon,
        level: node.level,
        currentHp: calculateMaxHp(enemyPokemon.stats.hp, node.level),
        maxHp: calculateMaxHp(enemyPokemon.stats.hp, node.level),
        shield: calculateShield(
          enemyPokemon.stats.defense,
          enemyPokemon.stats.specialDefense,
          node.level,
        ),
        runDeck: enemyRunDeck,
        drawPile: enemyDrawPile,
        hand: enemyHand,
        discardPile: [],
        energy: MAX_ENERGY,
      };
    },
    [],
  );

  return {
    nodes,
    currentNodeId,
    startNewRun,
    completeNode,
    setCurrentNode,
    getNodeById,
    prepareEncounter,
  };
};
