import type { Pokemon } from "../types";
import {
  getPokemonSpecies,
  getEvolutionChain,
  getPokemon,
} from "../services/pokeCache";
import { transformApiPokemon } from "./pokemonTransform";

export async function checkEvolution(
  pokemon: Pokemon,
  level: number,
): Promise<Pokemon | null> {
  try {
    const species = await getPokemonSpecies(pokemon.id);
    const evolutionChainUrl = species.evolution_chain.url;
    const chainData = await getEvolutionChain(evolutionChainUrl);

    let current: typeof chainData.chain | undefined = chainData.chain;
    while (current) {
      if (current.species.name === pokemon.name.toLowerCase()) {
        if (current.evolves_to.length > 0) {
          for (const evolution of current.evolves_to) {
            const minLevel = evolution.evolution_details[0]?.min_level;
            if (minLevel && level >= minLevel) {
              const evolvedPokemon = await getPokemon(evolution.species.name);
              return transformApiPokemon(evolvedPokemon);
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
}
