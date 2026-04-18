import type { Card } from "../../../models/Card";
import { X } from "lucide-react";

interface DiscardPileModalProps {
  discardPile: Card[];
  pokemonName: string;
  onClose: () => void;
}

export default function DiscardPileModal({
  discardPile,
  pokemonName,
  onClose,
}: DiscardPileModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl max-w-4xl w-full max-h-[80vh] mx-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-yellow-400">
            Pilha de Descarte - {pokemonName}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {discardPile.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              Pilha de descarte vazia
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {discardPile.map((card, index) => (
                <div
                  key={index}
                  className="bg-gray-700 p-3 rounded-lg opacity-75"
                >
                  <h4 className="font-bold capitalize">{card.name}</h4>
                  <p className="text-sm">💥 {card.power}</p>
                  <p className="text-sm">⚡ {card.energyCost}</p>
                  <p className="text-xs uppercase">{card.type}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
