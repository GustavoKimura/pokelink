import { useState, useEffect, useCallback, useRef } from "react";
import type { Card } from "../../domain/models/Card";
import type { Pokemon } from "../../domain/models/Pokemon";
import { buildInitialDeck } from "../../domain/services/deckService";
import PanelModal from "../components/common/modal/PanelModal";
import CardCollection from "../components/common/CardCollection";
import Button from "../components/ui/Button";
import { RefreshCw } from "lucide-react";

interface StarterDeckModalProps {
  pokemon: Pokemon;
  onConfirm: (deck: Card[]) => void;
  onClose: () => void;
}

export default function StarterDeckModal({
  pokemon,
  onConfirm,
  onClose,
}: StarterDeckModalProps) {
  const [deck, setDeck] = useState<Card[]>([]);
  const [lockedIndices, setLockedIndices] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  const generateDeck = useCallback(
    async (preserveLocked: boolean = false) => {
      setLoading(true);
      const newDeck = await buildInitialDeck(pokemon);
      if (preserveLocked) {
        setDeck((prevDeck) => {
          const updatedDeck = [...prevDeck];
          for (let i = 0; i < newDeck.length; i++) {
            if (!lockedIndices.has(i)) updatedDeck[i] = newDeck[i];
          }
          return updatedDeck;
        });
      } else {
        setDeck(newDeck);
        setLockedIndices(new Set());
      }
      setLoading(false);
    },
    [pokemon, lockedIndices],
  );

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    generateDeck();
  }, [generateDeck]);

  const toggleLock = (index: number) => {
    setLockedIndices((prev) => {
      const newLocked = new Set(prev);
      if (newLocked.has(index)) newLocked.delete(index);
      else newLocked.add(index);
      return newLocked;
    });
  };

  const handleReroll = () => generateDeck(true);

  const footer = (
    <>
      <div className="flex justify-between items-center">
        <Button
          onClick={handleReroll}
          variant="secondary"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Gerar Novamente
        </Button>
        <Button onClick={() => onConfirm(deck)}>Confirmar Baralho</Button>
      </div>
      <p className="text-sm text-gray-400 mt-2">
        Clique no cadeado para fixar uma carta. Cartas fixadas não serão
        alteradas ao gerar novamente.
      </p>
    </>
  );

  return (
    <PanelModal
      title={`Baralho Inicial - ${pokemon.name}`}
      onClose={onClose}
      footer={footer}
    >
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-white">Gerando baralho...</p>
        </div>
      ) : (
        <CardCollection
          cards={deck}
          owner={{ pokemon, level: 1 }}
          gridClasses="grid grid-cols-1 md:grid-cols-5 gap-2"
          lockedIndices={lockedIndices}
          onLockToggle={toggleLock}
        />
      )}
    </PanelModal>
  );
}
