import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { STARTER_OPTIONS } from "../../domain/config/gameConfig";
import type { Card } from "../../domain/models/Card";
import type { Pokemon } from "../../domain/models/Pokemon";
import { useAccountStore } from "../../data/stores/accountStore";
import { useStarterSelectionViewModel } from "../viewmodels/useStarterSelectionViewModel";
import StarterDeckModal from "../modals/StarterDeckModal";
import StarterCard from "../components/starters/StarterCard";

export default function StarterSelectionScreen() {
  const navigate = useNavigate();
  const { totalXp } = useAccountStore();
  const { startersData, loading, unlockedStarters } =
    useStarterSelectionViewModel();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [pokemonForModal, setPokemonForModal] = useState<Pokemon | null>(null);
  const [customDecks, setCustomDecks] = useState<Record<number, Card[]>>({});

  const handleConfirm = () => {
    if (selectedId) {
      const deck = customDecks[selectedId];
      navigate("/game", { state: { starterId: selectedId, customDeck: deck } });
    }
  };

  const handleViewDeck = (id: number) => {
    const pokemon = startersData[id];
    if (pokemon) {
      setPokemonForModal(pokemon);
      setShowDeckModal(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Carregando Pokémon iniciais...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-2 text-yellow-400">
        Escolha seu Pokémon Inicial
      </h1>
      <p className="text-center text-gray-300 mb-8">
        Selecione um companheiro para começar sua jornada
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {STARTER_OPTIONS.map((starter) => {
          const unlocked = unlockedStarters.has(starter.id);
          return (
            <StarterCard
              key={starter.id}
              starter={starter}
              pokemon={startersData[starter.id]}
              isSelected={selectedId === starter.id}
              isUnlocked={unlocked}
              totalXp={totalXp}
              onSelect={() => unlocked && setSelectedId(starter.id)}
              onViewDeck={() => handleViewDeck(starter.id)}
            />
          );
        })}
      </div>
      <div className="mt-8 text-center">
        <button
          onClick={handleConfirm}
          disabled={!selectedId}
          className={`
            px-8 py-3 rounded-lg font-semibold text-lg transition-colors
            ${
              selectedId
                ? "bg-yellow-500 hover:bg-yellow-600 text-slate-900"
                : "bg-slate-700 text-slate-400 cursor-not-allowed"
            }
          `}
        >
          Confirmar Escolha
        </button>
      </div>
      {showDeckModal && pokemonForModal && (
        <StarterDeckModal
          pokemon={pokemonForModal}
          onConfirm={(deck: Card[]) => {
            setCustomDecks((prev) => ({
              ...prev,
              [pokemonForModal.id]: deck,
            }));
            setShowDeckModal(false);
          }}
          onClose={() => setShowDeckModal(false)}
        />
      )}
    </div>
  );
}
