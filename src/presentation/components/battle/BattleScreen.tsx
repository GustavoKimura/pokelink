import { useState } from "react";
import { useGameViewModel } from "../../viewmodels/useGameViewModel";
import PokemonStatus from "./PokemonStatus";
import CardHand from "./CardHand";
import BattleLog from "./BattleLog";
import DeckViewerModal from "../common/DeckViewerModal";
import InventoryModal from "../common/InventoryModal";
import { BookOpen, Backpack } from "lucide-react";

export default function BattleScreen() {
  const {
    player,
    enemies,
    isTargeting,
    battleLog,
    gold,
    selectCard,
    selectTarget,
    cancelTarget,
    endTurn,
    turnOrder,
    currentTurnIndex,
  } = useGameViewModel();
  const [showPlayerDeck, setShowPlayerDeck] = useState(false);
  const [showEnemyDeck, setShowEnemyDeck] = useState(false);
  const [showInventory, setShowInventory] = useState(false);

  const isPlayerTurn =
    player && turnOrder[currentTurnIndex]?.pokemon.id === player.pokemon.id;

  if (!player || enemies.length === 0) return null;

  const currentEnemy = enemies[0];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <div className="flex items-center gap-1 px-3 py-1 bg-yellow-700 rounded-lg">
          <span>💰</span> {gold}
        </div>
        <button
          onClick={() => setShowInventory(true)}
          className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
        >
          <Backpack className="w-5 h-5" />
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md flex justify-center mb-8 relative">
          <PokemonStatus pokemon={currentEnemy} isPlayer={false} />
          <button
            onClick={() => setShowEnemyDeck(true)}
            className="absolute top-2 right-2 p-1 bg-gray-700 rounded hover:bg-gray-600 z-10"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
        <div className="w-full max-w-2xl bg-gray-800 rounded-lg p-4 mb-8 h-32 overflow-y-auto">
          <BattleLog messages={battleLog} />
        </div>
        <div className="w-full max-w-md flex justify-center relative">
          <PokemonStatus pokemon={player} isPlayer />
          <button
            onClick={() => setShowPlayerDeck(true)}
            className="absolute top-2 right-2 p-1 bg-gray-700 rounded hover:bg-gray-600 z-10"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </div>
      {isTargeting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl mb-4">Selecione um alvo</h3>
            <div className="flex gap-4">
              {enemies.map((enemy) => (
                <button
                  key={enemy.pokemon.id}
                  onClick={() => selectTarget(enemy.pokemon.id)}
                  className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  <img
                    src={enemy.pokemon.sprites.animated.front}
                    alt={enemy.pokemon.name}
                    className="w-24 h-24 pixelated"
                  />
                  <p className="capitalize">{enemy.pokemon.name}</p>
                </button>
              ))}
            </div>
            <button
              onClick={cancelTarget}
              className="mt-4 px-4 py-2 bg-red-600 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      <div className="bg-gray-800/95 p-4 border-t border-gray-700">
        <div className="w-full">
          <CardHand
            player={player}
            cards={player.hand}
            energy={player.energy}
            canPlay={!!isPlayerTurn}
            onSelectCard={selectCard}
          />
          {isPlayerTurn && (
            <div className="flex justify-center mt-2">
              <button
                onClick={endTurn}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold shadow-lg"
              >
                Passar Turno
              </button>
            </div>
          )}
        </div>
      </div>
      {showPlayerDeck && player && (
        <DeckViewerModal
          title="Seu Baralho da Run"
          runDeck={player.runDeck}
          pokemon={player.pokemon}
          level={player.level}
          onClose={() => setShowPlayerDeck(false)}
        />
      )}
      {showEnemyDeck && currentEnemy && (
        <DeckViewerModal
          title={`Baralho da Run - ${currentEnemy.pokemon.name}`}
          runDeck={currentEnemy.runDeck}
          pokemon={currentEnemy.pokemon}
          level={currentEnemy.level}
          onClose={() => setShowEnemyDeck(false)}
        />
      )}
      {showInventory && (
        <InventoryModal onClose={() => setShowInventory(false)} />
      )}
    </div>
  );
}
