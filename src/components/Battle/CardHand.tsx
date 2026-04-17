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
  Normal: "bg-[#A8A878]",
  Fogo: "bg-[#F08030]",
  Água: "bg-[#6890F0]",
  Elétrico: "bg-[#F8D030]",
  Planta: "bg-[#78C850]",
  Gelo: "bg-[#98D8D8]",
  Lutador: "bg-[#C03028]",
  Venenoso: "bg-[#A040A0]",
  Terra: "bg-[#E0C068]",
  Voador: "bg-[#A890F0]",
  Psíquico: "bg-[#F85888]",
  Inseto: "bg-[#A8B820]",
  Pedra: "bg-[#B8A038]",
  Fantasma: "bg-[#705898]",
  Dragão: "bg-[#7038F8]",
  Sombrio: "bg-[#705848]",
  Aço: "bg-[#B8B8D0]",
  Fada: "bg-[#E29DE5]",
};

export default function CardHand({
  player,
  cards,
  energy,
  canPlay,
  onSelectCard,
}: CardHandProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {cards.map((card, index) => {
        const canAfford = energy >= card.energyCost;
        const bgColor = typeColors[card.type] || "bg-gray-500";
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
              ${bgColor} text-white rounded-lg p-3 min-w-30 text-left
              ${canPlay && canAfford ? "hover:scale-105 cursor-pointer" : "opacity-50 cursor-not-allowed"}
              transition-transform
            `}
          >
            <h4 className="font-bold capitalize">{card.name}</h4>
            <p className="text-sm">
              {damageIcon} {displayDamage}
            </p>
            <p className="text-sm">⚡ {card.energyCost}</p>
            <p className="text-xs mt-1">{card.type}</p>
          </button>
        );
      })}
    </div>
  );
}
