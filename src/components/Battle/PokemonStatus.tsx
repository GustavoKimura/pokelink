import { useState } from "react";
import type { PlayerPokemon, EnemyPokemon } from "../../types";
import DiscardPileModal from "./DiscardPileModal";

interface PokemonStatusProps {
  pokemon: PlayerPokemon | EnemyPokemon;
  isPlayer: boolean;
}

const typeColors: Record<string, string> = {
  Normal: "bg-[#A8A878]",
  Fogo: "bg-[#F08030]",
  Água: "bg-[#6890F0]",
  Elétrico: "bg-[#F8D030]",
  Planta: "bg-[#78C850]",
  Gelo: "bg-[#98D8D8]",
  Lutador: "bg-[#C03028]",
  Venenoso: "bg-[#A040A0]",
  Terra: "bg-[#E0C068]",
  Voador: "bg-[#A890F0]",
  Psíquico: "bg-[#F85888]",
  Inseto: "bg-[#A8B820]",
  Pedra: "bg-[#B8A038]",
  Fantasma: "bg-[#705898]",
  Dragão: "bg-[#7038F8]",
  Sombrio: "bg-[#705848]",
  Aço: "bg-[#B8B8D0]",
  Fada: "bg-[#E29DE5]",
};

export default function PokemonStatus({
  pokemon,
  isPlayer,
}: PokemonStatusProps) {
  const [showDiscard, setShowDiscard] = useState(false);
  const hpPercent = (pokemon.currentHp / pokemon.maxHp) * 100;
  const sprite = isPlayer
    ? pokemon.pokemon.sprites.animated.back
    : pokemon.pokemon.sprites.animated.front;

  return (
    <div className="bg-gray-800 rounded-xl p-4 w-full">
      <div className="flex items-center gap-4">
        <img
          src={sprite}
          alt={pokemon.pokemon.name}
          className="w-24 h-24 object-contain"
          onError={(e) => {
            e.currentTarget.src = isPlayer
              ? pokemon.pokemon.sprites.back
              : pokemon.pokemon.sprites.front;
          }}
        />

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold capitalize">
              {pokemon.pokemon.name}
            </h2>
            <span className="text-sm bg-gray-700 px-2 py-0.5 rounded">
              Nv. {pokemon.level}
            </span>
          </div>

          <div className="w-full bg-gray-700 rounded-full h-3 mb-1">
            <div
              className={`h-3 rounded-full transition-all ${
                hpPercent > 50
                  ? "bg-green-500"
                  : hpPercent > 20
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>

          <p className="text-sm mb-1">
            HP: {pokemon.currentHp} / {pokemon.maxHp}
          </p>

          {pokemon.shield > 0 && (
            <p className="text-sm mb-1 text-blue-400">
              🛡️ Escudo: {pokemon.shield}
            </p>
          )}

          <div className="flex gap-1 mb-2">
            {pokemon.pokemon.types.map((type) => (
              <span
                key={type}
                className={`text-xs px-2 py-0.5 rounded-full ${typeColors[type] || "bg-gray-700"}`}
              >
                {type}
              </span>
            ))}
          </div>

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
        </div>
      </div>

      {showDiscard && (
        <DiscardPileModal
          discardPile={pokemon.discardPile}
          pokemonName={pokemon.pokemon.name}
          onClose={() => setShowDiscard(false)}
        />
      )}
    </div>
  );
}
