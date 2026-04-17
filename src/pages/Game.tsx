import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import type { PlayerPokemon, EnemyPokemon, Card } from "../types";
import { getPokemon } from "../services/pokeCache";
import { transformApiPokemon } from "../utils/pokemonTransform";
import { buildInitialDeck, drawCards } from "../utils/cardUtils";
import { calculateMaxHp, calculateShield } from "../utils/battleUtils";
import { useBattleReducer } from "../hooks/useBattleReducer";
import BattleScreen from "../components/Battle/BattleScreen";

export default function Game() {
  const location = useLocation();
  const navigate = useNavigate();
  const starterId = location.state?.starterId;

  const [state, dispatch] = useBattleReducer();
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

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
    };

    const enemyApiData = await getPokemon(133);
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
      level: 2,
      currentHp: calculateMaxHp(enemyPokemon.stats.hp, 2),
      maxHp: calculateMaxHp(enemyPokemon.stats.hp, 2),
      shield: calculateShield(
        enemyPokemon.stats.defense,
        enemyPokemon.stats.specialDefense,
        2,
      ),
      deck: enemyNewDeck,
      hand: enemyHand,
      discardPile: [],
      energy: 3,
    };

    dispatch({ type: "INIT_BATTLE", player, enemy });
    setLoading(false);
  }, [starterId, navigate, dispatch]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initGame();
  }, [initGame]);

  const handleSelectMove = (move: Card) => {
    if (state.phase !== "battle") return;
    dispatch({ type: "SELECT_MOVE", move });
  };

  const handleSelectTarget = (targetId: string) => {
    dispatch({ type: "SELECT_TARGET", targetId });
  };

  const handleCancelTarget = () => {
    dispatch({ type: "CANCEL_TARGET" });
  };

  const handleEndTurn = () => {
    dispatch({ type: "END_TURN" });
  };

  const handleEnemyTurn = () => {
    dispatch({ type: "ENEMY_TURN" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Iniciando batalha...</div>
      </div>
    );
  }

  return (
    <BattleScreen
      state={state}
      onSelectMove={handleSelectMove}
      onSelectTarget={handleSelectTarget}
      onCancelTarget={handleCancelTarget}
      onEndTurn={handleEndTurn}
      onEnemyTurn={handleEnemyTurn}
    />
  );
}
