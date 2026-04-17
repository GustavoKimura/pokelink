import type { Card, Pokemon } from "../types";
import { getMove } from "../services/pokeCache";

interface ApiMove {
  id: number;
  name: string;
  power: number | null;
  pp: number;
  type: { name: string };
  damage_class: { name: string };
}

export function calculateEnergyCost(pp: number): 1 | 2 | 3 {
  if (pp >= 30) return 1;
  if (pp > 20) return 2;
  return 3;
}

export async function buildInitialDeck(pokemon: Pokemon): Promise<Card[]> {
  const levelOneMoves = pokemon.moves.filter((m) => m.levelLearnedAt === 1);
  const damageMoves: Card[] = [];

  for (const moveRef of levelOneMoves) {
    const moveData = (await getMove(moveRef.url)) as ApiMove;
    if (moveData.power !== null && moveData.damage_class.name !== "status") {
      damageMoves.push({
        id: String(moveData.id),
        name: moveData.name.charAt(0).toUpperCase() + moveData.name.slice(1),
        type: moveData.type.name,
        power: moveData.power,
        pp: moveData.pp,
        energyCost: calculateEnergyCost(moveData.pp),
        description: "",
        damageClass: moveData.damage_class.name as "physical" | "special",
      });
    }
  }

  const deck: Card[] = [];
  if (damageMoves.length === 0) {
    return deck;
  }

  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * damageMoves.length);
    deck.push({ ...damageMoves[randomIndex] });
  }

  return deck;
}

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function drawCards(
  deck: Card[],
  discardPile: Card[],
  count: number,
): { drawn: Card[]; newDeck: Card[]; newDiscard: Card[] } {
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
}

export function createStruggleCard(): Card {
  return {
    id: "165",
    name: "Struggle",
    type: "normal",
    power: 50,
    pp: 1,
    energyCost: 1,
    description: "",
    damageClass: "physical",
    temporary: true,
  };
}
