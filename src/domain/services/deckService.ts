import type { Card } from "../models/Card";
import type { Pokemon } from "../models/Pokemon";
import { getMove } from "./pokeApi";
import {
  STARTING_DECK_SIZE,
  LEVEL_UP_MOVE_OPTIONS_COUNT,
} from "../config/gameConfig";
import { createStruggleCard } from "../models/Card";

interface ApiMove {
  id: number;
  name: string;
  power: number | null;
  pp: number;
  type: { name: string };
  damage_class: { name: string };
  meta?: { ailment: { name: string } | null; ailment_chance: number };
  effect_chance: number | null;
}

const calculateEnergyCost = (pp: number): 1 | 2 | 3 => {
  if (pp >= 30) return 1;
  if (pp > 20) return 2;
  return 3;
};

const hasSecondaryEffect = (moveData: ApiMove): boolean => {
  if (moveData.effect_chance && moveData.effect_chance > 0) return true;
  if (moveData.meta?.ailment?.name && moveData.meta.ailment.name !== "none")
    return true;
  return false;
};

const createCardFromApiMove = (moveData: ApiMove): Card => ({
  id: String(moveData.id),
  name: moveData.name.charAt(0).toUpperCase() + moveData.name.slice(1),
  type: moveData.type.name,
  power: moveData.power!,
  pp: moveData.pp,
  energyCost: calculateEnergyCost(moveData.pp),
  description: "",
  damageClass: moveData.damage_class.name as "physical" | "special",
});

export const buildInitialDeck = async (pokemon: Pokemon): Promise<Card[]> => {
  const levelOneMoves = pokemon.moves.filter((m) => m.levelLearnedAt === 1);
  const damageMoves: Card[] = [];
  for (const moveRef of levelOneMoves) {
    const moveData = (await getMove(moveRef.url)) as ApiMove;
    if (
      moveData.power !== null &&
      moveData.damage_class.name !== "status" &&
      !hasSecondaryEffect(moveData)
    ) {
      damageMoves.push(createCardFromApiMove(moveData));
    }
  }
  const deck: Card[] = [];
  if (damageMoves.length === 0) return deck;
  for (let i = 0; i < STARTING_DECK_SIZE; i++) {
    const randomIndex = Math.floor(Math.random() * damageMoves.length);
    deck.push({ ...damageMoves[randomIndex] });
  }
  return deck;
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const drawCards = (
  deck: Card[],
  discardPile: Card[],
  count: number,
): { drawn: Card[]; newDeck: Card[]; newDiscard: Card[] } => {
  let currentDeck = [...deck];
  let currentDiscard = [...discardPile];
  const drawn: Card[] = [];
  for (let i = 0; i < count; i++) {
    if (currentDeck.length === 0) {
      if (currentDiscard.length === 0) break;
      currentDeck = shuffleArray(currentDiscard);
      currentDiscard = [];
    }
    const card = currentDeck.pop();
    if (card) drawn.push(card);
  }
  return { drawn, newDeck: currentDeck, newDiscard: currentDiscard };
};

export const getLevelUpMoveOptions = async (
  pokemon: Pokemon,
  newLevel: number,
): Promise<Card[]> => {
  let currentLevel = newLevel;
  const allMoves: Card[] = [];
  while (currentLevel >= 1 && allMoves.length < LEVEL_UP_MOVE_OPTIONS_COUNT) {
    const levelMoves = pokemon.moves.filter(
      (m) => m.levelLearnedAt === currentLevel,
    );
    for (const moveRef of levelMoves) {
      const moveData = (await getMove(moveRef.url)) as ApiMove;
      if (moveData.power !== null && moveData.damage_class.name !== "status") {
        const card = createCardFromApiMove(moveData);
        if (!allMoves.some((m) => m.id === card.id)) allMoves.push(card);
      }
    }
    currentLevel--;
  }
  const uniqueMoves = allMoves.filter(
    (m, i, arr) => arr.findIndex((t) => t.id === m.id) === i,
  );
  return shuffleArray(uniqueMoves).slice(0, LEVEL_UP_MOVE_OPTIONS_COUNT);
};

export { createStruggleCard };
