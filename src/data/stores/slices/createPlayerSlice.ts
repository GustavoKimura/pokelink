import type { Card } from "../../../domain/models/Card";
import type { PlayerPokemon } from "../../../domain/models/Player";
import type { PlayerSlice, LevelUpStep, StoreSlice } from "../types";
import { getPokemon } from "../../../domain/services/pokeApi";
import {
  buildInitialDeck,
  drawCards,
  shuffleArray,
} from "../../../domain/services/deckService";
import {
  calculateMaxHp,
  calculateShield,
  getXpForNextLevel,
} from "../../../domain/services/battleService";
import {
  MAX_ENERGY,
  CARDS_PER_TURN,
  DEFAULT_REVIVES,
} from "../../../domain/config/gameConfig";

const processNextStep = (player: PlayerPokemon, queue: LevelUpStep[]) => {
  if (queue.length === 0) {
    return {
      updatedPlayer: player,
      remainingQueue: [],
      nextState: { phase: "map" as const },
    };
  }

  const [nextStep, ...rest] = queue;
  const playerSnapshot = nextStep.player;
  const newMaxHp = calculateMaxHp(
    playerSnapshot.pokemon.stats.hp,
    playerSnapshot.level,
  );
  const hpRatio = player.currentHp / player.maxHp;

  const updatedPlayer = {
    ...player,
    pokemon: playerSnapshot.pokemon,
    level: playerSnapshot.level,
    runXp: playerSnapshot.runXp,
    xpToNextLevel: getXpForNextLevel(playerSnapshot.level),
    maxHp: newMaxHp,
    currentHp: Math.max(1, Math.floor(newMaxHp * hpRatio)),
  };

  const nextState =
    nextStep.type === "level"
      ? {
          phase: "level_up" as const,
          levelUpData: {
            options: nextStep.options!,
            previousStats: nextStep.previousStats,
            playerSnapshot,
          },
        }
      : {
          phase: "evolution" as const,
          evolutionData: {
            oldPokemon: nextStep.oldPokemon!,
            newPokemon: nextStep.evolvedPokemon!,
          },
        };

  return { updatedPlayer, remainingQueue: rest, nextState };
};

export const createPlayerSlice: StoreSlice<PlayerSlice> = (set, get) => ({
  player: null,
  levelUpData: null,
  evolutionData: null,
  levelUpQueue: [],
  initializePlayer: async (
    starterId: number,
    customDeck?: Card[],
  ): Promise<PlayerPokemon> => {
    const playerPokemon = await getPokemon(starterId);
    const runDeck = customDeck ?? (await buildInitialDeck(playerPokemon));
    const shuffledDrawPile = shuffleArray([...runDeck]);
    const { drawn: initialHand, newDeck: initialDrawPile } = drawCards(
      shuffledDrawPile,
      [],
      CARDS_PER_TURN,
    );
    const newPlayer = {
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
    set({ player: newPlayer });
    return newPlayer;
  },
  acknowledgeLevelUp: (selectedCard?: Card) => {
    const { player, levelUpQueue, currentNodeId } = get();
    if (!player) return;

    const playerAfterCardChoice = { ...player };
    if (selectedCard) {
      playerAfterCardChoice.runDeck = [...player.runDeck, selectedCard];
    } else {
      get().awardSkipCardGold();
    }

    const { updatedPlayer, remainingQueue, nextState } = processNextStep(
      playerAfterCardChoice,
      levelUpQueue,
    );

    set({
      player: updatedPlayer,
      levelUpQueue: remainingQueue,
      levelUpData: null,
      evolutionData: null,
      ...nextState,
    });

    if (nextState.phase === "map" && currentNodeId) {
      get().completeNode(currentNodeId);
    }
  },
  acknowledgeEvolution: () => {
    set({ evolutionData: null });
    get().acknowledgeLevelUp();
  },
});
