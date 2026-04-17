import { useEffect, useRef, useCallback } from "react";
import type { BattleState, Card, EnemyPokemon } from "../../types";
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
  const { player, enemies, phase, selectingTarget, log, currentTurnIndex } =
    state;
  const enemyTurnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const processEnemyTurn = useCallback(() => {
    const currentEnemy = state.turnOrder[currentTurnIndex] as
      | EnemyPokemon
      | undefined;
    if (!currentEnemy || currentEnemy === player) {
      onEndTurn();
      return;
    }

    const canAttack = currentEnemy.hand.some(
      (m) => m.energyCost <= currentEnemy.energy,
    );
    if (!canAttack) {
      onEndTurn();
      return;
    }

    onEnemyTurn();
  }, [state, currentTurnIndex, player, onEnemyTurn, onEndTurn]);

  useEffect(() => {
    if (phase === "enemy_turn") {
      if (enemyTurnTimerRef.current) {
        clearTimeout(enemyTurnTimerRef.current);
      }

      enemyTurnTimerRef.current = setTimeout(() => {
        processEnemyTurn();
        enemyTurnTimerRef.current = null;
      }, 800);
    }

    return () => {
      if (enemyTurnTimerRef.current) {
        clearTimeout(enemyTurnTimerRef.current);
        enemyTurnTimerRef.current = null;
      }
    };
  }, [phase, currentTurnIndex, processEnemyTurn]);

  if (!player || enemies.length === 0) return null;

  const isPlayerTurn = phase === "battle";
  const currentEnemy = enemies[0];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md flex justify-center mb-8">
          <PokemonStatus pokemon={currentEnemy} isPlayer={false} />
        </div>

        <div className="w-full max-w-2xl bg-gray-800 rounded-lg p-4 mb-8 h-32 overflow-y-auto">
          <BattleLog messages={log} />
        </div>

        <div className="w-full max-w-md flex justify-center">
          <PokemonStatus pokemon={player} isPlayer />
        </div>
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
                  <p className="capitalize">{enemy.pokemon.name}</p>
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

      <div className="bg-gray-800/95 p-4 border-t border-gray-700">
        <div className="max-w-4xl mx-auto">
          <CardHand
            player={player}
            cards={player.hand}
            energy={player.energy}
            canPlay={isPlayerTurn}
            onSelectCard={onSelectMove}
          />

          {isPlayerTurn && (
            <div className="flex justify-center mt-4">
              <button
                onClick={onEndTurn}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
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
