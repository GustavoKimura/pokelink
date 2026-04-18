import type { Pokemon } from "../models/Pokemon";
import type { Item } from "../models/Item";
import type { PlayerPokemon } from "../models/Player";
import type { ApiEvolutionChain } from "./pokeApi";
import { getPokemonSpecies, getEvolutionChain, getPokemon } from "./pokeApi";
import {
  calculateMaxHp,
  calculateShield,
  getXpForNextLevel,
} from "./battleService";

const FORCE_EEVEE_EVOLUTIONS: Record<string, string> = {
  "leaf-stone": "leafeon",
  "ice-stone": "glaceon",
};

export const canEvolveWithItem = async (
  pokemon: Pokemon,
  item: Item,
): Promise<Pokemon | null> => {
  if (pokemon.id === 133 && item.effect.type === "evolution-stone") {
    const forcedEvolution = FORCE_EEVEE_EVOLUTIONS[item.name];
    if (forcedEvolution) {
      return await getPokemon(forcedEvolution);
    }
  }

  try {
    const species = await getPokemonSpecies(pokemon.id);
    const chainData = await getEvolutionChain(species.evolution_chain.url);
    let current: ApiEvolutionChain["chain"] | undefined = chainData.chain;
    while (current) {
      if (current.species.name === pokemon.name.toLowerCase()) {
        for (const evolution of current.evolves_to) {
          const details = evolution.evolution_details?.[0];
          if (!details) continue;
          if (item.effect.type === "evolution-stone") {
            if (
              details.trigger?.name === "use-item" &&
              details.item?.name === item.name
            ) {
              return await getPokemon(evolution.species.name);
            }
          }
          if (item.effect.type === "trade-cable") {
            if (details.trigger?.name === "trade") {
              return await getPokemon(evolution.species.name);
            }
          }
        }
        break;
      }
      current = current.evolves_to[0];
    }
  } catch (e) {
    console.warn("Item evolution check failed:", e);
  }
  return null;
};

export const applyItemEffect = async (
  item: Item,
  target: PlayerPokemon,
): Promise<{
  success: boolean;
  evolvedPokemon?: Pokemon;
  updatedTarget?: PlayerPokemon;
  levelUp?: boolean;
  healAmount?: number;
}> => {
  const effect = item.effect;
  if (effect.type === "evolution-stone" || effect.type === "trade-cable") {
    const evolution = await canEvolveWithItem(target.pokemon, item);
    if (evolution) {
      const updated: PlayerPokemon = {
        ...target,
        pokemon: evolution,
        maxHp: calculateMaxHp(evolution.stats.hp, target.level),
        currentHp: calculateMaxHp(evolution.stats.hp, target.level),
        shield: calculateShield(
          evolution.stats.defense,
          evolution.stats.specialDefense,
          target.level,
        ),
      };
      return {
        success: true,
        evolvedPokemon: evolution,
        updatedTarget: updated,
      };
    }
    return { success: false };
  }
  if (effect.type === "rare-candy") {
    const newLevel = target.level + 1;
    const newMaxHp = calculateMaxHp(target.pokemon.stats.hp, newLevel);
    const updated: PlayerPokemon = {
      ...target,
      level: newLevel,
      maxHp: newMaxHp,
      currentHp: newMaxHp,
      shield: calculateShield(
        target.pokemon.stats.defense,
        target.pokemon.stats.specialDefense,
        newLevel,
      ),
      xpToNextLevel: getXpForNextLevel(newLevel),
    };
    return { success: true, updatedTarget: updated, levelUp: true };
  }
  if (effect.type === "potion") {
    if (target.currentHp >= target.maxHp) {
      return { success: false };
    }
    const healAmount = Math.min(
      effect.healAmount,
      target.maxHp - target.currentHp,
    );
    const newHp = target.currentHp + healAmount;
    return {
      success: true,
      updatedTarget: { ...target, currentHp: newHp },
      healAmount,
    };
  }
  return { success: false };
};
