import { useStarterSelectionViewModel } from "../viewmodels/useStarterSelectionViewModel";
import StarterDeckModal from "../modals/StarterDeckModal";
import StarterCard from "../components/starters/StarterCard";
import Button from "../components/ui/Button";
import { STARTER_OPTIONS } from "../../domain/config/gameConfig";

export default function StarterSelectionScreen() {
  const {
    totalXp,
    startersData,
    loading,
    unlockedStarters,
    selectedId,
    handleSelectStarter,
    handleConfirm,
    showDeckModal,
    pokemonForModal,
    handleViewDeck,
    handleSaveCustomDeck,
    handleCloseDeckModal,
  } = useStarterSelectionViewModel();

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
              onSelect={() => handleSelectStarter(starter.id)}
              onViewDeck={() => handleViewDeck(starter.id)}
            />
          );
        })}
      </div>
      <div className="mt-8 text-center">
        <Button
          onClick={handleConfirm}
          disabled={!selectedId}
          variant="warning"
          size="lg"
        >
          Confirmar Escolha
        </Button>
      </div>
      {showDeckModal && pokemonForModal && (
        <StarterDeckModal
          pokemon={pokemonForModal}
          onConfirm={handleSaveCustomDeck}
          onClose={handleCloseDeckModal}
        />
      )}
    </div>
  );
}
