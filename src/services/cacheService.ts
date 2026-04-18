const CACHE_PREFIX = "poke_";
const MAX_CACHE_ITEMS = 50;

const cleanOldestCache = () => {
  const keys = Object.keys(localStorage).filter((k) =>
    k.startsWith(CACHE_PREFIX),
  );
  if (keys.length <= MAX_CACHE_ITEMS) return;
  const sorted = keys.sort((a, b) => {
    const timeA = localStorage.getItem(a + "_time") || "0";
    const timeB = localStorage.getItem(b + "_time") || "0";
    return parseInt(timeA) - parseInt(timeB);
  });
  const toRemove = sorted.slice(0, keys.length - MAX_CACHE_ITEMS);
  toRemove.forEach((key) => {
    localStorage.removeItem(key);
    localStorage.removeItem(key + "_time");
  });
};

export const fetchAndCache = async <T>(
  url: string,
  key: string,
): Promise<T> => {
  const cached = localStorage.getItem(key);
  if (cached) return JSON.parse(cached) as T;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  const data = await response.json();
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(key + "_time", Date.now().toString());
    cleanOldestCache();
  } catch {
    console.warn("Storage quota exceeded, cleaning cache...");
    cleanOldestCache();
    try {
      localStorage.setItem(key, JSON.stringify(data));
      localStorage.setItem(key + "_time", Date.now().toString());
    } catch {
      console.error("Still cannot store data, proceeding without cache");
    }
  }
  return data;
};

export const getAnimatedSpriteUrl = (
  pokemonId: number,
  back: boolean = false,
): string => {
  const base =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated";
  return back ? `${base}/back/${pokemonId}.gif` : `${base}/${pokemonId}.gif`;
};

export const getOfficialArtworkUrl = (pokemonId: number): string =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
