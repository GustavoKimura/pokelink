import type { Pokemon } from "../../domain/models/Pokemon";
import CenteredModal from "../components/common/modal/CenteredModal";

interface EvolutionModalProps {
  oldPokemon: Pokemon;
  newPokemon: Pokemon;
  onConfirm: () => void;
}

export default function EvolutionModal({
  oldPokemon,
  newPokemon,
  onConfirm,
}: EvolutionModalProps) {
  return (
    <CenteredModal>
      <h2 className="text-3xl font-bold text-yellow-400 mb-4">Evolução!</h2>
      <p className="text-lg text-white mb-6">
        Seu {oldPokemon.name} está evoluindo!
      </p>
      <div className="flex items-center justify-center gap-4 mb-6">
        <img
          src={oldPokemon.sprites.animated.front}
          alt={oldPokemon.name}
          className="w-24 h-24 pixelated"
        />
        <span className="text-4xl">→</span>
        <img
          src={newPokemon.sprites.animated.front}
          alt={newPokemon.name}
          className="w-24 h-24 pixelated"
        />
      </div>
      <p className="text-xl font-semibold capitalize mb-4">
        {newPokemon.name}!
      </p>
      <button
        onClick={onConfirm}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
      >
        Incrível!
      </button>
    </CenteredModal>
  );
}
