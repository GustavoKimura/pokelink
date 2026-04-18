import type { Card } from "../../../domain/models/Card";
import type { PlayerPokemon } from "../../../domain/models/Player";
import CardDisplay from "../common/CardDisplay";

interface CardHandProps {
  player: PlayerPokemon;
  cards: Card[];
  energy: number;
  canPlay: boolean;
  onSelectCard: (card: Card) => void;
}

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
              return (
                <button
                  key={`${card.id}-${index}`}
                  onClick={() => {
                    if (canPlay && canAfford) onSelectCard(card);
                  }}
                  disabled={!canPlay || !canAfford}
                  className={`
                    w-30 shrink-0 text-left rounded-lg
                    ${canPlay && canAfford ? "hover:scale-105 cursor-pointer" : "opacity-50 cursor-not-allowed"}
                    transition-transform
                  `}
                >
                  <CardDisplay card={card} owner={player} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
