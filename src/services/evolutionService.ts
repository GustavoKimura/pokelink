import type { Pokemon } from "../models/Pokemon";
import { getPokemonSpecies, getEvolutionChain, getPokemon } from "./pokeApi";

export const checkEvolution = async (
  pokemon: Pokemon,
  level: number,
): Promise<Pokemon | null> => {
  try {
    const species = await getPokemonSpecies(pokemon.id);
    const chainData = await getEvolutionChain(species.evolution_chain.url);
    let current = chainData.chain;
    while (current) {
      if (current.species.name === pokemon.name.toLowerCase()) {
        if (current.evolves_to.length > 0) {
          for (const evolution of current.evolves_to) {
            const minLevel = evolution.evolution_details?.[0]?.min_level;
            if (minLevel && level >= minLevel) {
              return await getPokemon(evolution.species.name);
            }
          }
        }
        break;
      }
      current = current.evolves_to[0];
    }
  } catch (e) {
    console.warn("Evolution check failed:", e);
  }
  return null;
};
