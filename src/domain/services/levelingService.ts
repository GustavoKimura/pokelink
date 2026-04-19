import type { PlayerPokemon } from "../models/Player";
import type { LevelUpStep } from "../../data/stores/types";
import {
  checkLevelUp,
  calculateCardDisplayDamage,
  calculateShield,
} from "./battleService";
import { checkEvolution } from "./evolutionService";
import { getLevelUpMoveOptions } from "./deckService";

export const processLevelUps = async (
  player: PlayerPokemon,
): Promise<{ updatedPlayer: PlayerPokemon; levelUpSteps: LevelUpStep[] }> => {
  const steps: LevelUpStep[] = [];
  let currentPlayerForCalc = { ...player };

  while (true) {
    const levelUpResult = checkLevelUp(
      currentPlayerForCalc.runXp,
      currentPlayerForCalc.level,
    );
    if (!levelUpResult) break;
    const { newLevel, remainingXp } = levelUpResult;
    const oldStats = {
      level: currentPlayerForCalc.level,
      maxHp: currentPlayerForCalc.maxHp,
      attackPower: calculateCardDisplayDamage(currentPlayerForCalc, {
        id: "sample",
        name: "Sample",
        type: "normal",
        power: 40,
        pp: 35,
        energyCost: 1,
        description: "",
        damageClass: "physical",
      }),
      speed: currentPlayerForCalc.pokemon.stats.speed,
      shield: calculateShield(
        currentPlayerForCalc.pokemon.stats.defense,
        currentPlayerForCalc.pokemon.stats.specialDefense,
        currentPlayerForCalc.level,
      ),
    };
    const oldPokemon = currentPlayerForCalc.pokemon;
    currentPlayerForCalc = {
      ...currentPlayerForCalc,
      level: newLevel,
      runXp: remainingXp,
    };
    const evolution = await checkEvolution(oldPokemon, newLevel);
    if (evolution) {
      currentPlayerForCalc.pokemon = evolution;
      steps.push({
        type: "evolution",
        newLevel,
        player: { ...currentPlayerForCalc },
        oldPokemon,
        evolvedPokemon: evolution,
        previousStats: oldStats,
      });
    } else {
      const options = await getLevelUpMoveOptions(
        currentPlayerForCalc.pokemon,
        newLevel,
      );
      steps.push({
        type: "level",
        newLevel,
        player: { ...currentPlayerForCalc },
        options,
        previousStats: oldStats,
      });
    }
  }
  return { updatedPlayer: currentPlayerForCalc, levelUpSteps: steps };
};
