import type { Card, PlayerPokemon } from "../../types";
import {
  calculateCardDisplayDamage,
  calculateMaxHp,
  calculateShield,
} from "../../utils/battleUtils";

interface LevelUpModalProps {
  player: PlayerPokemon;
  previousStats: {
    level: number;
    maxHp: number;
    attack: number;
    specialAttack: number;
    defense: number;
    specialDefense: number;
    speed: number;
    shield: number;
  };
  options: Card[];
  onSelect: (card: Card) => void;
  onSkip: () => void;
}

const typeColors: Record<string, string> = {
  normal: "bg-[#A8A878]",
  fire: "bg-[#F08030]",
  water: "bg-[#6890F0]",
  electric: "bg-[#F8D030]",
  grass: "bg-[#78C850]",
  ice: "bg-[#98D8D8]",
  fighting: "bg-[#C03028]",
  poison: "bg-[#A040A0]",
  ground: "bg-[#E0C068]",
  flying: "bg-[#A890F0]",
  psychic: "bg-[#F85888]",
  bug: "bg-[#A8B820]",
  rock: "bg-[#B8A038]",
  ghost: "bg-[#705898]",
  dragon: "bg-[#7038F8]",
  dark: "bg-[#705848]",
  steel: "bg-[#B8B8D0]",
  fairy: "bg-[#E29DE5]",
  typeless: "bg-[#6B6B6B]",
};

export default function LevelUpModal({
  player,
  previousStats,
  options,
  onSelect,
  onSkip,
}: LevelUpModalProps) {
  const newMaxHp = calculateMaxHp(player.pokemon.stats.hp, player.level);
  const newShield = calculateShield(
    player.pokemon.stats.defense,
    player.pokemon.stats.specialDefense,
    player.level,
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto py-8">
      <div className="bg-gray-800 p-6 rounded-xl max-w-4xl w-full mx-4">
        <h2 className="text-3xl font-bold text-yellow-400 mb-2">Level Up!</h2>
        <p className="text-xl text-white mb-4">
          Seu Pokémon subiu para o nível {player.level}!
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-700/50 rounded-lg">
          <div>
            <h3 className="text-lg font-semibold text-yellow-300 mb-2">
              Status
            </h3>
            <div className="space-y-1 text-sm">
              <p>
                HP: {previousStats.maxHp} →{" "}
                <span className="text-green-400">{newMaxHp}</span>
              </p>
              <p>
                Ataque: {previousStats.attack} →{" "}
                <span className="text-green-400">
                  {player.pokemon.stats.attack}
                </span>
              </p>
              <p>
                Ataque Especial: {previousStats.specialAttack} →{" "}
                <span className="text-green-400">
                  {player.pokemon.stats.specialAttack}
                </span>
              </p>
              <p>
                Defesa: {previousStats.defense} →{" "}
                <span className="text-green-400">
                  {player.pokemon.stats.defense}
                </span>
              </p>
              <p>
                Defesa Especial: {previousStats.specialDefense} →{" "}
                <span className="text-green-400">
                  {player.pokemon.stats.specialDefense}
                </span>
              </p>
              <p>
                Velocidade: {previousStats.speed} →{" "}
                <span className="text-green-400">
                  {player.pokemon.stats.speed}
                </span>
              </p>
              <p>
                Escudo: {previousStats.shield} →{" "}
                <span className="text-green-400">{newShield}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <img
              src={player.pokemon.sprites.animated.front}
              alt={player.pokemon.name}
              className="w-32 h-32"
            />
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-3">Escolha uma nova carta</h3>

        {options.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {options.map((card, index) => {
              const bgColor = card.typeless
                ? typeColors.typeless
                : typeColors[card.type] || "bg-gray-500";
              const displayDamage = calculateCardDisplayDamage(player, card);
              const damageIcon = card.damageClass === "physical" ? "👊" : "✨";

              return (
                <button
                  key={`${card.id}-${index}`}
                  onClick={() => onSelect(card)}
                  className={`${bgColor} text-white rounded-lg p-4 text-left hover:scale-105 transition-transform`}
                >
                  <h4 className="font-bold text-lg capitalize mb-2">
                    {card.name}
                  </h4>
                  <p className="text-sm mb-1">
                    {damageIcon} {displayDamage}
                  </p>
                  <p className="text-sm mb-1">⚡ {card.energyCost}</p>
                  <p className="text-xs uppercase">
                    {card.typeless ? "Sem Tipo" : card.type}
                  </p>
                  <p className="text-xs mt-2 opacity-80">{card.damageClass}</p>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">
            Nenhuma carta disponível para aprender.
          </p>
        )}

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onSkip}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold"
          >
            Pular
          </button>
        </div>

        <p className="text-sm text-gray-400 mt-4 text-center">
          A carta escolhida será adicionada ao seu baralho permanentemente nesta
          run.
        </p>
      </div>
    </div>
  );
}
