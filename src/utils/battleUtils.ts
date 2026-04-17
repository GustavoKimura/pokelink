import type { PlayerPokemon, EnemyPokemon, Card } from "../types";

export function calculateMaxHp(baseHp: number, level: number): number {
  return Math.floor(((2 * baseHp + 31) * level) / 100) + level + 10;
}

export function calculateShield(defense: number, level: number): number {
  return Math.floor((defense * level) / 10) + 5;
}

export function calculateDamage(
  attacker: PlayerPokemon | EnemyPokemon,
  defender: PlayerPokemon | EnemyPokemon,
  move: Card,
): number {
  const level = attacker.level;
  const power = move.power;
  const attack = attacker.pokemon.stats.attack;
  const defense = defender.pokemon.stats.defense;

  const baseDamage =
    (((2 * level) / 5 + 2) * power * (attack / defense)) / 50 + 2;
  const finalDamage = Math.floor(baseDamage);

  return Math.max(1, finalDamage);
}

export function calculateCardDamage(
  attacker: PlayerPokemon,
  move: Card,
): number {
  const level = attacker.level;
  const power = move.power;
  const attack = attacker.pokemon.stats.attack;

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
