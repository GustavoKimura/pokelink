import { useShopViewModel } from "../../viewmodels/useShopViewModel";
import { ITEMS_DB } from "../../../domain/models/Item";
import { RefreshCw } from "lucide-react";
import { SHOP_REFRESH_COST } from "../../../domain/config/gameConfig";
import PanelModal from "../common/modal/PanelModal";
import Button from "../ui/Button";

interface ShopNodeModalProps {
  inventory: string[];
  onClose: () => void;
}

export default function ShopNodeModal({
  inventory,
  onClose,
}: ShopNodeModalProps) {
  const {
    gold,
    items,
    purchased,
    refreshed,
    canAffordRefresh,
    handleBuy,
    handleRefresh,
  } = useShopViewModel(inventory);

  const footer = (
    <div className="flex justify-between items-center">
      <span className="text-lg text-yellow-300">💰 {gold}</span>
      <Button
        onClick={handleRefresh}
        disabled={!canAffordRefresh}
        size="sm"
        className="gap-2"
        variant="secondary"
        style={{ backgroundColor: "#8b5cf6" }}
      >
        <RefreshCw className="w-4 h-4" />
        {refreshed ? "Atualizado" : `Atualizar (${SHOP_REFRESH_COST}💰)`}
      </Button>
    </div>
  );

  return (
    <PanelModal title="Loja" onClose={onClose} footer={footer}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((itemId, index) => {
          const item = ITEMS_DB[itemId];
          if (!item) return null;
          const isPurchased = purchased.has(index);
          const canAfford = gold >= item.price && !isPurchased;
          return (
            <div key={index} className="bg-gray-700 p-4 rounded-lg text-center">
              <div className="text-4xl mb-2">{item.sprite}</div>
              <h3 className="font-bold text-lg">{item.displayName}</h3>
              <p className="text-sm text-gray-300 mb-2">{item.description}</p>
              <p className="text-yellow-400 mb-3">💰 {item.price}</p>
              <Button
                onClick={() => handleBuy(itemId, index)}
                disabled={!canAfford}
                size="sm"
                className="w-full"
                variant={canAfford ? "primary" : "secondary"}
              >
                {isPurchased ? "Comprado" : "Comprar"}
              </Button>
            </div>
          );
        })}
      </div>
    </PanelModal>
  );
}
