import type { Card } from "../../../domain/models/Card";
import type { Pokemon } from "../../../domain/models/Pokemon";
import CardDisplay from "./CardDisplay";
import { Lock, LockOpen } from "lucide-react";

interface CardCollectionProps {
  cards: Card[];
  owner: { pokemon: Pokemon; level: number };
  gridClasses?: string;
  cardClassName?: string;
  emptyMessage?: string;
  onCardClick?: (card: Card, index: number) => void;
  lockedIndices?: Set<number>;
  onLockToggle?: (index: number) => void;
}

export default function CardCollection({
  cards,
  owner,
  gridClasses = "grid grid-cols-2 md:grid-cols-4 gap-2",
  cardClassName,
  emptyMessage = "Nenhuma carta para exibir.",
  onCardClick,
  lockedIndices,
  onLockToggle,
}: CardCollectionProps) {
  if (cards.length === 0) {
    return <p className="text-gray-400 text-center py-8">{emptyMessage}</p>;
  }

  return (
    <div className={gridClasses}>
      {cards.map((card, index) => {
        const content = <CardDisplay card={card} owner={owner} />;
        const isLocked = lockedIndices?.has(index);

        const cardElement = (
          <div className="relative">
            {content}
            {onLockToggle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLockToggle(index);
                }}
                className="absolute top-1 right-1 p-1 bg-gray-900/50 rounded hover:bg-gray-900"
                title={isLocked ? "Desafixar carta" : "Fixar carta"}
              >
                {isLocked ? (
                  <Lock className="w-4 h-4 text-yellow-400" />
                ) : (
                  <LockOpen className="w-4 h-4 text-gray-400" />
                )}
              </button>
            )}
          </div>
        );

        if (onCardClick) {
          return (
            <button
              key={`${card.id}-${index}`}
              onClick={() => onCardClick(card, index)}
              className={`text-left hover:scale-105 transition-transform rounded-lg ${cardClassName}`}
            >
              {cardElement}
            </button>
          );
        }
        return (
          <div key={`${card.id}-${index}`} className={cardClassName}>
            {cardElement}
          </div>
        );
      })}
    </div>
  );
}
