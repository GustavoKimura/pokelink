import type { Card } from "../../types";

interface CardHandProps {
  cards: Card[];
  energy: number;
  canPlay: boolean;
  onSelectCard: (card: Card) => void;
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

export default function CardHand({
  cards,
  energy,
  canPlay,
  onSelectCard,
}: CardHandProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Sua Mão ({cards.length})</h3>
        <span className="text-sm bg-blue-600 px-3 py-1 rounded-full">
          ⚡ {energy}/3
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {cards.map((card, index) => {
          const canAfford = energy >= card.energyCost;
          const bgColor = typeColors[card.type] || "bg-gray-500";

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
              <p className="text-sm">💥 {card.power}</p>
              <p className="text-sm">⚡ {card.energyCost}</p>
              <p className="text-xs mt-1">{card.type}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
