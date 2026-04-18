import type { Card } from "../../../domain/models/Card";
import type { Pokemon } from "../../../domain/models/Pokemon";
import CardDisplay from "./CardDisplay";
import { X } from "lucide-react";

interface DeckViewerModalProps {
  title?: string;
  runDeck: Card[];
  pokemon: Pokemon;
  onClose: () => void;
}

export default function DeckViewerModal({
  title = "Baralho da Run",
  runDeck,
  pokemon,
  onClose,
}: DeckViewerModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl max-w-4xl w-full max-h-[80vh] mx-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-yellow-400">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {runDeck.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Baralho vazio</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {runDeck.map((card, index) => (
                <div key={index}>
                  <CardDisplay card={card} owner={{ pokemon, level: 1 }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
