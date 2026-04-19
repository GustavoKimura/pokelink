import type { PlayerPokemon } from "../../../domain/models/Player";
import { useHealthColor } from "../../hooks/useHealthColor";

interface PlayerStatusBarProps {
  player: PlayerPokemon;
}

export default function PlayerStatusBar({ player }: PlayerStatusBarProps) {
  const healthColor = useHealthColor(player.currentHp, player.maxHp);

  return (
    <div className="px-4 py-2 bg-gray-800/80 border-b border-gray-700 flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <img
          src={player.pokemon.sprites.animated.front}
          alt={player.pokemon.name}
          className="w-8 h-8 pixelated"
        />
        <span className="font-bold">{player.pokemon.name}</span>
      </div>
      <span>Nv. {player.level}</span>
      <div className="flex-1 h-2 bg-gray-700 rounded-full">
        <div
          className={`h-2 rounded-full ${healthColor}`}
          style={{ width: `${(player.currentHp / player.maxHp) * 100}%` }}
        />
      </div>
      <span>
        {player.currentHp}/{player.maxHp}
      </span>
      <div className="flex items-center gap-1">
        <span>XP:</span>
        <div className="w-24 h-1.5 bg-gray-700 rounded-full">
          <div
            className="h-1.5 bg-blue-400 rounded-full"
            style={{
              width: `${(player.runXp / player.xpToNextLevel) * 100}%`,
            }}
          />
        </div>
        <span>
          {player.runXp}/{player.xpToNextLevel}
        </span>
      </div>
    </div>
  );
}
