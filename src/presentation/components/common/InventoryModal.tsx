import { useInventoryViewModel } from "../../viewmodels/useInventoryViewModel";
import { ITEMS_DB } from "../../../domain/models/Item";
import CardRemoverModal from "../../modals/CardRemoverModal";
import PanelModal from "./modal/PanelModal";

interface InventoryModalProps {
  onClose: () => void;
}

export default function InventoryModal({ onClose }: InventoryModalProps) {
  const {
    player,
    groupedItems,
    inventory,
    showCardRemover,
    handleUseItem,
    handleCardRemove,
    setShowCardRemover,
  } = useInventoryViewModel(onClose);

  return (
    <>
      <PanelModal title="Mochila" onClose={onClose}>
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
      </PanelModal>
      {showCardRemover && player && (
        <CardRemoverModal
          runDeck={player.runDeck}
          pokemon={player.pokemon}
          onSelect={handleCardRemove}
          onClose={() => setShowCardRemover(false)}
        />
      )}
    </>
  );
}
