import { useReducer } from "react";
import type { BattleState, PlayerPokemon, EnemyPokemon, Card } from "../types";
import { drawCards } from "../utils/cardUtils";
import {
  calculateDamage,
  calculateShield,
  getEffectiveness,
} from "../utils/battleUtils";

type BattleAction =
  | { type: "INIT_BATTLE"; player: PlayerPokemon; enemy: EnemyPokemon }
  | { type: "SELECT_MOVE"; move: Card }
  | { type: "SELECT_TARGET"; targetId: string }
  | { type: "CANCEL_TARGET" }
  | {
      type: "EXECUTE_ATTACK";
      attacker: PlayerPokemon | EnemyPokemon;
      defender: PlayerPokemon | EnemyPokemon;
      move: Card;
    }
  | { type: "END_TURN" }
  | { type: "ENEMY_TURN" }
  | { type: "ADD_LOG"; message: string };

const isPlayerUnit = (
  unit: PlayerPokemon | EnemyPokemon,
): unit is PlayerPokemon => {
  return "runXp" in unit;
};

function drawCardsForUnit<T extends PlayerPokemon | EnemyPokemon>(unit: T): T {
  const newDiscard = [...unit.discardPile, ...unit.hand];
  const {
    drawn: newHand,
    newDeck: newDrawPile,
    newDiscard: finalDiscard,
  } = drawCards(unit.drawPile, newDiscard, 3);
  return {
    ...unit,
    drawPile: newDrawPile,
    hand: newHand,
    discardPile: finalDiscard,
    energy: 3,
  };
}

function battleReducer(state: BattleState, action: BattleAction): BattleState {
  switch (action.type) {
    case "INIT_BATTLE": {
      const playerWithShield = {
        ...action.player,
        shield: calculateShield(
          action.player.pokemon.stats.defense,
          action.player.pokemon.stats.specialDefense,
          action.player.level,
        ),
      };
      const enemyWithShield = {
        ...action.enemy,
        shield: calculateShield(
          action.enemy.pokemon.stats.defense,
          action.enemy.pokemon.stats.specialDefense,
          action.enemy.level,
        ),
      };
      const turnOrder = [playerWithShield, enemyWithShield].sort(
        (a, b) => b.pokemon.stats.speed - a.pokemon.stats.speed,
      );
      const firstIsPlayer = isPlayerUnit(turnOrder[0]);

      let initialPlayer = playerWithShield;
      let initialEnemy = enemyWithShield;
      if (firstIsPlayer) {
        initialPlayer = drawCardsForUnit(playerWithShield);
      } else {
        initialEnemy = drawCardsForUnit(enemyWithShield);
      }

      return {
        ...state,
        phase: firstIsPlayer ? "battle" : "enemy_turn",
        player: initialPlayer,
        enemies: [initialEnemy],
        turnOrder: firstIsPlayer
          ? [initialPlayer, initialEnemy]
          : [initialEnemy, initialPlayer],
        currentTurnIndex: 0,
        log: [`Batalha iniciada contra ${enemyWithShield.pokemon.name}!`],
      };
    }

    case "SELECT_MOVE": {
      if (state.phase !== "battle" || !state.player) return state;
      const move = action.move;
      if (move.energyCost > state.player.energy) return state;

      if (state.enemies.length === 1) {
        return battleReducer(state, {
          type: "EXECUTE_ATTACK",
          attacker: state.player,
          defender: state.enemies[0],
          move,
        });
      } else {
        return {
          ...state,
          selectedMove: move,
          selectingTarget: true,
        };
      }
    }

    case "SELECT_TARGET": {
      if (!state.selectedMove || !state.player) return state;
      const target = state.enemies.find(
        (e) => e.pokemon.id === Number(action.targetId),
      );
      if (!target) return state;
      return battleReducer(state, {
        type: "EXECUTE_ATTACK",
        attacker: state.player,
        defender: target,
        move: state.selectedMove,
      });
    }

    case "CANCEL_TARGET":
      return {
        ...state,
        selectedMove: null,
        selectingTarget: false,
      };

    case "EXECUTE_ATTACK": {
      const { attacker, defender, move } = action;
      const effectiveness = getEffectiveness(move.type, defender.pokemon.types);
      const rawDamage = calculateDamage(attacker, move);
      const damage = Math.floor(rawDamage * effectiveness);

      let remainingDamage = damage;
      let newShield = defender.shield;
      let shieldAbsorbed = 0;
      if (newShield > 0) {
        shieldAbsorbed = Math.min(newShield, remainingDamage);
        newShield -= shieldAbsorbed;
        remainingDamage -= shieldAbsorbed;
      }
      const newHp = Math.max(0, defender.currentHp - remainingDamage);

      const updatedDefender = {
        ...defender,
        currentHp: newHp,
        shield: newShield,
      };

      let updatedPlayer = state.player;
      let updatedEnemies = state.enemies;

      const isPlayerDefender = isPlayerUnit(defender);
      if (isPlayerDefender) {
        updatedPlayer = updatedDefender as PlayerPokemon;
      } else {
        updatedEnemies = state.enemies.map((e) =>
          e.pokemon.id === defender.pokemon.id ? updatedDefender : e,
        );
      }

      let effectivenessMessage = "";
      if (effectiveness > 1) effectivenessMessage = " Foi super efetivo!";
      if (effectiveness < 1 && effectiveness > 0)
        effectivenessMessage = " Não foi muito efetivo...";
      if (effectiveness === 0) effectivenessMessage = " Não afetou o alvo!";

      const shieldMessage =
        shieldAbsorbed > 0 ? ` (Escudo absorveu ${shieldAbsorbed})` : "";
      const newLog = [
        ...state.log,
        `${attacker.pokemon.name} usou ${move.name} e causou ${damage} de dano${shieldMessage}!${effectivenessMessage}`,
      ];

      const moveIndex = attacker.hand.findIndex((c) => c.id === move.id);
      const newHand = attacker.hand.filter((_, idx) => idx !== moveIndex);
      const newDiscard = [...attacker.discardPile, move];
      const updatedAttacker = {
        ...attacker,
        hand: newHand,
        discardPile: newDiscard,
        energy: attacker.energy - move.energyCost,
      };

      const isPlayerAttacker = isPlayerUnit(attacker);
      if (isPlayerAttacker) {
        updatedPlayer = updatedAttacker as PlayerPokemon;
      } else {
        updatedEnemies = updatedEnemies.map((e) =>
          e.pokemon.id === attacker.pokemon.id ? updatedAttacker : e,
        );
      }

      const updatedTurnOrder = state.turnOrder.map((unit) => {
        if (isPlayerUnit(unit) && isPlayerAttacker) return updatedAttacker;
        if (
          !isPlayerUnit(unit) &&
          !isPlayerAttacker &&
          unit.pokemon.id === attacker.pokemon.id
        )
          return updatedAttacker;
        if (
          !isPlayerUnit(unit) &&
          unit.pokemon.id === defender.pokemon.id &&
          !isPlayerDefender
        )
          return updatedDefender;
        if (
          isPlayerUnit(unit) &&
          isPlayerDefender &&
          unit.pokemon.id === defender.pokemon.id
        )
          return updatedDefender;
        return unit;
      });

      return {
        ...state,
        player: updatedPlayer,
        enemies: updatedEnemies,
        turnOrder: updatedTurnOrder,
        log: newLog,
        selectedMove: null,
        selectingTarget: false,
      };
    }

    case "END_TURN": {
      const nextIndex = (state.currentTurnIndex + 1) % state.turnOrder.length;
      const nextUnit = state.turnOrder[nextIndex];
      const nextPhase = isPlayerUnit(nextUnit) ? "battle" : "enemy_turn";

      let updatedPlayer = state.player;
      let updatedEnemies = [...state.enemies];
      let updatedTurnOrder = [...state.turnOrder];

      if (nextPhase === "battle" && updatedPlayer) {
        const refreshedPlayer = drawCardsForUnit(updatedPlayer);
        updatedPlayer = refreshedPlayer;
        updatedTurnOrder = updatedTurnOrder.map((unit) =>
          isPlayerUnit(unit) && unit.pokemon.id === updatedPlayer!.pokemon.id
            ? refreshedPlayer
            : unit,
        );
      } else if (nextPhase === "enemy_turn" && updatedEnemies.length > 0) {
        const nextEnemy = nextUnit as EnemyPokemon;
        const refreshedEnemy = drawCardsForUnit(nextEnemy);
        updatedEnemies = updatedEnemies.map((e) =>
          e.pokemon.id === nextEnemy.pokemon.id ? refreshedEnemy : e,
        );
        updatedTurnOrder = updatedTurnOrder.map((unit) =>
          !isPlayerUnit(unit) && unit.pokemon.id === nextEnemy.pokemon.id
            ? refreshedEnemy
            : unit,
        );
      }

      return {
        ...state,
        player: updatedPlayer,
        enemies: updatedEnemies,
        turnOrder: updatedTurnOrder,
        currentTurnIndex: nextIndex,
        phase: nextPhase,
      };
    }

    case "ENEMY_TURN": {
      const currentEnemy = state.turnOrder[
        state.currentTurnIndex
      ] as EnemyPokemon;
      if (!currentEnemy || isPlayerUnit(currentEnemy)) return state;

      const availableMoves = currentEnemy.hand.filter(
        (m) => m.energyCost <= currentEnemy.energy,
      );
      if (availableMoves.length === 0) {
        return battleReducer(state, { type: "END_TURN" });
      }

      const randomMove =
        availableMoves[Math.floor(Math.random() * availableMoves.length)];
      const target = state.player!;

      return battleReducer(state, {
        type: "EXECUTE_ATTACK",
        attacker: currentEnemy,
        defender: target,
        move: randomMove,
      });
    }

    case "ADD_LOG":
      return {
        ...state,
        log: [...state.log, action.message],
      };

    default:
      return state;
  }
}

const initialState: BattleState = {
  phase: "selecting_starter",
  player: null,
  enemies: [],
  turnOrder: [],
  currentTurnIndex: 0,
  log: [],
  selectedMove: null,
  selectingTarget: false,
};

export function useBattleReducer() {
  return useReducer(battleReducer, initialState);
}
