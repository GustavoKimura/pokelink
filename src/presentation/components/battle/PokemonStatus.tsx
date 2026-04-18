import { useState } from "react";
import type {
  PlayerPokemon,
  EnemyPokemon,
} from "../../../domain/models/Player";
import DiscardPileModal from "./DiscardPileModal";
import { translateType } from "../../../shared/utils/formatters";
import { typeColors } from "../../../domain/constants/styleConstants";

interface PokemonStatusProps {
  pokemon: PlayerPokemon | EnemyPokemon;
  isPlayer: boolean;
}

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
      <div
        className={`flex ${isPlayer ? "flex-row" : "flex-row-reverse"} items-center gap-4`}
      >
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
          owner={pokemon}
          onClose={() => setShowDiscard(false)}
        />
      )}
    </div>
  );
}
