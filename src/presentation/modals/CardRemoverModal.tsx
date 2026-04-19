import type { Card } from "../../domain/models/Card";
import type { Pokemon } from "../../domain/models/Pokemon";
import CardDisplay from "../components/common/CardDisplay";
import PanelModal from "../components/common/modal/PanelModal";

interface CardRemoverModalProps {
  runDeck: Card[];
  pokemon: Pokemon;
  onSelect: (card: Card) => void;
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {runDeck.map((card, index) => (
          <button
            key={`${card.id}-${index}`}
            onClick={() => onSelect(card)}
            className="text-left hover:scale-105 transition-transform rounded-lg"
          >
            <CardDisplay card={card} owner={{ pokemon, level: 1 }} />
          </button>
        ))}
      </div>
      {runDeck.length === 0 && (
        <p className="text-gray-400 text-center py-8">Baralho vazio</p>
      )}
    </PanelModal>
  );
}
