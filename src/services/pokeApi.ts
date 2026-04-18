import type { Pokemon } from "../models/Pokemon";
import {
  fetchAndCache,
  getAnimatedSpriteUrl,
  getOfficialArtworkUrl,
} from "./cacheService";

interface ApiPokemon {
  id: number;
  name: string;
  sprites: { front_default: string | null; back_default: string | null };
  stats: { base_stat: number; stat: { name: string } }[];
  types: { slot: number; type: { name: string } }[];
  moves: {
    move: { name: string; url: string };
    version_group_details: {
      level_learned_at: number;
      move_learn_method: { name: string };
    }[];
  }[];
}

interface ApiMove {
  id: number;
  name: string;
  power: number | null;
  pp: number;
  type: { name: string };
  damage_class: { name: string };
}

interface ApiPokemonSpecies {
  evolution_chain: { url: string };
}

interface ApiEvolutionChain {
  chain: {
    species: { name: string };
    evolves_to: ApiEvolutionChain["chain"][];
    evolution_details?: { min_level: number | null }[];
  };
}

const CACHE_PREFIX = "poke_";

export const transformApiPokemon = (apiData: ApiPokemon): Pokemon => {
  const getStat = (name: string): number =>
    apiData.stats.find((s) => s.stat.name === name)?.base_stat ?? 0;
  return {
    id: apiData.id,
    name: apiData.name.charAt(0).toUpperCase() + apiData.name.slice(1),
    types: apiData.types.map((t) => t.type.name),
    sprites: {
      front: apiData.sprites.front_default || "",
      back: apiData.sprites.back_default || "",
      animated: {
        front: getAnimatedSpriteUrl(apiData.id, false),
        back: getAnimatedSpriteUrl(apiData.id, true),
      },
      official: getOfficialArtworkUrl(apiData.id),
    },
    stats: {
      hp: getStat("hp"),
      attack: getStat("attack"),
      defense: getStat("defense"),
      specialAttack: getStat("special-attack"),
      specialDefense: getStat("special-defense"),
      speed: getStat("speed"),
    },
    moves: apiData.moves
      .filter((m) =>
        m.version_group_details.some(
          (v) => v.move_learn_method.name === "level-up",
        ),
      )
      .map((m) => ({
        name: m.move.name,
        url: m.move.url,
        levelLearnedAt:
          m.version_group_details.find(
            (v) => v.move_learn_method.name === "level-up",
          )?.level_learned_at ?? 0,
      })),
  };
};

export const getPokemon = (id: number | string): Promise<Pokemon> =>
  fetchAndCache<ApiPokemon>(
    `https://pokeapi.co/api/v2/pokemon/${id}`,
    `${CACHE_PREFIX}pokemon_${id}`,
  ).then(transformApiPokemon);

export const getMove = (urlOrId: string | number): Promise<ApiMove> => {
  const id =
    typeof urlOrId === "string"
      ? urlOrId.split("/").slice(-2, -1)[0]
      : String(urlOrId);
  return fetchAndCache<ApiMove>(
    `https://pokeapi.co/api/v2/move/${id}`,
    `${CACHE_PREFIX}move_${id}`,
  );
};

export const getPokemonSpecies = (id: number): Promise<ApiPokemonSpecies> =>
  fetchAndCache<ApiPokemonSpecies>(
    `https://pokeapi.co/api/v2/pokemon-species/${id}`,
    `${CACHE_PREFIX}pokemon-species_${id}`,
  );

export const getEvolutionChain = (url: string): Promise<ApiEvolutionChain> => {
  const id = url.split("/").slice(-2, -1)[0];
  return fetchAndCache<ApiEvolutionChain>(
    url,
    `${CACHE_PREFIX}evolution-chain_${id}`,
  );
};
