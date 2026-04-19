import type { Card } from "../../../domain/models/Card";
import type { PlayerPokemon } from "../../../domain/models/Player";
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
import { processNextLevelUpStep } from "../../../domain/services/levelingService";

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

    const { updatedPlayer, remainingQueue, nextState } = processNextLevelUpStep(
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
  removeCardFromDeck: (cardIndex) => {
    const { player } = get();
    if (!player || cardIndex < 0 || cardIndex >= player.runDeck.length) return;
    const updatedRunDeck = [...player.runDeck];
    updatedRunDeck.splice(cardIndex, 1);
    set({ player: { ...player, runDeck: updatedRunDeck } });
  },
});
