import type { Card } from "../../../domain/models/Card";
import type { Pokemon } from "../../../domain/models/Pokemon";
import CardDisplay from "./CardDisplay";
import PanelModal from "./modal/PanelModal";

interface DeckViewerModalProps {
  title?: string;
  runDeck: Card[];
  pokemon: Pokemon;
  level: number;
  onClose: () => void;
}

export default function DeckViewerModal({
  title = "Baralho da Run",
  runDeck,
  pokemon,
  level,
  onClose,
}: DeckViewerModalProps) {
  return (
    <PanelModal title={title} onClose={onClose}>
      {runDeck.length === 0 ? (
        <p className="text-gray-400 text-center py-8">Baralho vazio</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {runDeck.map((card, index) => (
            <div key={index}>
              <CardDisplay card={card} owner={{ pokemon, level }} />
            </div>
          ))}
        </div>
      )}
    </PanelModal>
  );
}
