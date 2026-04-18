import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import type { PlayerPokemon } from "../../models/Player";
import type { Card } from "../../models/Card";
import type { Pokemon } from "../../models/Pokemon";
import type { PreviousStats } from "../../models/Player";
import { useBattleViewModel } from "../../viewmodels/useBattleViewModel";
import { useMapViewModel } from "../../viewmodels/useMapViewModel";
import { usePlayerViewModel } from "../../viewmodels/usePlayerViewModel";
import { useGameStore } from "../../stores/gameStore";
import { getLevelUpMoveOptions } from "../../services/deckService";
import { checkEvolution } from "../../services/evolutionService";
import {
  calculateXpGain,
  calculateMaxHp,
  calculateShield,
  calculateCardDisplayDamage,
  checkLevelUp,
  getXpForNextLevel,
} from "../../services/battleService";
import BattleScreen from "../components/Battle/BattleScreen";
import MapScreen from "../components/Map/MapScreen";
import LevelUpModal from "../components/Modals/LevelUpModal";
import VictoryModal from "../components/Modals/VictoryModal";
import GameOverModal from "../components/Modals/GameOverModal";
import RestModal from "../components/Modals/RestModal";
import EvolutionModal from "../components/Modals/EvolutionModal";
import { VICTORY_XP } from "../../config/gameConfig";

interface LevelUpStep {
  type: "level" | "evolution";
  newLevel: number;
  player: PlayerPokemon;
  oldPokemon?: Pokemon;
  evolvedPokemon?: Pokemon;
  options?: Card[];
  previousStats: PreviousStats;
}

export default function GameScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const starterId = location.state?.starterId;
  const customDeck = location.state?.customDeck as Card[] | undefined;

  const battleVM = useBattleViewModel();
  const mapVM = useMapViewModel();
  const playerVM = usePlayerViewModel();

  const {
    runState,
    setRunPhase,
    completeNode,
    setCurrentNode,
    updatePlayer,
    setPlayer,
  } = useGameStore();

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

  const initGame = useCallback(async () => {
    if (!starterId) {
      navigate("/select");
      return;
    }
    const newPlayer = await playerVM.initializePlayer(starterId, customDeck);
    setPlayer(newPlayer);
    mapVM.startNewRun();
    setLoading(false);
  }, [starterId, customDeck, navigate, playerVM, mapVM, setPlayer]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initGame();
  }, [initGame]);

  const handleStartEncounter = async (nodeId: string) => {
    const node = mapVM.getNodeById(nodeId);
    const player = playerVM.player;
    if (!node || !player) return;
    if (node.type === "rest") {
      const heal = playerVM.applyRestHeal();
      completeNode(nodeId);
      setHealAmount(heal);
      setShowRest(true);
      return;
    }
    setLoading(true);
    const enemy = await mapVM.prepareEncounter(node);
    playerVM.prepareForBattle();
    const updatedPlayer = playerVM.player!;
    updatePlayer(updatedPlayer);
    battleVM.initBattle(updatedPlayer, enemy);
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
    const player = playerVM.player;
    if (!player) return;
    const updatedPlayer = { ...player };
    if (selectedCard)
      updatedPlayer.runDeck = [...updatedPlayer.runDeck, selectedCard];
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
    const finalPlayer = battleVM.state.player;
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
      currentPlayer = { ...currentPlayer, level: newLevel, runXp: remainingXp };
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
          oldPokemon,
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
            if (runState.currentNodeId)
              handleStartEncounter(runState.currentNodeId);
          }}
        />
      )}
      {(runState.runPhase === "battle" || runState.runPhase === "boss") && (
        <BattleScreen
          state={battleVM.state}
          onSelectMove={battleVM.selectMove}
          onSelectTarget={battleVM.selectTarget}
          onCancelTarget={battleVM.cancelTarget}
          onEndTurn={battleVM.endTurn}
          onEnemyTurn={battleVM.enemyTurn}
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
