export const DAMAGE_SCALING_FACTOR = 0.038;

export const SHIELD_DIVISOR = 18;
export const SHIELD_BASE = 4;

export const STARTING_DECK_SIZE = 5;
export const CARDS_PER_TURN = 3;
export const MAX_ENERGY = 3;

export const MAP_ROWS = 10;
export const MAP_COLS = 4;

export const BOSS_ID = 6;

export const WILD_POKEMON_IDS = [
  10, 13, 16, 19, 21, 23, 25, 27, 29, 32, 35, 37, 39, 41, 43, 46, 48, 50, 52,
  54,
];

export const XP_BASE = 40;

export const REST_HEAL_PERCENT = 0.5;

export const REVIVE_HEAL_PERCENT = 0.5;
export const DEFAULT_REVIVES = 1;

export const VICTORY_XP = 150;

export const STARTER_UNLOCK_XP: Record<string, number> = {
  gastly: 300,
  larvitar: 900,
};

export const STARTER_OPTIONS = [
  {
    id: 133,
    name: "eevee",
    displayName: "Eevee",
    unlocked: true,
    requiredXp: 0,
    description:
      "Pokémon Evolução. Adaptável e versátil, ideal para iniciantes.",
  },
  {
    id: 92,
    name: "gastly",
    displayName: "Gastly",
    unlocked: false,
    requiredXp: 300,
    description:
      "Pokémon Gás. Especialista em ataques fantasmagóricos e venenosos.",
  },
  {
    id: 246,
    name: "larvitar",
    displayName: "Larvitar",
    unlocked: false,
    requiredXp: 900,
    description: "Pokémon Pele Rocha. Crescimento lento, mas poder devastador.",
  },
];
