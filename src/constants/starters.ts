import type { StarterOption } from "../types";

export const STARTER_OPTIONS: StarterOption[] = [
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
