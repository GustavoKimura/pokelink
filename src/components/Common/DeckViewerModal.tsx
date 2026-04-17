import { useState } from "react";
import type { Card } from "../../types";
import { X } from "lucide-react";

interface DeckViewerModalProps {
  title?: string;
  runDeck: Card[];
  currentDeckCount?: number;
  currentDiscardPile?: Card[];
  handCount?: number;
  onClose: () => void;
}

export default function DeckViewerModal({
  title = "Baralho",
  runDeck,
  currentDeckCount,
  currentDiscardPile = [],
  handCount,
  onClose,
}: DeckViewerModalProps) {
  const [activeTab, setActiveTab] = useState<"run" | "discard">("run");

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl max-w-4xl w-full max-h-[80vh] mx-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-yellow-400">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-2 mb-4 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("run")}
            className={`px-4 py-2 ${activeTab === "run" ? "border-b-2 border-yellow-400 text-yellow-400" : "text-gray-400"}`}
          >
            Baralho da Run ({runDeck.length})
          </button>
          {currentDiscardPile.length > 0 && (
            <button
              onClick={() => setActiveTab("discard")}
              className={`px-4 py-2 ${activeTab === "discard" ? "border-b-2 border-yellow-400 text-yellow-400" : "text-gray-400"}`}
            >
              Pilha de Descarte ({currentDiscardPile.length})
            </button>
          )}
          {handCount !== undefined && (
            <div className="ml-auto text-gray-400 px-4 py-2">
              Mão: {handCount} cartas
            </div>
          )}
          {currentDeckCount !== undefined && (
            <div className="text-gray-400 px-4 py-2">
              Pilha de Compra: {currentDeckCount} cartas
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === "run" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {runDeck.map((card, index) => (
                <div key={index} className="bg-gray-700 p-3 rounded-lg">
                  <h4 className="font-bold capitalize">{card.name}</h4>
                  <p className="text-sm">💥 {card.power}</p>
                  <p className="text-sm">⚡ {card.energyCost}</p>
                  <p className="text-xs uppercase">{card.type}</p>
                </div>
              ))}
              {runDeck.length === 0 && (
                <p className="text-gray-400 col-span-full text-center py-8">
                  Baralho vazio
                </p>
              )}
            </div>
          )}

          {activeTab === "discard" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {currentDiscardPile.map((card, index) => (
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
              {currentDiscardPile.length === 0 && (
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
