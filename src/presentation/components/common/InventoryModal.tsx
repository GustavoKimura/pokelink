import { useState } from "react";
import toast from "react-hot-toast";
import { useGameViewModel } from "../../viewmodels/useGameViewModel";
import { ITEMS_DB } from "../../../domain/models/Item";
import { X } from "lucide-react";
import EvolutionModal from "../../modals/EvolutionModal";
import CardRemoverModal from "../../modals/CardRemoverModal";
import type { Card } from "../../../domain/models/Card";
import type { Pokemon } from "../../../domain/models/Pokemon";

interface InventoryModalProps {
  onClose: () => void;
}

export default function InventoryModal({ onClose }: InventoryModalProps) {
  const {
    inventory,
    player,
    applyItemToPokemon,
    removeItem,
    updatePlayerRunDeck,
  } = useGameViewModel();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [showEvolution, setShowEvolution] = useState(false);
  const [evolvedPokemon, setEvolvedPokemon] = useState<Pokemon | null>(null);
  const [oldPokemon, setOldPokemon] = useState<Pokemon | null>(null);
  const [showCardRemover, setShowCardRemover] = useState(false);

  const handleUseItem = async (itemId: string) => {
    if (!player) return;
    const item = ITEMS_DB[itemId];
    if (!item) return;

    if (item.targetType === "pokemon") {
      if (item.effect.type === "potion" && player.currentHp >= player.maxHp) {
        toast.error("O HP do Pokémon já está cheio!");
        return;
      }
      const result = await applyItemToPokemon(itemId, player);
      if (result.success) {
        if (item.effect.type === "potion" && result.healAmount) {
          toast.success(`Poção usada! ${result.healAmount} HP restaurado.`);
        }
        if (result.evolvedPokemon) {
          setOldPokemon(player.pokemon);
          setEvolvedPokemon(result.evolvedPokemon);
          setShowEvolution(true);
        }
      } else {
        if (
          item.effect.type === "evolution-stone" ||
          item.effect.type === "trade-cable"
        ) {
          toast.error("Não surtiu efeito...");
        }
      }
      setSelectedItem(null);
    } else if (item.targetType === "card") {
      if (player.runDeck.length <= 1) {
        toast.error("Não é possível remover a última carta do baralho!");
        return;
      }
      setSelectedItem(itemId);
      setShowCardRemover(true);
    }
  };

  const handleCardSelect = (card: Card) => {
    if (!player || !selectedItem) return;
    const updatedRunDeck = player.runDeck.filter((c) => c.id !== card.id);
    updatePlayerRunDeck(updatedRunDeck);
    removeItem(selectedItem, 1);
    toast.success("Carta removida com sucesso!");
    setShowCardRemover(false);
    setSelectedItem(null);
  };

  const groupedItems = inventory.reduce(
    (acc, invItem) => {
      const item = ITEMS_DB[invItem.itemId];
      if (!item) return acc;
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(invItem);
      return acc;
    },
    {} as Record<string, typeof inventory>,
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="bg-gray-800 p-6 rounded-xl max-w-2xl w-full max-h-[80vh] mx-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-yellow-400">Mochila</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="mb-4">
                <h3 className="text-lg font-semibold text-gray-300 mb-2 capitalize">
                  {category}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {items.map((invItem) => {
                    const item = ITEMS_DB[invItem.itemId];
                    if (!item) return null;
                    return (
                      <div
                        key={invItem.itemId}
                        className="bg-gray-700 p-3 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{item.sprite}</span>
                          <div>
                            <p className="font-semibold">{item.displayName}</p>
                            <p className="text-xs text-gray-400">
                              x{invItem.quantity}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUseItem(invItem.itemId)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                        >
                          Usar
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {inventory.length === 0 && (
              <p className="text-gray-400 text-center py-8">Mochila vazia</p>
            )}
          </div>
        </div>
      </div>
      {showEvolution && evolvedPokemon && oldPokemon && (
        <EvolutionModal
          oldPokemon={oldPokemon}
          newPokemon={evolvedPokemon}
          onConfirm={() => setShowEvolution(false)}
        />
      )}
      {showCardRemover && player && selectedItem && (
        <CardRemoverModal
          runDeck={player.runDeck}
          pokemon={player.pokemon}
          onSelect={handleCardSelect}
          onClose={() => setShowCardRemover(false)}
        />
      )}
    </>
  );
}
