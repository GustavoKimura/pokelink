import type { PlayerPokemon, EnemyPokemon, Card } from "../types";

export function calculateMaxHp(baseHp: number, level: number): number {
  return Math.floor(((2 * baseHp + 31) * level) / 100) + level + 10;
}

export function calculateDamage(
  attacker: PlayerPokemon | EnemyPokemon,
  defender: PlayerPokemon | EnemyPokemon,
  move: Card,
): number {
  const attackStat = attacker.pokemon.stats.attack;
  const defenseStat = defender.pokemon.stats.defense;
  const level = attacker.level;

  const baseDamage =
    (((2 * level) / 5 + 2) * move.power * (attackStat / defenseStat)) / 50 + 2;
  const variation = 0.85 + Math.random() * 0.15;
  return Math.floor(baseDamage * variation);
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
