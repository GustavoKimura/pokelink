type PokemonType =
  | "normal"
  | "fire"
  | "water"
  | "electric"
  | "grass"
  | "ice"
  | "fighting"
  | "poison"
  | "ground"
  | "flying"
  | "psychic"
  | "bug"
  | "rock"
  | "ghost"
  | "dragon"
  | "dark"
  | "steel"
  | "fairy";

const IMMUNE = 0;
const NOT_VERY_EFFECTIVE = 0.5;
const NEUTRAL = 1;
const SUPER_EFFECTIVE = 2;

function createBaseChart(): Record<PokemonType, Record<PokemonType, number>> {
  const types = getPokemonTypes();
  const chart = {} as Record<PokemonType, Record<PokemonType, number>>;

  for (const attacker of types) {
    chart[attacker] = {} as Record<PokemonType, number>;
    for (const defender of types) {
      chart[attacker][defender] = NEUTRAL;
    }
  }

  return chart;
}

function getPokemonTypes(): PokemonType[] {
  return [
    "normal",
    "fire",
    "water",
    "electric",
    "grass",
    "ice",
    "fighting",
    "poison",
    "ground",
    "flying",
    "psychic",
    "bug",
    "rock",
    "ghost",
    "dragon",
    "dark",
    "steel",
    "fairy",
  ];
}

function applyEffectivenessRules(
  chart: Record<PokemonType, Record<PokemonType, number>>,
): void {
  const rules: [PokemonType, PokemonType, number][] = [
    ["normal", "ghost", IMMUNE],
    ["electric", "ground", IMMUNE],
    ["fighting", "ghost", IMMUNE],
    ["poison", "steel", IMMUNE],
    ["ground", "flying", IMMUNE],
    ["psychic", "dark", IMMUNE],
    ["ghost", "normal", IMMUNE],
    ["dragon", "fairy", IMMUNE],

    ["fire", "grass", SUPER_EFFECTIVE],
    ["fire", "ice", SUPER_EFFECTIVE],
    ["fire", "bug", SUPER_EFFECTIVE],
    ["fire", "steel", SUPER_EFFECTIVE],
    ["water", "fire", SUPER_EFFECTIVE],
    ["water", "ground", SUPER_EFFECTIVE],
    ["water", "rock", SUPER_EFFECTIVE],
    ["electric", "water", SUPER_EFFECTIVE],
    ["electric", "flying", SUPER_EFFECTIVE],
    ["grass", "water", SUPER_EFFECTIVE],
    ["grass", "ground", SUPER_EFFECTIVE],
    ["grass", "rock", SUPER_EFFECTIVE],
    ["ice", "grass", SUPER_EFFECTIVE],
    ["ice", "ground", SUPER_EFFECTIVE],
    ["ice", "flying", SUPER_EFFECTIVE],
    ["ice", "dragon", SUPER_EFFECTIVE],
    ["fighting", "normal", SUPER_EFFECTIVE],
    ["fighting", "ice", SUPER_EFFECTIVE],
    ["fighting", "rock", SUPER_EFFECTIVE],
    ["fighting", "dark", SUPER_EFFECTIVE],
    ["fighting", "steel", SUPER_EFFECTIVE],
    ["poison", "grass", SUPER_EFFECTIVE],
    ["poison", "fairy", SUPER_EFFECTIVE],
    ["ground", "fire", SUPER_EFFECTIVE],
    ["ground", "electric", SUPER_EFFECTIVE],
    ["ground", "poison", SUPER_EFFECTIVE],
    ["ground", "rock", SUPER_EFFECTIVE],
    ["ground", "steel", SUPER_EFFECTIVE],
    ["flying", "grass", SUPER_EFFECTIVE],
    ["flying", "fighting", SUPER_EFFECTIVE],
    ["flying", "bug", SUPER_EFFECTIVE],
    ["psychic", "fighting", SUPER_EFFECTIVE],
    ["psychic", "poison", SUPER_EFFECTIVE],
    ["bug", "grass", SUPER_EFFECTIVE],
    ["bug", "psychic", SUPER_EFFECTIVE],
    ["bug", "dark", SUPER_EFFECTIVE],
    ["rock", "fire", SUPER_EFFECTIVE],
    ["rock", "ice", SUPER_EFFECTIVE],
    ["rock", "flying", SUPER_EFFECTIVE],
    ["rock", "bug", SUPER_EFFECTIVE],
    ["ghost", "psychic", SUPER_EFFECTIVE],
    ["ghost", "ghost", SUPER_EFFECTIVE],
    ["dragon", "dragon", SUPER_EFFECTIVE],
    ["dark", "psychic", SUPER_EFFECTIVE],
    ["dark", "ghost", SUPER_EFFECTIVE],
    ["steel", "ice", SUPER_EFFECTIVE],
    ["steel", "rock", SUPER_EFFECTIVE],
    ["steel", "fairy", SUPER_EFFECTIVE],
    ["fairy", "fighting", SUPER_EFFECTIVE],
    ["fairy", "dragon", SUPER_EFFECTIVE],
    ["fairy", "dark", SUPER_EFFECTIVE],

    ["normal", "rock", NOT_VERY_EFFECTIVE],
    ["normal", "steel", NOT_VERY_EFFECTIVE],
    ["fire", "fire", NOT_VERY_EFFECTIVE],
    ["fire", "water", NOT_VERY_EFFECTIVE],
    ["fire", "rock", NOT_VERY_EFFECTIVE],
    ["fire", "dragon", NOT_VERY_EFFECTIVE],
    ["water", "water", NOT_VERY_EFFECTIVE],
    ["water", "grass", NOT_VERY_EFFECTIVE],
    ["water", "dragon", NOT_VERY_EFFECTIVE],
    ["electric", "electric", NOT_VERY_EFFECTIVE],
    ["electric", "grass", NOT_VERY_EFFECTIVE],
    ["electric", "dragon", NOT_VERY_EFFECTIVE],
    ["grass", "fire", NOT_VERY_EFFECTIVE],
    ["grass", "grass", NOT_VERY_EFFECTIVE],
    ["grass", "poison", NOT_VERY_EFFECTIVE],
    ["grass", "flying", NOT_VERY_EFFECTIVE],
    ["grass", "bug", NOT_VERY_EFFECTIVE],
    ["grass", "dragon", NOT_VERY_EFFECTIVE],
    ["grass", "steel", NOT_VERY_EFFECTIVE],
    ["ice", "fire", NOT_VERY_EFFECTIVE],
    ["ice", "water", NOT_VERY_EFFECTIVE],
    ["ice", "ice", NOT_VERY_EFFECTIVE],
    ["ice", "steel", NOT_VERY_EFFECTIVE],
    ["fighting", "poison", NOT_VERY_EFFECTIVE],
    ["fighting", "flying", NOT_VERY_EFFECTIVE],
    ["fighting", "psychic", NOT_VERY_EFFECTIVE],
    ["fighting", "bug", NOT_VERY_EFFECTIVE],
    ["fighting", "fairy", NOT_VERY_EFFECTIVE],
    ["poison", "poison", NOT_VERY_EFFECTIVE],
    ["poison", "ground", NOT_VERY_EFFECTIVE],
    ["poison", "rock", NOT_VERY_EFFECTIVE],
    ["poison", "ghost", NOT_VERY_EFFECTIVE],
    ["ground", "grass", NOT_VERY_EFFECTIVE],
    ["ground", "bug", NOT_VERY_EFFECTIVE],
    ["flying", "electric", NOT_VERY_EFFECTIVE],
    ["flying", "rock", NOT_VERY_EFFECTIVE],
    ["flying", "steel", NOT_VERY_EFFECTIVE],
    ["psychic", "psychic", NOT_VERY_EFFECTIVE],
    ["psychic", "steel", NOT_VERY_EFFECTIVE],
    ["bug", "fire", NOT_VERY_EFFECTIVE],
    ["bug", "fighting", NOT_VERY_EFFECTIVE],
    ["bug", "poison", NOT_VERY_EFFECTIVE],
    ["bug", "flying", NOT_VERY_EFFECTIVE],
    ["bug", "ghost", NOT_VERY_EFFECTIVE],
    ["bug", "steel", NOT_VERY_EFFECTIVE],
    ["bug", "fairy", NOT_VERY_EFFECTIVE],
    ["rock", "fighting", NOT_VERY_EFFECTIVE],
    ["rock", "ground", NOT_VERY_EFFECTIVE],
    ["rock", "steel", NOT_VERY_EFFECTIVE],
    ["ghost", "dark", NOT_VERY_EFFECTIVE],
    ["dragon", "steel", NOT_VERY_EFFECTIVE],
    ["dark", "fighting", NOT_VERY_EFFECTIVE],
    ["dark", "dark", NOT_VERY_EFFECTIVE],
    ["dark", "fairy", NOT_VERY_EFFECTIVE],
    ["steel", "fire", NOT_VERY_EFFECTIVE],
    ["steel", "water", NOT_VERY_EFFECTIVE],
    ["steel", "electric", NOT_VERY_EFFECTIVE],
    ["steel", "steel", NOT_VERY_EFFECTIVE],
    ["fairy", "fire", NOT_VERY_EFFECTIVE],
    ["fairy", "poison", NOT_VERY_EFFECTIVE],
    ["fairy", "steel", NOT_VERY_EFFECTIVE],
  ];

  for (const [attacker, defender, multiplier] of rules) {
    chart[attacker][defender] = multiplier;
  }
}

const baseChart = createBaseChart();
applyEffectivenessRules(baseChart);

export const typeEffectivenessChart = baseChart;
