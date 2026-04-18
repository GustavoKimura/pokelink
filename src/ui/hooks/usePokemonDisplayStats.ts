import { useMemo } from "react";
import type { Pokemon } from "../../domain/models/Pokemon";
import type { Card } from "../../domain/models/Card";
import {
  calculateMaxHp,
  calculateShield,
  calculateCardDisplayDamage,
} from "../../domain/services/battleService";

const sampleMove: Card = {
  id: "sample",
  name: "Sample",
  type: "normal",
  power: 40,
  pp: 35,
  energyCost: 1,
  description: "",
  damageClass: "physical",
};

export const usePokemonDisplayStats = (
  pokemon: Pokemon | undefined | null,
  level: number,
) => {
  return useMemo(() => {
    if (!pokemon) {
      return { maxHp: 0, shield: 0, attackPower: 0, speed: 0 };
    }
    return {
      maxHp: calculateMaxHp(pokemon.stats.hp, level),
      shield: calculateShield(
        pokemon.stats.defense,
        pokemon.stats.specialDefense,
        level,
      ),
      attackPower: calculateCardDisplayDamage({ pokemon, level }, sampleMove),
      speed: pokemon.stats.speed,
    };
  }, [pokemon, level]);
};
