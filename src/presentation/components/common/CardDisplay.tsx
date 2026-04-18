import type { Card } from "../../../domain/models/Card";
import type { Pokemon } from "../../../domain/models/Pokemon";
import { calculateCardDisplayDamage } from "../../../domain/services/battleService";
import { translateType } from "../../../shared/utils/formatters";
import {
  typeColors,
  damageIconMap,
} from "../../../domain/constants/styleConstants";

interface CardDisplayProps {
  card: Card;
  owner: { pokemon: Pokemon; level: number };
}

export default function CardDisplay({ card, owner }: CardDisplayProps) {
  const bgColor = card.typeless
    ? typeColors.typeless
    : typeColors[card.type] || "bg-gray-500";
  const displayDamage = calculateCardDisplayDamage(owner, card);
  const damageIcon = damageIconMap[card.damageClass] || "👊";
  const translatedType = translateType(card.type);

  return (
    <div
      className={`${bgColor} text-white rounded-lg p-3 h-full flex flex-col justify-between`}
    >
      <div>
        <h4 className="font-bold capitalize">{card.name}</h4>
        <p className="text-sm">
          {damageIcon} {displayDamage}
        </p>
        <p className="text-sm">⚡ {card.energyCost}</p>
      </div>
      <p className="text-xs mt-1 uppercase">
        {card.typeless ? "Sem Tipo" : translatedType}
      </p>
    </div>
  );
}
