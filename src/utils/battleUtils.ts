import type { PlayerPokemon, EnemyPokemon, Card } from "../types";

const DAMAGE_SCALING_FACTOR = 0.04;

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

function getXpForNextLevel(level: number): number {
  return Math.floor((4 * level ** 3) / 5);
}
