import type { PlayerPokemon, EnemyPokemon, Card } from "../types";

export function calculateMaxHp(baseHp: number, level: number): number {
  return Math.floor(((2 * baseHp + 31) * level) / 100) + level + 10;
}

export function calculateShield(
  defense: number,
  specialDefense: number,
  level: number,
): number {
  const avgDefense = (defense + specialDefense) / 2;
  return Math.floor((avgDefense * level) / 5) + 3;
}

export function calculateDamage(
  attacker: PlayerPokemon | EnemyPokemon,
  move: Card,
): number {
  const level = attacker.level;
  const power = move.power;
  const attack =
    (attacker.pokemon.stats.attack + attacker.pokemon.stats.specialAttack) / 2;

  const baseDamage = (((2 * level) / 5 + 2) * power * attack) / 50 + 2;
  const finalDamage = Math.floor(baseDamage);

  return Math.max(1, finalDamage);
}

export function calculateCardDisplayDamage(
  attacker: PlayerPokemon,
  move: Card,
): number {
  const level = attacker.level;
  const power = move.power;
  const attack =
    (attacker.pokemon.stats.attack + attacker.pokemon.stats.specialAttack) / 2;

  const baseDamage = (((2 * level) / 5 + 2) * power * attack) / 50 + 2;
  return Math.floor(baseDamage);
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
