import { useBattleViewModel } from "../../viewmodels/useBattleViewModel";
import PokemonStatus from "./PokemonStatus";
import CardHand from "./CardHand";
import BattleLog from "./BattleLog";
import DeckViewerModal from "../common/DeckViewerModal";
import InventoryModal from "../common/InventoryModal";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import Pill from "../ui/Pill";
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
    isPlayerTurn,
    showPlayerDeck,
    setShowPlayerDeck,
    showEnemyDeck,
    setShowEnemyDeck,
    showInventory,
    setShowInventory,
  } = useBattleViewModel();

  if (!player || enemies.length === 0) return null;

  const currentEnemy = enemies[0];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Pill>
          <span>💰</span> {gold}
        </Pill>
        <IconButton onClick={() => setShowInventory(true)}>
          <Backpack className="w-5 h-5" />
        </IconButton>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md flex justify-center mb-8 relative">
          <PokemonStatus pokemon={currentEnemy} isPlayer={false} />
          <IconButton
            onClick={() => setShowEnemyDeck(true)}
            className="absolute top-2 right-2 p-1"
          >
            <BookOpen className="w-4 h-4" />
          </IconButton>
        </div>
        <div className="w-full max-w-2xl bg-gray-800 rounded-lg p-4 mb-8 h-32 overflow-y-auto">
          <BattleLog messages={battleLog} />
        </div>
        <div className="w-full max-w-md flex justify-center relative">
          <PokemonStatus pokemon={player} isPlayer />
          <IconButton
            onClick={() => setShowPlayerDeck(true)}
            className="absolute top-2 right-2 p-1"
          >
            <BookOpen className="w-4 h-4" />
          </IconButton>
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
            <Button
              onClick={cancelTarget}
              variant="danger"
              size="sm"
              className="mt-4"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
      <div className="bg-gray-800/95 p-4 border-t border-gray-700">
        <div className="w-full">
          <CardHand
            player={player}
            cards={player.hand}
            energy={player.energy}
            canPlay={isPlayerTurn}
            onSelectCard={selectCard}
          />
          {isPlayerTurn && (
            <div className="flex justify-center mt-2">
              <Button onClick={endTurn}>Passar Turno</Button>
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
