import type { PlayerPokemon, EnemyPokemon } from "../../types";

interface PokemonStatusProps {
  pokemon: PlayerPokemon | EnemyPokemon;
  isPlayer: boolean;
}

export default function PokemonStatus({
  pokemon,
  isPlayer,
}: PokemonStatusProps) {
  const hpPercent = (pokemon.currentHp / pokemon.maxHp) * 100;
  const sprite = isPlayer
    ? pokemon.pokemon.sprites.animated.back
    : pokemon.pokemon.sprites.animated.front;

  return (
    <div
      className={`flex ${isPlayer ? "flex-row" : "flex-row-reverse"} items-center gap-4`}
    >
      <div className="relative">
        <img
          src={sprite}
          alt={pokemon.pokemon.name}
          className="w-32 h-32 object-contain"
          onError={(e) => {
            e.currentTarget.src = isPlayer
              ? pokemon.pokemon.sprites.back
              : pokemon.pokemon.sprites.front;
          }}
        />
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-xl font-bold capitalize">
            {pokemon.pokemon.name}
          </h2>
          <span className="text-sm bg-gray-700 px-2 py-1 rounded">
            Nv. {pokemon.level}
          </span>
        </div>

        <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
          <div
            className={`h-4 rounded-full transition-all ${
              hpPercent > 50
                ? "bg-green-500"
                : hpPercent > 20
                  ? "bg-yellow-500"
                  : "bg-red-500"
            }`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>

        <p className="text-sm">
          HP: {pokemon.currentHp} / {pokemon.maxHp}
        </p>

        <div className="flex gap-1 mt-2">
          {pokemon.pokemon.types.map((type) => (
            <span
              key={type}
              className="text-xs px-2 py-1 bg-gray-700 rounded-full"
            >
              {type}
            </span>
          ))}
        </div>

        {!isPlayer && (
          <p className="text-sm mt-2">⚡ Energia: {pokemon.energy}/3</p>
        )}
      </div>
    </div>
  );
}
