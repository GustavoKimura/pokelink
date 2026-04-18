import { useState } from "react";
import { useGameViewModel } from "../../viewmodels/useGameViewModel";
import { ITEMS_DB } from "../../../domain/models/Item";
import { X, RefreshCw } from "lucide-react";

interface ShopNodeModalProps {
  inventory: string[];
  onClose: () => void;
}

export default function ShopNodeModal({
  inventory,
  onClose,
}: ShopNodeModalProps) {
  const { gold, spendGold, addItem } = useGameViewModel();
  const [items, setItems] = useState<string[]>(inventory);
  const [refreshCost] = useState(10);

  const handleBuy = (itemId: string) => {
    const item = ITEMS_DB[itemId];
    if (!item) return;
    if (spendGold(item.price)) {
      addItem(itemId, 1);
    }
  };

  const handleRefresh = () => {
    if (spendGold(refreshCost)) {
      const newItems: string[] = [];
      for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(
          Math.random() * Object.keys(ITEMS_DB).length,
        );
        newItems.push(Object.keys(ITEMS_DB)[randomIndex]);
      }
      setItems(newItems);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl max-w-4xl w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-yellow-400">Loja</h2>
          <div className="flex items-center gap-4">
            <span className="text-lg text-yellow-300">💰 {gold}</span>
            <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {items.map((itemId, index) => {
            const item = ITEMS_DB[itemId];
            if (!item) return null;
            const canAfford = gold >= item.price;
            return (
              <div
                key={index}
                className="bg-gray-700 p-4 rounded-lg text-center"
              >
                <div className="text-4xl mb-2">{item.sprite}</div>
                <h3 className="font-bold text-lg">{item.displayName}</h3>
                <p className="text-sm text-gray-300 mb-2">{item.description}</p>
                <p className="text-yellow-400 mb-3">💰 {item.price}</p>
                <button
                  onClick={() => handleBuy(itemId)}
                  disabled={!canAfford}
                  className={`w-full py-2 rounded-lg font-semibold ${
                    canAfford
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-500 cursor-not-allowed"
                  }`}
                >
                  Comprar
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleRefresh}
            disabled={gold < refreshCost}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              gold >= refreshCost
                ? "bg-purple-600 hover:bg-purple-700"
                : "bg-gray-600 cursor-not-allowed"
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar ({refreshCost}💰)
          </button>
        </div>
      </div>
    </div>
  );
}
