import type { Pokemon } from "../types";
import {
  getAnimatedSpriteUrl,
  getOfficialArtworkUrl,
} from "../services/pokeCache";

interface ApiPokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    back_default: string | null;
  };
  stats: {
    base_stat: number;
    stat: { name: string };
  }[];
  types: {
    slot: number;
    type: { name: string };
  }[];
  moves: {
    move: { name: string; url: string };
    version_group_details: {
      level_learned_at: number;
      move_learn_method: { name: string };
    }[];
  }[];
}

export function transformApiPokemon(apiData: ApiPokemon): Pokemon {
  return {
    id: apiData.id,
    name: apiData.name,
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
      hp: apiData.stats.find((s) => s.stat.name === "hp")?.base_stat || 0,
      attack:
        apiData.stats.find((s) => s.stat.name === "attack")?.base_stat || 0,
      defense:
        apiData.stats.find((s) => s.stat.name === "defense")?.base_stat || 0,
      specialAttack:
        apiData.stats.find((s) => s.stat.name === "special-attack")
          ?.base_stat || 0,
      specialDefense:
        apiData.stats.find((s) => s.stat.name === "special-defense")
          ?.base_stat || 0,
      speed: apiData.stats.find((s) => s.stat.name === "speed")?.base_stat || 0,
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
          )?.level_learned_at || 0,
      })),
  };
}
