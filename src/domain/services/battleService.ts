import type { PlayerPokemon, EnemyPokemon } from "../models/Player";
import type { Card } from "../models/Card";
import type { Pokemon } from "../models/Pokemon";
import {
  DAMAGE_SCALING_FACTOR,
  SHIELD_DIVISOR,
  SHIELD_BASE,
  XP_BASE,
} from "../config/gameConfig";
import { typeEffectivenessChart } from "../constants/typeChart";

export const calculateMaxHp = (baseHp: number, level: number): number =>
  Math.floor(((2 * baseHp + 31) * level) / 100) + level + 10;

export const calculateShield = (
  defense: number,
  specialDefense: number,
  level: number,
): number => {
  const maxDefense = Math.max(defense, specialDefense);
  return Math.floor((maxDefense * level) / SHIELD_DIVISOR) + SHIELD_BASE;
};

const getAttackStat = (
  attacker: { pokemon: Pokemon },
  damageClass: Card["damageClass"],
): number => {
  return damageClass === "physical"
    ? attacker.pokemon.stats.attack
    : attacker.pokemon.stats.specialAttack;
};

const computeBaseDamage = (
  level: number,
  power: number,
  attackStat: number,
): number => {
  return (((2 * level) / 5 + 2) * power * attackStat) / 50 + 2;
};

export const calculateDamage = (
  attacker: PlayerPokemon | EnemyPokemon,
  move: Card,
): number => {
  const attackStat = getAttackStat(attacker, move.damageClass);
  const baseDamage = computeBaseDamage(attacker.level, move.power, attackStat);
  return Math.max(1, Math.floor(baseDamage * DAMAGE_SCALING_FACTOR));
};

export const calculateCardDisplayDamage = (
  attacker: { pokemon: Pokemon; level: number },
  move: Card,
): number => {
  const attackStat = getAttackStat(attacker, move.damageClass);
  const baseDamage = computeBaseDamage(attacker.level, move.power, attackStat);
  return Math.floor(baseDamage * DAMAGE_SCALING_FACTOR);
};

export const calculateXpGain = (enemyLevel: number): number =>
  enemyLevel * XP_BASE;

export const getEffectiveness = (
  moveType: string,
  defenderTypes: string[],
  isTypeless?: boolean,
): number => {
  if (isTypeless) return 1;
  let multiplier = 1;
  const chart =
    typeEffectivenessChart[
      moveType.toLowerCase() as keyof typeof typeEffectivenessChart
    ];
  if (!chart) return multiplier;
  for (const defType of defenderTypes) {
    const effectiveness = chart[defType.toLowerCase() as keyof typeof chart];
    if (effectiveness !== undefined) multiplier *= effectiveness;
  }
  return multiplier;
};

export const getXpForNextLevel = (level: number): number =>
  Math.floor((4 * Math.pow(level, 3)) / 5);

export const checkLevelUp = (
  currentXp: number,
  currentLevel: number,
): { newLevel: number; remainingXp: number } | null => {
  const xpToNext = getXpForNextLevel(currentLevel);
  if (currentXp >= xpToNext) {
    const newLevel = currentLevel + 1;
    const remainingXp = currentXp - xpToNext;
    return { newLevel, remainingXp };
  }
  return null;
};
