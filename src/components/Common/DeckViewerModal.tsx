import { useState } from "react";
import type { Card } from "../../types";
import { X } from "lucide-react";

interface DeckViewerModalProps {
  deck: Card[];
  hand: Card[];
  discardPile: Card[];
  onClose: () => void;
}

export default function DeckViewerModal({
  deck,
  hand,
  discardPile,
  onClose,
}: DeckViewerModalProps) {
  const [activeTab, setActiveTab] = useState<"deck" | "hand" | "discard">(
    "deck",
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl max-w-4xl w-full max-h-[80vh] mx-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-yellow-400">Baralho</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-2 mb-4 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("deck")}
            className={`px-4 py-2 ${activeTab === "deck" ? "border-b-2 border-yellow-400 text-yellow-400" : "text-gray-400"}`}
          >
            Pilha de Compra ({deck.length})
          </button>
          <button
            onClick={() => setActiveTab("hand")}
            className={`px-4 py-2 ${activeTab === "hand" ? "border-b-2 border-yellow-400 text-yellow-400" : "text-gray-400"}`}
          >
            Mão ({hand.length})
          </button>
          <button
            onClick={() => setActiveTab("discard")}
            className={`px-4 py-2 ${activeTab === "discard" ? "border-b-2 border-yellow-400 text-yellow-400" : "text-gray-400"}`}
          >
            Pilha de Descarte ({discardPile.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "deck" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {deck.map((_, index) => (
                <div
                  key={index}
                  className="bg-blue-900/50 p-4 rounded-lg border border-blue-700 flex items-center justify-center"
                >
                  <span className="text-blue-300">🎴 Carta</span>
                </div>
              ))}
              {deck.length === 0 && (
                <p className="text-gray-400 col-span-full text-center py-8">
                  Pilha de compra vazia
                </p>
              )}
            </div>
          )}

          {activeTab === "hand" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {hand.map((card, index) => (
                <div key={index} className="bg-gray-700 p-3 rounded-lg">
                  <h4 className="font-bold capitalize">{card.name}</h4>
                  <p className="text-sm">💥 {card.power}</p>
                  <p className="text-sm">⚡ {card.energyCost}</p>
                  <p className="text-xs uppercase">{card.type}</p>
                </div>
              ))}
              {hand.length === 0 && (
                <p className="text-gray-400 col-span-full text-center py-8">
                  Mão vazia
                </p>
              )}
            </div>
          )}

          {activeTab === "discard" && (
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
              {discardPile.length === 0 && (
                <p className="text-gray-400 col-span-full text-center py-8">
                  Pilha de descarte vazia
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
