import type { Card } from "../../domain/models/Card";
import type { PlayerPokemon, PreviousStats } from "../../domain/models/Player";
import CardDisplay from "../components/common/CardDisplay";
import { usePokemonDisplayStats } from "../hooks/usePokemonDisplayStats";

interface LevelUpModalProps {
  player: PlayerPokemon;
  previousStats: PreviousStats;
  options: Card[];
  onSelect: (card: Card) => void;
  onSkip: () => void;
}

export default function LevelUpModal({
  player,
  previousStats,
  options,
  onSelect,
  onSkip,
}: LevelUpModalProps) {
  const {
    maxHp: newMaxHp,
    shield: newShield,
    attackPower: newAttackPower,
    speed: newSpeed,
  } = usePokemonDisplayStats(player.pokemon, player.level);

  const hpChanged = newMaxHp !== previousStats.maxHp;
  const attackChanged = newAttackPower !== previousStats.attackPower;
  const shieldChanged = newShield !== previousStats.shield;
  const speedChanged = newSpeed !== previousStats.speed;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      style={{ margin: 0 }}
    >
      <div className="bg-gray-800 p-6 rounded-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto pointer-events-auto">
        <h2 className="text-3xl font-bold text-yellow-400 mb-2">Level Up!</h2>
        <p className="text-xl text-white mb-4">
          Seu Pokémon subiu para o nível {player.level}!
        </p>
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-700/50 rounded-lg">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Status</h3>
            <div className="space-y-1 text-sm text-white">
              <p>
                HP:{" "}
                {hpChanged ? (
                  <>
                    {previousStats.maxHp} →{" "}
                    <span className="text-green-400">{newMaxHp}</span>
                  </>
                ) : (
                  newMaxHp
                )}
              </p>
              <p>
                Ataque:{" "}
                {attackChanged ? (
                  <>
                    {previousStats.attackPower} →{" "}
                    <span className="text-green-400">{newAttackPower}</span>
                  </>
                ) : (
                  newAttackPower
                )}
              </p>
              <p>
                Escudo:{" "}
                {shieldChanged ? (
                  <>
                    {previousStats.shield} →{" "}
                    <span className="text-green-400">{newShield}</span>
                  </>
                ) : (
                  newShield
                )}
              </p>
              <p>
                Velocidade:{" "}
                {speedChanged ? (
                  <>
                    {previousStats.speed} →{" "}
                    <span className="text-green-400">{newSpeed}</span>
                  </>
                ) : (
                  newSpeed
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <img
              src={player.pokemon.sprites.animated.front}
              alt={player.pokemon.name}
              className="w-32 h-32 pixelated"
            />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">
          Escolha uma nova carta
        </h3>
        {options.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {options.map((card, index) => (
              <button
                key={`${card.id}-${index}`}
                onClick={() => onSelect(card)}
                className="text-left hover:scale-105 transition-transform rounded-lg pointer-events-auto"
              >
                <CardDisplay card={card} owner={player} />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">
            Nenhuma carta disponível para aprender.
          </p>
        )}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onSkip}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold text-white pointer-events-auto"
          >
            Pular
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-4 text-center">
          A carta escolhida será adicionada ao seu baralho permanentemente nesta
          run.
        </p>
      </div>
    </div>
  );
}
