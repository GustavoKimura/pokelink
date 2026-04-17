import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import type { PlayerPokemon, EnemyPokemon } from "../types";
import { getPokemon } from "../services/pokeCache";
import { transformApiPokemon } from "../utils/pokemonTransform";
import { buildInitialDeck, drawCards } from "../utils/cardUtils";
import { calculateMaxHp, calculateShield } from "../utils/battleUtils";
import { useBattleReducer } from "../hooks/useBattleReducer";
import { useGameStore } from "../store/gameStore";
import BattleScreen from "../components/Battle/BattleScreen";
import MapScreen from "../components/Map/MapScreen";

export default function Game() {
  const location = useLocation();
  const navigate = useNavigate();
  const starterId = location.state?.starterId;

  const [state, dispatch] = useBattleReducer();
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  const { runState, setPlayer, startRun, setCurrentNode } = useGameStore();

  const initGame = useCallback(async () => {
    if (!starterId) {
      navigate("/select");
      return;
    }

    const playerApiData = await getPokemon(starterId);
    const playerPokemon = transformApiPokemon(playerApiData);
    const initialDeck = await buildInitialDeck(playerPokemon);
    const shuffledDeck = [...initialDeck].sort(() => Math.random() - 0.5);
    const { drawn: initialHand, newDeck } = drawCards(shuffledDeck, [], 3);

    const player: PlayerPokemon = {
      pokemon: playerPokemon,
      level: 1,
      currentHp: calculateMaxHp(playerPokemon.stats.hp, 1),
      maxHp: calculateMaxHp(playerPokemon.stats.hp, 1),
      shield: calculateShield(
        playerPokemon.stats.defense,
        playerPokemon.stats.specialDefense,
        1,
      ),
      deck: newDeck,
      hand: initialHand,
      discardPile: [],
      energy: 3,
      revives: 1,
      runXp: 0,
      xpToNextLevel: Math.floor((4 * 1 ** 3) / 5),
    };

    setPlayer(player);
    startRun();
    setLoading(false);
  }, [starterId, navigate, setPlayer, startRun]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initGame();
  }, [initGame]);

  const handleStartBattle = async (nodeId: string) => {
    const node = runState.mapNodes.find((n) => n.id === nodeId);
    if (!node || !runState.player) return;

    setLoading(true);
    const enemyApiData = await getPokemon(node.pokemonId!);
    const enemyPokemon = transformApiPokemon(enemyApiData);
    const enemyDeck = await buildInitialDeck(enemyPokemon);
    const shuffledEnemyDeck = [...enemyDeck].sort(() => Math.random() - 0.5);
    const { drawn: enemyHand, newDeck: enemyNewDeck } = drawCards(
      shuffledEnemyDeck,
      [],
      3,
    );

    const enemy: EnemyPokemon = {
      pokemon: enemyPokemon,
      level: node.level,
      currentHp: calculateMaxHp(enemyPokemon.stats.hp, node.level),
      maxHp: calculateMaxHp(enemyPokemon.stats.hp, node.level),
      shield: calculateShield(
        enemyPokemon.stats.defense,
        enemyPokemon.stats.specialDefense,
        node.level,
      ),
      deck: enemyNewDeck,
      hand: enemyHand,
      discardPile: [],
      energy: 3,
    };

    dispatch({ type: "INIT_BATTLE", player: runState.player, enemy });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  if (runState.runPhase === "map") {
    return (
      <MapScreen
        nodes={runState.mapNodes}
        currentNodeId={runState.currentNodeId}
        onNodeSelect={setCurrentNode}
        onProceed={() => {
          if (runState.currentNodeId) {
            handleStartBattle(runState.currentNodeId);
          }
        }}
      />
    );
  }

  return (
    <BattleScreen
      state={state}
      onSelectMove={(move) => dispatch({ type: "SELECT_MOVE", move })}
      onSelectTarget={(targetId) =>
        dispatch({ type: "SELECT_TARGET", targetId })
      }
      onCancelTarget={() => dispatch({ type: "CANCEL_TARGET" })}
      onEndTurn={() => dispatch({ type: "END_TURN" })}
      onEnemyTurn={() => dispatch({ type: "ENEMY_TURN" })}
    />
  );
}
