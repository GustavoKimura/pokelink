import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import type { Card } from "../../domain/models/Card";
import { useGameViewModel } from "../viewmodels/useGameViewModel";
import BattleScreen from "../components/battle/BattleScreen";
import MapScreen from "../components/map/MapScreen";
import LevelUpModal from "../modals/LevelUpModal";
import VictoryModal from "../modals/VictoryModal";
import GameOverModal from "../modals/GameOverModal";
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

  useEffect(() => {
    if (phase === "rest" && restHealAmount !== null) {
      if (restHealAmount === 0) {
        toast("HP já está cheio!", { icon: "💤" });
      } else {
        toast.success(`Recuperou ${restHealAmount} de HP!`);
      }
      acknowledgeRest();
    }
  }, [phase, restHealAmount, acknowledgeRest]);

  useEffect(() => {
    if (phase === "level_up" || phase === "evolution" || phase === "shop") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  const isMapPhase =
    phase === "map" ||
    phase === "rest" ||
    phase === "shop" ||
    phase === "level_up" ||
    phase === "evolution";
  const isBattlePhase = phase === "battle" || phase === "enemy_turn";

  return (
    <>
      {isMapPhase && <MapScreen />}
      {isBattlePhase && <BattleScreen />}
      {phase === "defeat" && <GameOverModal />}
      {phase === "victory" && <VictoryModal />}

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
