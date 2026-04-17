import type { Card, PlayerPokemon } from "../../types";
import { calculateCardDisplayDamage } from "../../utils/battleUtils";

interface LevelUpModalProps {
  player: PlayerPokemon;
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
  options,
  onSelect,
  onSkip,
}: LevelUpModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl max-w-4xl w-full mx-4">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">
          Level Up! Escolha uma nova carta
        </h2>
        <p className="text-gray-300 mb-6">
          Seu Pokémon subiu para o nível {player.level}!
        </p>

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
                  <h3 className="font-bold text-lg capitalize mb-2">
                    {card.name}
                  </h3>
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
          <p className="text-gray-400 text-center py-8">
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
