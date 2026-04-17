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
  const levelMoves = pokemon.moves.filter((m) => m.levelLearnedAt === newLevel);
  const damageMoves: Card[] = [];

  for (const moveRef of levelMoves) {
    const moveData = (await getMove(moveRef.url)) as ApiMove;
    if (moveData.power !== null && moveData.damage_class.name !== "status") {
      damageMoves.push({
        id: String(moveData.id),
        name: moveData.name,
        type: moveData.type.name,
        power: moveData.power,
        pp: moveData.pp,
        energyCost: calculateEnergyCost(moveData.pp),
        description: "",
        damageClass: moveData.damage_class.name as "physical" | "special",
      });
    }
  }

  const shuffled = [...damageMoves].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}
