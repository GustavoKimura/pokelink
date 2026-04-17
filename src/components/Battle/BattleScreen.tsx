import { useEffect } from "react";
import type { BattleState, Card } from "../../types";
import PokemonStatus from "./PokemonStatus";
import CardHand from "./CardHand";
import BattleLog from "./BattleLog";

interface BattleScreenProps {
  state: BattleState;
  onSelectMove: (move: Card) => void;
  onSelectTarget: (targetId: string) => void;
  onCancelTarget: () => void;
  onEndTurn: () => void;
  onEnemyTurn: () => void;
}

export default function BattleScreen({
  state,
  onSelectMove,
  onSelectTarget,
  onCancelTarget,
  onEndTurn,
  onEnemyTurn,
}: BattleScreenProps) {
  const { player, enemies, phase, selectingTarget, log } = state;

  useEffect(() => {
    if (phase === "enemy_turn") {
      const timer = setTimeout(() => {
        onEnemyTurn();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, onEnemyTurn]);

  if (!player || enemies.length === 0) return null;

  const isPlayerTurn = phase === "battle";
  const currentEnemy = enemies[0];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 gap-8 mb-8">
          <PokemonStatus pokemon={player} isPlayer />
          <PokemonStatus pokemon={currentEnemy} isPlayer={false} />
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-4 h-32 overflow-y-auto">
          <BattleLog messages={log} />
        </div>

        {selectingTarget && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl mb-4">Selecione um alvo</h3>
              <div className="flex gap-4">
                {enemies.map((enemy) => (
                  <button
                    key={enemy.pokemon.id}
                    onClick={() => onSelectTarget(String(enemy.pokemon.id))}
                    className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600"
                  >
                    <img
                      src={enemy.pokemon.sprites.animated.front}
                      alt={enemy.pokemon.name}
                      className="w-24 h-24"
                    />
                    <p>{enemy.pokemon.name}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={onCancelTarget}
                className="mt-4 px-4 py-2 bg-red-600 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 bg-gray-800/95 p-4">
          <CardHand
            cards={player.hand}
            energy={player.energy}
            canPlay={isPlayerTurn}
            onSelectCard={onSelectMove}
          />

          {isPlayerTurn && (
            <div className="flex justify-end mt-4">
              <button
                onClick={onEndTurn}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Passar Turno
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
