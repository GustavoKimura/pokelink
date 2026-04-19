import type { Card } from "../../../domain/models/Card";
import type { Pokemon } from "../../../domain/models/Pokemon";
import PanelModal from "../common/modal/PanelModal";
import CardCollection from "../common/CardCollection";

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
      <CardCollection
        cards={discardPile}
        owner={owner}
        cardClassName="opacity-75"
        emptyMessage="Pilha de descarte vazia"
      />
    </PanelModal>
  );
}
