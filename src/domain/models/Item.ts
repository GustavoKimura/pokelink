export type ItemCategory = "evolution" | "level" | "heal" | "deck" | "misc";

export interface Item {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: ItemCategory;
  sprite: string;
  price: number;
  targetType?: "pokemon" | "card" | "self";
  effect: ItemEffect;
}

export type ItemEffect =
  | { type: "evolution-stone"; stoneType: string }
  | { type: "trade-cable" }
  | { type: "friendship-boost"; amount: number }
  | { type: "rare-candy" }
  | { type: "potion"; healAmount: number }
  | { type: "card-remover" };

export interface InventoryItem {
  itemId: string;
  quantity: number;
}

export const ITEMS_DB: Record<string, Item> = {
  "fire-stone": {
    id: "fire-stone",
    name: "fire-stone",
    displayName: "Pedra de Fogo",
    description: "Faz certas espécies de Pokémon evoluírem.",
    category: "evolution",
    sprite: "🔥",
    price: 50,
    targetType: "pokemon",
    effect: { type: "evolution-stone", stoneType: "fire" },
  },
  "water-stone": {
    id: "water-stone",
    name: "water-stone",
    displayName: "Pedra de Água",
    description: "Faz certas espécies de Pokémon evoluírem.",
    category: "evolution",
    sprite: "💧",
    price: 50,
    targetType: "pokemon",
    effect: { type: "evolution-stone", stoneType: "water" },
  },
  "thunder-stone": {
    id: "thunder-stone",
    name: "thunder-stone",
    displayName: "Pedra de Trovão",
    description: "Faz certas espécies de Pokémon evoluírem.",
    category: "evolution",
    sprite: "⚡",
    price: 50,
    targetType: "pokemon",
    effect: { type: "evolution-stone", stoneType: "thunder" },
  },
  "leaf-stone": {
    id: "leaf-stone",
    name: "leaf-stone",
    displayName: "Pedra da Folha",
    description: "Faz certas espécies de Pokémon evoluírem.",
    category: "evolution",
    sprite: "🍃",
    price: 50,
    targetType: "pokemon",
    effect: { type: "evolution-stone", stoneType: "leaf" },
  },
  "moon-stone": {
    id: "moon-stone",
    name: "moon-stone",
    displayName: "Pedra da Lua",
    description: "Faz certas espécies de Pokémon evoluírem.",
    category: "evolution",
    sprite: "🌙",
    price: 50,
    targetType: "pokemon",
    effect: { type: "evolution-stone", stoneType: "moon" },
  },
  "trade-cable": {
    id: "trade-cable",
    name: "trade-cable",
    displayName: "Cabo de Troca",
    description: "Simula uma troca para evoluir certos Pokémon.",
    category: "evolution",
    sprite: "🔌",
    price: 80,
    targetType: "pokemon",
    effect: { type: "trade-cable" },
  },
  "rare-candy": {
    id: "rare-candy",
    name: "rare-candy",
    displayName: "Doce Raro",
    description: "Aumenta o nível de um Pokémon em 1.",
    category: "level",
    sprite: "🍬",
    price: 40,
    targetType: "pokemon",
    effect: { type: "rare-candy" },
  },
  potion: {
    id: "potion",
    name: "potion",
    displayName: "Poção",
    description: "Restaura 20 HP de um Pokémon.",
    category: "heal",
    sprite: "🧪",
    price: 15,
    targetType: "pokemon",
    effect: { type: "potion", healAmount: 20 },
  },
  "card-remover": {
    id: "card-remover",
    name: "card-remover",
    displayName: "Removedor de Carta",
    description: "Remove permanentemente uma carta do baralho da run.",
    category: "deck",
    sprite: "🗑️",
    price: 30,
    targetType: "card",
    effect: { type: "card-remover" },
  },
};

export const SHOP_ITEM_POOL: string[] = [
  "fire-stone",
  "water-stone",
  "thunder-stone",
  "leaf-stone",
  "moon-stone",
  "trade-cable",
  "rare-candy",
  "potion",
  "card-remover",
];
