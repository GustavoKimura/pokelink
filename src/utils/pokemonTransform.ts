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

const typeTranslation: Record<string, string> = {
  normal: "Normal",
  fire: "Fogo",
  water: "Água",
  electric: "Elétrico",
  grass: "Planta",
  ice: "Gelo",
  fighting: "Lutador",
  poison: "Venenoso",
  ground: "Terra",
  flying: "Voador",
  psychic: "Psíquico",
  bug: "Inseto",
  rock: "Pedra",
  ghost: "Fantasma",
  dragon: "Dragão",
  dark: "Sombrio",
  steel: "Aço",
  fairy: "Fada",
};

export function transformApiPokemon(apiData: ApiPokemon): Pokemon {
  const getStat = (name: string): number => {
    const stat = apiData.stats.find((s) => s.stat.name === name);
    return stat ? stat.base_stat : 0;
  };

  return {
    id: apiData.id,
    name: apiData.name.charAt(0).toUpperCase() + apiData.name.slice(1),
    types: apiData.types.map(
      (t) => typeTranslation[t.type.name] || t.type.name,
    ),
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
          )?.level_learned_at || 0,
      })),
  };
}
