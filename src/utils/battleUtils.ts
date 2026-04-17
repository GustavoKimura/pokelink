import type { PlayerPokemon, EnemyPokemon, Card } from "../types";

const DAMAGE_SCALING_FACTOR = 0.04;

const attackChart: Record<string, Record<string, number>> = {
  normal: { ghost: 0 },
  fire: { grass: 2, ice: 2, bug: 2, steel: 2 },
  water: { fire: 2, ground: 2, rock: 2 },
  grass: { water: 2, ground: 2, rock: 2 },
  electric: { water: 2, flying: 2, ground: 0 },
  ice: { grass: 2, ground: 2, flying: 2, dragon: 2 },
  fighting: { normal: 2, ice: 2, rock: 2, dark: 2, steel: 2, ghost: 0 },
  poison: { grass: 2, fairy: 2, steel: 0 },
  ground: { fire: 2, electric: 2, poison: 2, rock: 2, steel: 2, flying: 0 },
  flying: { grass: 2, fighting: 2, bug: 2 },
  psychic: { fighting: 2, poison: 2, dark: 0 },
  bug: { grass: 2, psychic: 2, dark: 2 },
  rock: { fire: 2, ice: 2, flying: 2, bug: 2 },
  ghost: { psychic: 2, ghost: 2, normal: 0 },
  dragon: { dragon: 2, fairy: 0 },
  dark: { psychic: 2, ghost: 2 },
  steel: { ice: 2, rock: 2, fairy: 2 },
  fairy: { fighting: 2, dragon: 2, dark: 2 },
};

export function calculateMaxHp(baseHp: number, level: number): number {
  return Math.floor(((2 * baseHp + 31) * level) / 100) + level + 10;
}

export function calculateShield(
  defense: number,
  specialDefense: number,
  level: number,
): number {
  const maxDefense = Math.max(defense, specialDefense);
  return Math.floor((maxDefense * level) / 20) + 1;
}

export function calculateDamage(
  attacker: PlayerPokemon | EnemyPokemon,
  move: Card,
): number {
  const level = attacker.level;
  const power = move.power;
  const attackStat =
    move.damageClass === "physical"
      ? attacker.pokemon.stats.attack
      : attacker.pokemon.stats.specialAttack;

  const baseDamage = (((2 * level) / 5 + 2) * power * attackStat) / 50 + 2;
  return Math.max(1, Math.floor(baseDamage * DAMAGE_SCALING_FACTOR));
}

export function calculateCardDisplayDamage(
  attacker: PlayerPokemon,
  move: Card,
): number {
  return calculateDamage(attacker, move);
}

export function calculateXpGain(
  enemyLevel: number,
  playerLevel: number,
): number {
  const base = enemyLevel * 40;
  const diff = enemyLevel - playerLevel;
  const multiplier = diff > 0 ? 1 + diff * 0.15 : 1;
  return Math.floor(base * multiplier);
}

export function getEffectiveness(
  moveType: string,
  defenderTypes: string[],
): number {
  let multiplier = 1;
  const chart = attackChart[moveType.toLowerCase()];
  if (!chart) return multiplier;

  for (const defType of defenderTypes) {
    const effectiveness = chart[defType.toLowerCase()];
    if (effectiveness !== undefined) {
      multiplier *= effectiveness;
    }
  }
  return multiplier;
}

export function checkLevelUp(
  currentXp: number,
  currentLevel: number,
): { newLevel: number; remainingXp: number } | null {
  const xpToNext = getXpForNextLevel(currentLevel);
  if (currentXp >= xpToNext) {
    const newLevel = currentLevel + 1;
    const remainingXp = currentXp - xpToNext;
    return { newLevel, remainingXp };
  }
  return null;
}

export function getXpForNextLevel(level: number): number {
  return Math.floor((4 * Math.pow(level, 3)) / 5);
}
