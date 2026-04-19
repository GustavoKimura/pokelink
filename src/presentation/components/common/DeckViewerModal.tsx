import type { Card } from "../../../domain/models/Card";
import type { Pokemon } from "../../../domain/models/Pokemon";
import PanelModal from "./modal/PanelModal";
import CardCollection from "./CardCollection";

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
      <CardCollection
        cards={runDeck}
        owner={{ pokemon, level }}
        emptyMessage="Baralho vazio"
      />
    </PanelModal>
  );
}
