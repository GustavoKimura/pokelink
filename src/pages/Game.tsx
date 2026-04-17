import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import type { PlayerPokemon, EnemyPokemon, Card } from "../types";
import { getPokemon } from "../services/pokeCache";
import { transformApiPokemon } from "../utils/pokemonTransform";
import { buildInitialDeck, drawCards, shuffleArray } from "../utils/cardUtils";
import {
  calculateMaxHp,
  calculateShield,
  calculateXpGain,
  checkLevelUp,
  getXpForNextLevel,
} from "../utils/battleUtils";
import { getLevelUpMoveOptions } from "../utils/levelUpUtils";
import { useBattleReducer } from "../hooks/useBattleReducer";
import { useGameStore } from "../store/gameStore";
import BattleScreen from "../components/Battle/BattleScreen";
import MapScreen from "../components/Map/MapScreen";
import LevelUpModal from "../components/Modals/LevelUpModal";
import VictoryModal from "../components/Modals/VictoryModal";
import GameOverModal from "../components/Modals/GameOverModal";
import RestModal from "../components/Modals/RestModal";

export default function Game() {
  const location = useLocation();
  const navigate = useNavigate();
  const starterId = location.state?.starterId;

  const [state, dispatch] = useBattleReducer();
  const [loading, setLoading] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpOptions, setLevelUpOptions] = useState<Card[]>([]);
  const [showVictory, setShowVictory] = useState(false);
  const [showRest, setShowRest] = useState(false);
  const [healAmount, setHealAmount] = useState(0);
  const initialized = useRef(false);

  const {
    runState,
    setPlayer,
    startRun,
    completeNode,
    setCurrentNode,
    updatePlayer,
    setRunPhase,
  } = useGameStore();

  const initGame = useCallback(async () => {
    if (!starterId) {
      navigate("/select");
      return;
    }

    const playerApiData = await getPokemon(starterId);
    const playerPokemon = transformApiPokemon(playerApiData);
    const runDeck = await buildInitialDeck(playerPokemon);
    const shuffledDrawPile = shuffleArray([...runDeck]);
    const { drawn: initialHand, newDeck: initialDrawPile } = drawCards(
      shuffledDrawPile,
      [],
      3,
    );

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
      runDeck: runDeck,
      drawPile: initialDrawPile,
      hand: initialHand,
      discardPile: [],
      energy: 3,
      revives: 1,
      runXp: 0,
      xpToNextLevel: getXpForNextLevel(1),
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

  const handleStartEncounter = async (nodeId: string) => {
    const node = runState.mapNodes.find((n) => n.id === nodeId);
    if (!node || !runState.player) return;

    if (node.type === "rest") {
      const heal = Math.floor(runState.player.currentHp * 0.5);
      const newHp = Math.min(
        runState.player.maxHp,
        runState.player.currentHp + heal,
      );
      const updatedPlayer = { ...runState.player, currentHp: newHp };
      updatePlayer(updatedPlayer);
      completeNode(nodeId);
      setHealAmount(heal);
      setShowRest(true);
      return;
    }

    setLoading(true);
    const enemyApiData = await getPokemon(node.pokemonId!);
    const enemyPokemon = transformApiPokemon(enemyApiData);
    const enemyRunDeck = await buildInitialDeck(enemyPokemon);
    const shuffledEnemyDraw = shuffleArray([...enemyRunDeck]);
    const { drawn: enemyHand, newDeck: enemyDrawPile } = drawCards(
      shuffledEnemyDraw,
      [],
      3,
    );

    const playerRunDeck = runState.player.runDeck;
    const shuffledPlayerDraw = shuffleArray([...playerRunDeck]);
    const { drawn: newHand, newDeck: newDrawPile } = drawCards(
      shuffledPlayerDraw,
      [],
      3,
    );

    const playerWithShield = {
      ...runState.player,
      drawPile: newDrawPile,
      hand: newHand,
      discardPile: [],
      energy: 3,
      shield: calculateShield(
        runState.player.pokemon.stats.defense,
        runState.player.pokemon.stats.specialDefense,
        runState.player.level,
      ),
    };

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
      runDeck: enemyRunDeck,
      drawPile: enemyDrawPile,
      hand: enemyHand,
      discardPile: [],
      energy: 3,
    };

    updatePlayer(playerWithShield);
    dispatch({ type: "INIT_BATTLE", player: playerWithShield, enemy });
    setRunPhase("battle");
    setLoading(false);
  };

  const handleBattleEnd = async (victory: boolean) => {
    const finalPlayer = state.player;
    if (!finalPlayer) return;

    if (!victory) {
      updatePlayer(finalPlayer);
      setRunPhase("defeat");
      return;
    }

    const currentNode = runState.mapNodes.find(
      (n) => n.id === runState.currentNodeId,
    );
    if (!currentNode) return;

    const xpGain = calculateXpGain(currentNode.level, finalPlayer.level);
    const updatedPlayer = { ...finalPlayer, runXp: finalPlayer.runXp + xpGain };

    const levelUpResult = checkLevelUp(
      updatedPlayer.runXp,
      updatedPlayer.level,
    );
    if (levelUpResult) {
      updatedPlayer.level = levelUpResult.newLevel;
      updatedPlayer.runXp = levelUpResult.remainingXp;
      const newMaxHp = calculateMaxHp(
        updatedPlayer.pokemon.stats.hp,
        updatedPlayer.level,
      );
      const hpRatio = updatedPlayer.currentHp / updatedPlayer.maxHp;
      updatedPlayer.maxHp = newMaxHp;
      updatedPlayer.currentHp = Math.max(1, Math.floor(newMaxHp * hpRatio));
      updatedPlayer.xpToNextLevel = getXpForNextLevel(updatedPlayer.level);

      const options = await getLevelUpMoveOptions(
        updatedPlayer.pokemon,
        updatedPlayer.level,
      );
      updatePlayer(updatedPlayer);

      if (options.length > 0) {
        setLevelUpOptions(options);
        setShowLevelUp(true);
        setRunPhase("map");
        return;
      }
    }

    updatePlayer(updatedPlayer);
    completeNode(runState.currentNodeId!);

    if (currentNode.type === "boss") {
      setShowVictory(true);
      setRunPhase("victory");
    } else {
      setCurrentNode(null);
      setRunPhase("map");
    }
  };

  const handleLevelUpSelect = (card: Card) => {
    if (!runState.player) return;

    const updatedPlayer = {
      ...runState.player,
      runDeck: [...runState.player.runDeck, card],
    };

    updatePlayer(updatedPlayer);
    completeNode(runState.currentNodeId!);

    setShowLevelUp(false);
    setLevelUpOptions([]);
    setCurrentNode(null);
    setRunPhase("map");
  };

  const handleRestContinue = () => {
    setShowRest(false);
    setCurrentNode(null);
    setRunPhase("map");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  if (runState.runPhase === "defeat") {
    return <GameOverModal />;
  }

  return (
    <>
      {runState.runPhase === "map" && (
        <MapScreen
          nodes={runState.mapNodes}
          currentNodeId={runState.currentNodeId}
          onNodeSelect={setCurrentNode}
          onProceed={() => {
            if (runState.currentNodeId) {
              handleStartEncounter(runState.currentNodeId);
            }
          }}
        />
      )}

      {(runState.runPhase === "battle" || runState.runPhase === "boss") && (
        <BattleScreen
          state={state}
          onSelectMove={(move) => dispatch({ type: "SELECT_MOVE", move })}
          onSelectTarget={(targetId) =>
            dispatch({ type: "SELECT_TARGET", targetId })
          }
          onCancelTarget={() => dispatch({ type: "CANCEL_TARGET" })}
          onEndTurn={() => dispatch({ type: "END_TURN" })}
          onEnemyTurn={() => dispatch({ type: "ENEMY_TURN" })}
          onBattleEnd={handleBattleEnd}
        />
      )}

      {showRest && (
        <RestModal onContinue={handleRestContinue} healAmount={healAmount} />
      )}
      {showLevelUp && runState.player && (
        <LevelUpModal
          player={runState.player}
          options={levelUpOptions}
          onSelect={handleLevelUpSelect}
        />
      )}
      {showVictory && <VictoryModal xpEarned={150} />}
    </>
  );
}
