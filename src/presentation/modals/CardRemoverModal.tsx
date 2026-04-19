import type { Card } from "../../domain/models/Card";
import type { Pokemon } from "../../domain/models/Pokemon";
import PanelModal from "../components/common/modal/PanelModal";
import CardCollection from "../components/common/CardCollection";

interface CardRemoverModalProps {
  runDeck: Card[];
  pokemon: Pokemon;
  onSelect: (index: number) => void;
  onClose: () => void;
}

export default function CardRemoverModal({
  runDeck,
  pokemon,
  onSelect,
  onClose,
}: CardRemoverModalProps) {
  return (
    <PanelModal title="Remover Carta" onClose={onClose}>
      <p className="text-gray-300 mb-4">
        Selecione uma carta para remover permanentemente do baralho da run.
      </p>
      <CardCollection
        cards={runDeck}
        owner={{ pokemon, level: 1 }}
        onCardClick={(_, index) => onSelect(index)}
        emptyMessage="Baralho vazio"
      />
    </PanelModal>
  );
}
