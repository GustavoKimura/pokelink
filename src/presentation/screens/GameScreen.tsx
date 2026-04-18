import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import type { Card } from "../../domain/models/Card";
import { useGameViewModel } from "../viewmodels/useGameViewModel";
import BattleScreen from "../components/battle/BattleScreen";
import MapScreen from "../components/map/MapScreen";
import LevelUpModal from "../modals/LevelUpModal";
import VictoryModal from "../modals/VictoryModal";
import GameOverModal from "../modals/GameOverModal";
import RestModal from "../modals/RestModal";
import EvolutionModal from "../modals/EvolutionModal";

export default function GameScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const starterId = location.state?.starterId as number | undefined;
  const customDeck = location.state?.customDeck as Card[] | undefined;

  const {
    phase,
    levelUpData,
    evolutionData,
    restHealAmount,
    initializeRun,
    acknowledgeLevelUp,
    acknowledgeEvolution,
    acknowledgeRest,
  } = useGameViewModel();
  const initialized = useRef(false);

  useEffect(() => {
    if (!starterId) {
      navigate("/select");
      return;
    }
    if (!initialized.current) {
      initialized.current = true;
      initializeRun(starterId, customDeck);
    }
  }, [starterId, customDeck, navigate, initializeRun]);

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <>
      {(phase === "map" || phase === "rest") && <MapScreen />}
      {(phase === "battle" || phase === "enemy_turn") && <BattleScreen />}
      {phase === "defeat" && <GameOverModal />}
      {phase === "victory" && <VictoryModal />}

      {phase === "rest" && restHealAmount !== null && (
        <RestModal onContinue={acknowledgeRest} healAmount={restHealAmount} />
      )}

      {phase === "level_up" && levelUpData && (
        <LevelUpModal
          player={levelUpData.playerSnapshot}
          previousStats={levelUpData.previousStats}
          options={levelUpData.options}
          onSelect={acknowledgeLevelUp}
          onSkip={() => acknowledgeLevelUp()}
        />
      )}

      {phase === "evolution" && evolutionData && (
        <EvolutionModal
          oldPokemon={evolutionData.oldPokemon}
          newPokemon={evolutionData.newPokemon}
          onConfirm={acknowledgeEvolution}
        />
      )}
    </>
  );
}
