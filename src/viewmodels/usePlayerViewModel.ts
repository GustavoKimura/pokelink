import { useState, useCallback } from "react";
import type { PlayerPokemon } from "../models/Player";
import type { Card } from "../models/Card";
import { getPokemon } from "../services/pokeApi";
import {
  buildInitialDeck,
  shuffleArray,
  drawCards,
} from "../services/deckService";
import {
  calculateMaxHp,
  calculateShield,
  getXpForNextLevel,
} from "../services/battleService";
import {
  MAX_ENERGY,
  DEFAULT_REVIVES,
  REST_HEAL_PERCENT,
  CARDS_PER_TURN,
} from "../config/gameConfig";

export const usePlayerViewModel = () => {
  const [player, setPlayer] = useState<PlayerPokemon | null>(null);

  const initializePlayer = useCallback(
    async (starterId: number, customDeck?: Card[]) => {
      const playerPokemon = await getPokemon(starterId);
      const runDeck = customDeck ?? (await buildInitialDeck(playerPokemon));
      const shuffledDrawPile = shuffleArray([...runDeck]);
      const { drawn: initialHand, newDeck: initialDrawPile } = drawCards(
        shuffledDrawPile,
        [],
        CARDS_PER_TURN,
      );
      const newPlayer: PlayerPokemon = {
        pokemon: playerPokemon,
        level: 1,
        currentHp: calculateMaxHp(playerPokemon.stats.hp, 1),
        maxHp: calculateMaxHp(playerPokemon.stats.hp, 1),
        shield: calculateShield(
          playerPokemon.stats.defense,
          playerPokemon.stats.specialDefense,
          1,
        ),
        runDeck,
        drawPile: initialDrawPile,
        hand: initialHand,
        discardPile: [],
        energy: MAX_ENERGY,
        revives: DEFAULT_REVIVES,
        runXp: 0,
        xpToNextLevel: getXpForNextLevel(1),
      };
      setPlayer(newPlayer);
      return newPlayer;
    },
    [],
  );

  const prepareForBattle = useCallback(() => {
    if (!player) return;
    const shuffledDraw = shuffleArray([...player.runDeck]);
    const { drawn: newHand, newDeck: newDrawPile } = drawCards(
      shuffledDraw,
      [],
      CARDS_PER_TURN,
    );
    setPlayer({
      ...player,
      drawPile: newDrawPile,
      hand: newHand,
      discardPile: [],
      energy: MAX_ENERGY,
      shield: calculateShield(
        player.pokemon.stats.defense,
        player.pokemon.stats.specialDefense,
        player.level,
      ),
    });
  }, [player]);

  const applyRestHeal = useCallback(() => {
    if (!player) return 0;
    const heal = Math.floor(player.currentHp * REST_HEAL_PERCENT);
    const newHp = Math.min(player.maxHp, player.currentHp + heal);
    setPlayer({ ...player, currentHp: newHp });
    return heal;
  }, [player]);

  const updatePlayer = useCallback((updater: Partial<PlayerPokemon>) => {
    setPlayer((prev) => (prev ? { ...prev, ...updater } : null));
  }, []);

  return {
    player,
    initializePlayer,
    prepareForBattle,
    applyRestHeal,
    updatePlayer,
    setPlayer,
  };
};
