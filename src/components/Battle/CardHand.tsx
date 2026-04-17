import type { Card, PlayerPokemon } from "../../types";
import { calculateCardDisplayDamage } from "../../utils/battleUtils";

interface CardHandProps {
  player: PlayerPokemon;
  cards: Card[];
  energy: number;
  canPlay: boolean;
  onSelectCard: (card: Card) => void;
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

export default function CardHand({
  player,
  cards,
  energy,
  canPlay,
  onSelectCard,
}: CardHandProps) {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide">
      {cards.length === 0 ? (
        <div className="flex items-center justify-center h-full min-h-30 text-gray-400">
          Sem Cartas
        </div>
      ) : (
        <div className="flex justify-center">
          <div className="flex gap-2 py-4 px-6">
            {cards.map((card, index) => {
              const canAfford = energy >= card.energyCost;
              const bgColor = card.typeless
                ? typeColors.typeless
                : typeColors[card.type] || "bg-gray-500";
              const displayDamage = calculateCardDisplayDamage(player, card);
              const damageIcon = card.damageClass === "physical" ? "👊" : "✨";

              return (
                <button
                  key={`${card.id}-${index}`}
                  onClick={() => {
                    if (canPlay && canAfford) {
                      onSelectCard(card);
                    }
                  }}
                  disabled={!canPlay || !canAfford}
                  className={`
                    ${bgColor} text-white rounded-lg p-3 w-30 shrink-0 text-left
                    ${canPlay && canAfford ? "hover:scale-105 cursor-pointer" : "opacity-50 cursor-not-allowed"}
                    transition-transform
                  `}
                >
                  <h4 className="font-bold capitalize">{card.name}</h4>
                  <p className="text-sm">
                    {damageIcon} {displayDamage}
                  </p>
                  <p className="text-sm">⚡ {card.energyCost}</p>
                  <p className="text-xs mt-1">
                    {card.typeless ? "Sem Tipo" : card.type}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
