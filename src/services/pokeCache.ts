const CACHE_PREFIX = "poke_";

interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string | null;
    back_default: string | null;
    other?: {
      "official-artwork"?: {
        front_default: string | null;
      };
    };
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

interface Move {
  id: number;
  name: string;
  power: number | null;
  pp: number;
  type: { name: string };
  damage_class: { name: string };
}

async function fetchAndCache<T>(url: string, key: string): Promise<T> {
  const cached = localStorage.getItem(key);
  if (cached) {
    return JSON.parse(cached) as T;
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  const data = await response.json();
  localStorage.setItem(key, JSON.stringify(data));
  return data;
}

export async function getPokemon(id: number | string): Promise<Pokemon> {
  const key = `${CACHE_PREFIX}pokemon_${id}`;
  return fetchAndCache<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${id}`, key);
}

export async function getMove(urlOrId: string | number): Promise<Move> {
  let id: string;
  if (typeof urlOrId === "string" && urlOrId.includes("/")) {
    const parts = urlOrId.split("/");
    id = parts[parts.length - 2];
  } else {
    id = String(urlOrId);
  }
  const key = `${CACHE_PREFIX}move_${id}`;
  return fetchAndCache<Move>(`https://pokeapi.co/api/v2/move/${id}`, key);
}

export function getAnimatedSpriteUrl(
  pokemonId: number,
  back: boolean = false,
): string {
  const base =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated";
  const suffix = back ? "back" : "";
  return `${base}${suffix ? "/" + suffix : ""}/${pokemonId}.gif`;
}

export function getOfficialArtworkUrl(pokemonId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
}
