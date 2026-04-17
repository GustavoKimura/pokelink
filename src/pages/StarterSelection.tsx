import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { STARTER_OPTIONS } from "../constants/starters";
import { getPokemon } from "../services/pokeCache";
import { transformApiPokemon } from "../utils/pokemonTransform";
import type { Pokemon } from "../types";
import { useAccountStore } from "../store/accountStore";

export default function StarterSelection() {
  const navigate = useNavigate();
  const { totalXp } = useAccountStore();
  const [startersData, setStartersData] = useState<Record<number, Pokemon>>({});
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const loadStarters = async () => {
      const data: Record<number, Pokemon> = {};
      for (const starter of STARTER_OPTIONS) {
        const apiData = await getPokemon(starter.id);
        data[starter.id] = transformApiPokemon(apiData);
      }
      setStartersData(data);
      setLoading(false);
    };
    loadStarters();
  }, []);

  const isUnlocked = (starterId: number) => {
    const starter = STARTER_OPTIONS.find((s) => s.id === starterId);
    if (!starter) return false;
    if (starter.unlocked) return true;
    return totalXp >= starter.requiredXp;
  };

  const handleSelect = (id: number) => {
    if (!isUnlocked(id)) return;
    setSelectedId(id);
  };

  const handleConfirm = () => {
    if (selectedId) {
      navigate("/game", { state: { starterId: selectedId } });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Carregando Pokémon iniciais...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white p-8">
      <h1 className="text-4xl font-bold text-center mb-2 text-yellow-400">
        Escolha seu Pokémon Inicial
      </h1>
      <p className="text-center text-gray-300 mb-8">
        Selecione um companheiro para começar sua jornada
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {STARTER_OPTIONS.map((starter) => {
          const pokemon = startersData[starter.id];
          const unlocked = isUnlocked(starter.id);

          return (
            <div
              key={starter.id}
              className={`
                relative rounded-xl overflow-hidden border-2 transition-all duration-200
                ${
                  unlocked
                    ? selectedId === starter.id
                      ? "border-yellow-400 shadow-lg shadow-yellow-400/30 scale-105"
                      : "border-slate-600 hover:border-slate-400 cursor-pointer"
                    : "border-slate-700 opacity-50 cursor-not-allowed"
                }
              `}
              onClick={() => handleSelect(starter.id)}
            >
              {!unlocked && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10">
                  <span className="text-2xl font-bold mb-2">🔒 Bloqueado</span>
                  <span className="text-sm">
                    {starter.requiredXp - totalXp} XP restantes
                  </span>
                </div>
              )}

              <div className="bg-slate-800 p-4">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold">{starter.displayName}</h2>
                  <span className="text-xs bg-slate-700 px-2 py-1 rounded">
                    Nível 1
                  </span>
                </div>

                {pokemon && (
                  <>
                    <div className="flex justify-center my-4">
                      <img
                        src={pokemon.sprites.animated.front}
                        alt={starter.displayName}
                        className="w-32 h-32 object-contain"
                        onError={(e) => {
                          e.currentTarget.src = pokemon.sprites.front;
                        }}
                      />
                    </div>

                    <div className="flex gap-1 mb-3">
                      {pokemon.types.map((type) => (
                        <span
                          key={type}
                          className="text-xs px-2 py-1 bg-slate-700 rounded-full"
                        >
                          {type}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm text-gray-300 mb-3">
                      {starter.description}
                    </p>

                    <div className="grid grid-cols-3 gap-1 text-xs">
                      <div>HP: {pokemon.stats.hp}</div>
                      <div>ATK: {pokemon.stats.attack}</div>
                      <div>DEF: {pokemon.stats.defense}</div>
                      <div>SpA: {pokemon.stats.specialAttack}</div>
                      <div>SpD: {pokemon.stats.specialDefense}</div>
                      <div>SPD: {pokemon.stats.speed}</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={handleConfirm}
          disabled={!selectedId}
          className={`
            px-8 py-3 rounded-lg font-semibold text-lg transition-colors
            ${
              selectedId
                ? "bg-yellow-500 hover:bg-yellow-600 text-slate-900"
                : "bg-slate-700 text-slate-400 cursor-not-allowed"
            }
          `}
        >
          Confirmar Escolha
        </button>
      </div>
    </div>
  );
}
