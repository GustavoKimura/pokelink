import { useState, useEffect, useCallback, useRef } from "react";
import type { Card, Pokemon } from "../../types";
import { buildInitialDeck } from "../../utils/cardUtils";
import { calculateCardDisplayDamage } from "../../utils/battleUtils";
import { translateType } from "../../utils/pokemonTransform";
import { X, Lock, LockOpen, RefreshCw } from "lucide-react";

interface StarterDeckModalProps {
  pokemon: Pokemon;
  onConfirm: (deck: Card[]) => void;
  onClose: () => void;
}

const typeColors: Record<string, string> = {
  normal: "bg-[#A8A878]",
  fire: "bg-[#F08030]",
  water: "bg-[#6890F0]",
  electric: "bg-[#F8D030]",
  grass: "bg-[#78C850]",
  ice: "bg-[#98D8D8]",
  fighting: "bg-[#C03028]",
  poison: "bg-[#A040A0]",
  ground: "bg-[#E0C068]",
  flying: "bg-[#A890F0]",
  psychic: "bg-[#F85888]",
  bug: "bg-[#A8B820]",
  rock: "bg-[#B8A038]",
  ghost: "bg-[#705898]",
  dragon: "bg-[#7038F8]",
  dark: "bg-[#705848]",
  steel: "bg-[#B8B8D0]",
  fairy: "bg-[#E29DE5]",
  typeless: "bg-[#6B6B6B]",
};

type MinimalPlayerPokemon = {
  pokemon: Pokemon;
  level: number;
};

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
          lockedIndices.forEach((idx) => {
            if (idx < newDeck.length) {
              updatedDeck[idx] = prevDeck[idx];
            }
          });
          for (let i = 0; i < newDeck.length; i++) {
            if (!lockedIndices.has(i)) {
              updatedDeck[i] = newDeck[i];
            }
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
      if (newLocked.has(index)) {
        newLocked.delete(index);
      } else {
        newLocked.add(index);
      }
      return newLocked;
    });
  };

  const handleReroll = () => {
    generateDeck(true);
  };

  const samplePlayer: MinimalPlayerPokemon = { pokemon, level: 1 };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-xl max-w-4xl w-full max-h-[80vh] mx-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-yellow-400">
            Baralho Inicial - {pokemon.name}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-white">Gerando baralho...</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto mb-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                {deck.map((card, index) => {
                  const bgColor = card.typeless
                    ? typeColors.typeless
                    : typeColors[card.type] || "bg-gray-500";
                  const displayDamage = calculateCardDisplayDamage(
                    samplePlayer,
                    card,
                  );
                  const damageIcon =
                    card.damageClass === "physical" ? "👊" : "✨";
                  const isLocked = lockedIndices.has(index);

                  return (
                    <div key={index} className="relative">
                      <div className={`${bgColor} text-white rounded-lg p-3`}>
                        <h4 className="font-bold capitalize">{card.name}</h4>
                        <p className="text-sm">
                          {damageIcon} {displayDamage}
                        </p>
                        <p className="text-sm">⚡ {card.energyCost}</p>
                        <p className="text-xs uppercase">
                          {translateType(card.type)}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleLock(index)}
                        className="absolute top-1 right-1 p-1 bg-gray-900/50 rounded hover:bg-gray-900"
                        title={isLocked ? "Desafixar carta" : "Fixar carta"}
                      >
                        {isLocked ? (
                          <Lock className="w-4 h-4 text-yellow-400" />
                        ) : (
                          <LockOpen className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={handleReroll}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                <RefreshCw className="w-4 h-4" />
                Gerar Novamente
              </button>
              <button
                onClick={() => onConfirm(deck)}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
              >
                Confirmar Baralho
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              Clique no cadeado para fixar uma carta. Cartas fixadas não serão
              alteradas ao gerar novamente.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
