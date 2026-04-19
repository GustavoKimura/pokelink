import { useState } from "react";
import type {
  PlayerPokemon,
  EnemyPokemon,
} from "../../../domain/models/Player";
import DiscardPileModal from "./DiscardPileModal";

interface BattleUnitStatsProps {
  pokemon: PlayerPokemon | EnemyPokemon;
}

export default function BattleUnitStats({ pokemon }: BattleUnitStatsProps) {
  const [showDiscard, setShowDiscard] = useState(false);

  return (
    <>
      <div className="flex items-center gap-4 text-sm">
        <p>⚡ {pokemon.energy}/3</p>
        <p>🎴 {pokemon.drawPile.length}</p>
        <p>🃏 {pokemon.hand.length}</p>
        <button
          onClick={() => setShowDiscard(true)}
          className="hover:text-gray-300 underline decoration-dotted"
        >
          🗑️ {pokemon.discardPile.length}
        </button>
      </div>
      {showDiscard && (
        <DiscardPileModal
          discardPile={pokemon.discardPile}
          owner={pokemon}
          onClose={() => setShowDiscard(false)}
        />
      )}
    </>
  );
}
