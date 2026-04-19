import type { Card } from "../../../domain/models/Card";
import type { Pokemon } from "../../../domain/models/Pokemon";
import CardDisplay from "../common/CardDisplay";
import PanelModal from "../common/modal/PanelModal";

interface DiscardPileModalProps {
  discardPile: Card[];
  owner: { pokemon: Pokemon; level: number };
  onClose: () => void;
}

export default function DiscardPileModal({
  discardPile,
  owner,
  onClose,
}: DiscardPileModalProps) {
  return (
    <PanelModal
      title={`Pilha de Descarte - ${owner.pokemon.name}`}
      onClose={onClose}
    >
      {discardPile.length === 0 ? (
        <p className="text-gray-400 text-center py-8">
          Pilha de descarte vazia
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {discardPile.map((card, index) => (
            <div key={index} className="opacity-75">
              <CardDisplay card={card} owner={owner} />
            </div>
          ))}
        </div>
      )}
    </PanelModal>
  );
}
