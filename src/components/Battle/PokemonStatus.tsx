import { useState } from "react";
import type { PlayerPokemon, EnemyPokemon } from "../../types";
import DiscardPileModal from "./DiscardPileModal";
import { translateType } from "../../utils/pokemonTransform";

interface PokemonStatusProps {
  pokemon: PlayerPokemon | EnemyPokemon;
  isPlayer: boolean;
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
          className="w-24 h-24 object-contain pixelated"
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
                {translateType(type)}
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
