import type { Card, Pokemon } from "../types";
import { getMove } from "../services/pokeCache";
import { calculateEnergyCost } from "./cardUtils";

interface ApiMove {
  id: number;
  name: string;
  power: number | null;
  pp: number;
  type: { name: string };
  damage_class: { name: string };
}

export async function getLevelUpMoveOptions(
  pokemon: Pokemon,
  newLevel: number,
): Promise<Card[]> {
  let currentLevel = newLevel;
  const allMoves: Card[] = [];

  while (currentLevel >= 1 && allMoves.length < 3) {
    const levelMoves = pokemon.moves.filter(
      (m) => m.levelLearnedAt === currentLevel,
    );

    for (const moveRef of levelMoves) {
      const moveData = (await getMove(moveRef.url)) as ApiMove;
      if (moveData.power !== null && moveData.damage_class.name !== "status") {
        const card = {
          id: String(moveData.id),
          name: moveData.name.charAt(0).toUpperCase() + moveData.name.slice(1),
          type: moveData.type.name,
          power: moveData.power,
          pp: moveData.pp,
          energyCost: calculateEnergyCost(moveData.pp),
          description: "",
          damageClass: moveData.damage_class.name as "physical" | "special",
        };
        if (!allMoves.some((m) => m.id === card.id)) {
          allMoves.push(card);
        }
      }
    }

    currentLevel--;
  }

  const uniqueMoves: Card[] = [];
  for (const move of allMoves) {
    if (!uniqueMoves.some((m) => m.id === move.id)) {
      uniqueMoves.push(move);
    }
  }

  const shuffled = [...uniqueMoves].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}
