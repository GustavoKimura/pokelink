import type { PlayerSlice, StoreSlice } from "../types";
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

export const createPlayerSlice: StoreSlice<PlayerSlice> = (set, get) => ({
  player: null,
  levelUpData: null,
  evolutionData: null,
  levelUpQueue: [],
  initializePlayer: async (starterId, customDeck) => {
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
  acknowledgeLevelUp: (selectedCard) => {
    const { player, levelUpQueue } = get();
    if (!player) return;

    let updatedPlayer = { ...player };
    if (selectedCard) {
      updatedPlayer.runDeck = [...updatedPlayer.runDeck, selectedCard];
    }

    if (levelUpQueue.length === 0) {
      const { currentNodeId } = get();
      if (!currentNodeId) return;
      set({ player: updatedPlayer, levelUpData: null, phase: "map" });
      get().completeNode(currentNodeId);
      return;
    }

    const [nextStep, ...rest] = levelUpQueue;
    const playerSnapshot = nextStep.player;
    const newMaxHp = calculateMaxHp(
      playerSnapshot.pokemon.stats.hp,
      playerSnapshot.level,
    );
    const hpRatio = updatedPlayer.currentHp / updatedPlayer.maxHp;
    updatedPlayer = {
      ...updatedPlayer,
      pokemon: playerSnapshot.pokemon,
      level: playerSnapshot.level,
      runXp: playerSnapshot.runXp,
      xpToNextLevel: getXpForNextLevel(playerSnapshot.level),
      maxHp: newMaxHp,
      currentHp: Math.max(1, Math.floor(newMaxHp * hpRatio)),
    };

    set({ player: updatedPlayer, levelUpQueue: rest });

    if (nextStep.type === "level") {
      set({
        phase: "level_up",
        levelUpData: {
          options: nextStep.options!,
          previousStats: nextStep.previousStats,
          playerSnapshot,
        },
      });
    } else {
      set({
        phase: "evolution",
        evolutionData: {
          oldPokemon: nextStep.oldPokemon!,
          newPokemon: nextStep.evolvedPokemon!,
        },
      });
    }
  },
  acknowledgeEvolution: () => {
    set({ evolutionData: null });
    get().acknowledgeLevelUp();
  },
});
