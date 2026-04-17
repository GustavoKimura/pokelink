import { useReducer } from "react";
import type { BattleState, PlayerPokemon, EnemyPokemon, Card } from "../types";
import { drawCards } from "../utils/cardUtils";
import { calculateDamage } from "../utils/battleUtils";

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

function battleReducer(state: BattleState, action: BattleAction): BattleState {
  switch (action.type) {
    case "INIT_BATTLE": {
      const turnOrder = [action.player, action.enemy].sort(
        (a, b) => b.pokemon.stats.speed - a.pokemon.stats.speed,
      );
      const firstIsPlayer = turnOrder[0] === action.player;
      return {
        ...state,
        phase: firstIsPlayer ? "battle" : "enemy_turn",
        player: action.player,
        enemies: [action.enemy],
        turnOrder,
        currentTurnIndex: 0,
        log: [`Batalha iniciada contra ${action.enemy.pokemon.name}!`],
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
      const damage = calculateDamage(attacker, defender, move);
      const newHp = Math.max(0, defender.currentHp - damage);
      const updatedDefender = { ...defender, currentHp: newHp };

      const updatedEnemies = state.enemies.map((e) =>
        e.pokemon.id === defender.pokemon.id ? updatedDefender : e,
      );

      const newLog = [
        ...state.log,
        `${attacker.pokemon.name} usou ${move.name} e causou ${damage} de dano!`,
      ];

      const updatedAttacker = {
        ...attacker,
        energy: attacker.energy - move.energyCost,
      };
      const updatedPlayer =
        state.player?.pokemon.id === attacker.pokemon.id
          ? updatedAttacker
          : state.player;

      return {
        ...state,
        player: updatedPlayer as PlayerPokemon | null,
        enemies: updatedEnemies,
        log: newLog,
        selectedMove: null,
        selectingTarget: false,
      };
    }

    case "END_TURN": {
      if (!state.player) return state;

      const newDiscard = [...state.player.discardPile, ...state.player.hand];
      const {
        drawn: newHand,
        newDeck,
        newDiscard: finalDiscard,
      } = drawCards(state.player.deck, newDiscard, 3);
      const updatedPlayer = {
        ...state.player,
        deck: newDeck,
        hand: newHand,
        discardPile: finalDiscard,
        energy: 3,
      };

      const nextIndex = (state.currentTurnIndex + 1) % state.turnOrder.length;
      const nextUnit = state.turnOrder[nextIndex];
      const nextPhase = nextUnit === updatedPlayer ? "battle" : "enemy_turn";

      return {
        ...state,
        player: updatedPlayer,
        currentTurnIndex: nextIndex,
        phase: nextPhase,
      };
    }

    case "ENEMY_TURN": {
      const currentEnemy = state.turnOrder[
        state.currentTurnIndex
      ] as EnemyPokemon;
      if (!currentEnemy || currentEnemy === state.player) return state;

      const availableMoves = currentEnemy.hand.filter(
        (m) => m.energyCost <= currentEnemy.energy,
      );
      if (availableMoves.length === 0) {
        return battleReducer(state, { type: "END_TURN" });
      }

      const randomMove =
        availableMoves[Math.floor(Math.random() * availableMoves.length)];
      const target = state.player!;

      const afterAttackState = battleReducer(state, {
        type: "EXECUTE_ATTACK",
        attacker: currentEnemy,
        defender: target,
        move: randomMove,
      });

      return battleReducer(afterAttackState, { type: "END_TURN" });
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
