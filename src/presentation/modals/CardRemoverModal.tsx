import type { Card } from "../../domain/models/Card";
import type { Pokemon } from "../../domain/models/Pokemon";
import { X } from "lucide-react";
import CardDisplay from "../components/common/CardDisplay";

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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl max-w-4xl w-full max-h-[80vh] mx-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-yellow-400">Remover Carta</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="text-gray-300 mb-4">
          Selecione uma carta para remover permanentemente do baralho da run.
        </p>
        <div className="flex-1 overflow-y-auto">
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
        </div>
      </div>
    </div>
  );
}
