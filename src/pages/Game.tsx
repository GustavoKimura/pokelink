import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import type {
  PlayerPokemon,
  EnemyPokemon,
  Card,
  Pokemon,
  PreviousStats,
} from "../types";
import { getPokemon } from "../services/pokeCache";
import { transformApiPokemon } from "../utils/pokemonTransform";
import { buildInitialDeck, drawCards, shuffleArray } from "../utils/cardUtils";
import {
  calculateMaxHp,
  calculateShield,
  calculateXpGain,
  checkLevelUp,
  getXpForNextLevel,
  calculateCardDisplayDamage,
} from "../utils/battleUtils";
import { getLevelUpMoveOptions } from "../utils/levelUpUtils";
import { checkEvolution } from "../utils/evolutionUtils";
import { useBattleReducer } from "../hooks/useBattleReducer";
import { useGameStore } from "../store/gameStore";
import BattleScreen from "../components/Battle/BattleScreen";
import MapScreen from "../components/Map/MapScreen";
import LevelUpModal from "../components/Modals/LevelUpModal";
import VictoryModal from "../components/Modals/VictoryModal";
import GameOverModal from "../components/Modals/GameOverModal";
import RestModal from "../components/Modals/RestModal";
import EvolutionModal from "../components/Modals/EvolutionModal";
import {
  CARDS_PER_TURN,
  MAX_ENERGY,
  DEFAULT_REVIVES,
  REST_HEAL_PERCENT,
  VICTORY_XP,
} from "../config/gameConfig";

interface LevelUpStep {
  type: "level" | "evolution";
  newLevel: number;
  player: PlayerPokemon;
  oldPokemon?: Pokemon;
  evolvedPokemon?: Pokemon;
  options?: Card[];
  previousStats: PreviousStats;
}

export default function Game() {
  const location = useLocation();
  const navigate = useNavigate();
  const starterId = location.state?.starterId;
  const customDeck = location.state?.customDeck as Card[] | undefined;

  const [state, dispatch] = useBattleReducer();
  const [loading, setLoading] = useState(true);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpOptions, setLevelUpOptions] = useState<Card[]>([]);
  const [showVictory, setShowVictory] = useState(false);
  const [showRest, setShowRest] = useState(false);
  const [healAmount, setHealAmount] = useState(0);
  const [showEvolution, setShowEvolution] = useState(false);
  const [evolvedPokemon, setEvolvedPokemon] = useState<Pokemon | null>(null);
  const [oldPokemonForEvolution, setOldPokemonForEvolution] =
    useState<Pokemon | null>(null);
  const [previousStats, setPreviousStats] = useState<PreviousStats | null>(
    null,
  );
  const [levelUpQueue, setLevelUpQueue] = useState<LevelUpStep[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [currentStepPlayer, setCurrentStepPlayer] =
    useState<PlayerPokemon | null>(null);
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

    let runDeck: Card[];
    if (customDeck) {
      runDeck = customDeck;
    } else {
      runDeck = await buildInitialDeck(playerPokemon);
    }
    const shuffledDrawPile = shuffleArray([...runDeck]);
    const { drawn: initialHand, newDeck: initialDrawPile } = drawCards(
      shuffledDrawPile,
      [],
      CARDS_PER_TURN,
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
      energy: MAX_ENERGY,
      revives: DEFAULT_REVIVES,
      runXp: 0,
      xpToNextLevel: getXpForNextLevel(1),
    };

    setPlayer(player);
    startRun();
    setLoading(false);
  }, [starterId, customDeck, navigate, setPlayer, startRun]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initGame();
  }, [initGame]);

  const handleStartEncounter = async (nodeId: string) => {
    const node = runState.mapNodes.find((n) => n.id === nodeId);
    if (!node || !runState.player) return;

    if (node.type === "rest") {
      const heal = Math.floor(runState.player.currentHp * REST_HEAL_PERCENT);
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
      CARDS_PER_TURN,
    );

    const playerRunDeck = runState.player.runDeck;
    const shuffledPlayerDraw = shuffleArray([...playerRunDeck]);
    const { drawn: newHand, newDeck: newDrawPile } = drawCards(
      shuffledPlayerDraw,
      [],
      CARDS_PER_TURN,
    );

    const playerWithShield = {
      ...runState.player,
      drawPile: newDrawPile,
      hand: newHand,
      discardPile: [],
      energy: MAX_ENERGY,
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
      energy: MAX_ENERGY,
    };

    updatePlayer(playerWithShield);
    dispatch({ type: "INIT_BATTLE", player: playerWithShield, enemy });
    setRunPhase("battle");
    setLoading(false);
  };

  const processNextLevelUp = useCallback(() => {
    if (levelUpQueue.length === 0) {
      setIsProcessingQueue(false);
      completeNode(runState.currentNodeId!);
      setRunPhase("map");
      return;
    }
    const [step, ...rest] = levelUpQueue;
    setLevelUpQueue(rest);
    if (step.type === "evolution") {
      setEvolvedPokemon(step.evolvedPokemon!);
      setOldPokemonForEvolution(step.oldPokemon!);
      setCurrentStepPlayer(step.player);
      setShowEvolution(true);
    } else {
      setPreviousStats(step.previousStats);
      setLevelUpOptions(step.options || []);
      setCurrentStepPlayer(step.player);
      setShowLevelUp(true);
    }
  }, [levelUpQueue, completeNode, setRunPhase, runState.currentNodeId]);

  useEffect(() => {
    if (
      levelUpQueue.length > 0 &&
      !isProcessingQueue &&
      !showLevelUp &&
      !showEvolution
    ) {
      const timer = setTimeout(() => {
        setIsProcessingQueue(true);
        processNextLevelUp();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [
    levelUpQueue,
    isProcessingQueue,
    showLevelUp,
    showEvolution,
    processNextLevelUp,
  ]);

  const handleLevelUpComplete = (selectedCard?: Card) => {
    if (!runState.player) return;
    const updatedPlayer = { ...runState.player };
    if (selectedCard) {
      updatedPlayer.runDeck = [...updatedPlayer.runDeck, selectedCard];
    }
    updatePlayer(updatedPlayer);
    setShowLevelUp(false);
    setCurrentStepPlayer(null);
    setIsProcessingQueue(false);
  };

  const handleEvolutionComplete = () => {
    setShowEvolution(false);
    setCurrentStepPlayer(null);
    setEvolvedPokemon(null);
    setOldPokemonForEvolution(null);
    setIsProcessingQueue(false);
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

    const xpGain = calculateXpGain(currentNode.level);
    let updatedPlayer = { ...finalPlayer, runXp: finalPlayer.runXp + xpGain };

    const sampleMove: Card = {
      id: "sample",
      name: "Sample",
      type: "normal",
      power: 40,
      pp: 35,
      energyCost: 1,
      description: "",
      damageClass: "physical",
    };

    const steps: LevelUpStep[] = [];
    let currentPlayer = updatedPlayer;

    while (true) {
      const levelUpResult = checkLevelUp(
        currentPlayer.runXp,
        currentPlayer.level,
      );
      if (!levelUpResult) break;

      const oldLevel = currentPlayer.level;
      const newLevel = levelUpResult.newLevel;
      const remainingXp = levelUpResult.remainingXp;

      const oldStats: PreviousStats = {
        level: oldLevel,
        maxHp: currentPlayer.maxHp,
        attackPower: calculateCardDisplayDamage(currentPlayer, sampleMove),
        speed: currentPlayer.pokemon.stats.speed,
        shield: calculateShield(
          currentPlayer.pokemon.stats.defense,
          currentPlayer.pokemon.stats.specialDefense,
          currentPlayer.level,
        ),
      };

      const oldPokemon = currentPlayer.pokemon;

      currentPlayer = {
        ...currentPlayer,
        level: newLevel,
        runXp: remainingXp,
      };

      const evolution = await checkEvolution(currentPlayer.pokemon, newLevel);
      if (evolution) {
        currentPlayer.pokemon = evolution;
        currentPlayer.maxHp = calculateMaxHp(evolution.stats.hp, newLevel);
        currentPlayer.currentHp = currentPlayer.maxHp;
        currentPlayer.shield = calculateShield(
          evolution.stats.defense,
          evolution.stats.specialDefense,
          newLevel,
        );
        currentPlayer.xpToNextLevel = getXpForNextLevel(newLevel);
        steps.push({
          type: "evolution",
          newLevel,
          player: { ...currentPlayer },
          oldPokemon: oldPokemon,
          evolvedPokemon: evolution,
          previousStats: oldStats,
        });
      } else {
        const newMaxHp = calculateMaxHp(
          currentPlayer.pokemon.stats.hp,
          newLevel,
        );
        const hpRatio = currentPlayer.currentHp / currentPlayer.maxHp;
        currentPlayer.maxHp = newMaxHp;
        currentPlayer.currentHp = Math.max(1, Math.floor(newMaxHp * hpRatio));
        currentPlayer.shield = calculateShield(
          currentPlayer.pokemon.stats.defense,
          currentPlayer.pokemon.stats.specialDefense,
          newLevel,
        );
        currentPlayer.xpToNextLevel = getXpForNextLevel(newLevel);

        const options = await getLevelUpMoveOptions(
          currentPlayer.pokemon,
          newLevel,
        );
        steps.push({
          type: "level",
          newLevel,
          player: { ...currentPlayer },
          options,
          previousStats: oldStats,
        });
      }
    }

    updatedPlayer = currentPlayer;
    updatePlayer(updatedPlayer);

    if (steps.length > 0) {
      setLevelUpQueue(steps);
      setRunPhase("map");
    } else {
      completeNode(runState.currentNodeId!);
      if (currentNode.type === "boss") {
        setShowVictory(true);
        setRunPhase("victory");
      } else {
        setRunPhase("map");
      }
    }
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
          player={runState.player}
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
      {showLevelUp && currentStepPlayer && previousStats && (
        <LevelUpModal
          player={currentStepPlayer}
          previousStats={previousStats}
          options={levelUpOptions}
          onSelect={handleLevelUpComplete}
          onSkip={() => handleLevelUpComplete()}
        />
      )}
      {showVictory && <VictoryModal xpEarned={VICTORY_XP} />}
      {showEvolution &&
        evolvedPokemon &&
        oldPokemonForEvolution &&
        currentStepPlayer && (
          <EvolutionModal
            oldPokemon={oldPokemonForEvolution}
            newPokemon={evolvedPokemon}
            onConfirm={handleEvolutionComplete}
          />
        )}
    </>
  );
}
