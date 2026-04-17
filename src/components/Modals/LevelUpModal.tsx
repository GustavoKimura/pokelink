import type { Card, PlayerPokemon } from "../../types";
import { calculateCardDisplayDamage } from "../../utils/battleUtils";

interface LevelUpModalProps {
  player: PlayerPokemon;
  options: Card[];
  onSelect: (card: Card) => void;
}

const typeColors: Record<string, string> = {
  normal: "bg-gray-400",
  fire: "bg-red-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  grass: "bg-green-500",
  ice: "bg-cyan-300",
  fighting: "bg-orange-700",
  poison: "bg-purple-500",
  ground: "bg-yellow-700",
  flying: "bg-indigo-300",
  psychic: "bg-pink-500",
  bug: "bg-lime-500",
  rock: "bg-yellow-600",
  ghost: "bg-purple-700",
  dragon: "bg-indigo-700",
  dark: "bg-gray-700",
  steel: "bg-gray-400",
  fairy: "bg-pink-300",
};

export default function LevelUpModal({
  player,
  options,
  onSelect,
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {options.map((card, index) => {
            const bgColor = typeColors[card.type] || "bg-gray-500";
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
                <p className="text-xs uppercase">{card.type}</p>
                <p className="text-xs mt-2 opacity-80">{card.damageClass}</p>
              </button>
            );
          })}
        </div>

        <p className="text-sm text-gray-400 mt-6 text-center">
          A carta escolhida será adicionada ao seu baralho permanentemente nesta
          run.
        </p>
      </div>
    </div>
  );
}
