import type { BattleSlice, StoreSlice } from "../types";
import type {
  PlayerPokemon,
  EnemyPokemon,
} from "../../../domain/models/Player";
import { getPokemon } from "../../../domain/services/pokeApi";
import {
  buildInitialDeck,
  shuffleArray,
} from "../../../domain/services/deckService";
import {
  calculateMaxHp,
  calculateShield,
} from "../../../domain/services/battleService";
import {
  BASE_GOLD_PER_BATTLE,
  GOLD_PER_ENEMY_LEVEL,
} from "../../../domain/config/gameConfig";
import {
  isPlayerUnit,
  discardHand,
  prepareForTurnStart,
  executeAttack,
  applyAttackUpdates,
} from "../../../domain/services/turnService";

export const createBattleSlice: StoreSlice<BattleSlice> = (set, get) => ({
  battleKey: 0,
  enemies: [],
  turnOrder: [],
  currentTurnIndex: 0,
  battleLog: [],
  selectedCard: null,
  isTargeting: false,
  initializeBattle: async (enemyNode) => {
    const player = get().player;
    if (!player) return;

    const enemyPokemon = await getPokemon(enemyNode.pokemonId!);
    const enemyRunDeck = await buildInitialDeck(enemyPokemon);
    const enemy: EnemyPokemon = {
      pokemon: enemyPokemon,
      level: enemyNode.level,
      currentHp: calculateMaxHp(enemyPokemon.stats.hp, enemyNode.level),
      maxHp: calculateMaxHp(enemyPokemon.stats.hp, enemyNode.level),
      shield: calculateShield(
        enemyPokemon.stats.defense,
        enemyPokemon.stats.specialDefense,
        enemyNode.level,
      ),
      runDeck: enemyRunDeck,
      drawPile: shuffleArray([...enemyRunDeck]),
      hand: [],
      discardPile: [],
      energy: 3,
    };

    const playerWithShield = {
      ...player,
      shield: calculateShield(
        player.pokemon.stats.defense,
        player.pokemon.stats.specialDefense,
        player.level,
      ),
      hand: [],
      discardPile: [],
      drawPile: shuffleArray([...player.runDeck]),
      energy: 3,
    };
    const turnOrder = [playerWithShield, enemy].sort(
      (a, b) => b.pokemon.stats.speed - a.pokemon.stats.speed,
    );
    turnOrder[0] = prepareForTurnStart(turnOrder[0]);
    const isFirstUnitPlayer = isPlayerUnit(turnOrder[0]);

    set({
      player: isFirstUnitPlayer
        ? (turnOrder[0] as PlayerPokemon)
        : playerWithShield,
      enemies: [isFirstUnitPlayer ? enemy : (turnOrder[0] as EnemyPokemon)],
      turnOrder,
      currentTurnIndex: 0,
      battleLog: [`Batalha iniciada contra ${enemy.pokemon.name}!`],
      phase: isFirstUnitPlayer ? "battle" : "enemy_turn",
    });
  },
  selectCard: (card) => {
    const { player, enemies } = get();
    if (!player || card.energyCost > player.energy) return;
    if (enemies.length === 1) {
      set({ selectedCard: card });
      get().selectTarget(enemies[0].pokemon.id);
    } else {
      set({ selectedCard: card, isTargeting: true });
    }
  },
  cancelTarget: () => set({ selectedCard: null, isTargeting: false }),
  selectTarget: (targetId) => {
    const { turnOrder, currentTurnIndex, selectedCard, player } = get();
    if (!selectedCard) return;

    const attacker = turnOrder[currentTurnIndex];
    const defender = isPlayerUnit(attacker)
      ? get().enemies.find((e) => e.pokemon.id === targetId)
      : player;
    if (!attacker || !defender) return;

    const { updatedAttacker, updatedDefender, logEntries } = executeAttack(
      attacker,
      defender,
      selectedCard,
    );

    const { newTurnOrder, newPlayer, newEnemies } = applyAttackUpdates(
      get().turnOrder,
      updatedAttacker,
      updatedDefender,
    );

    set({
      player: newPlayer,
      enemies: newEnemies,
      turnOrder: newTurnOrder,
      battleLog: [...get().battleLog, ...logEntries],
      selectedCard: null,
      isTargeting: false,
    });

    const enemyDead = newEnemies.every((e) => e.currentHp <= 0);
    const playerDead = newPlayer ? newPlayer.currentHp <= 0 : false;

    if (enemyDead) {
      const goldEarned =
        BASE_GOLD_PER_BATTLE + defender.level * GOLD_PER_ENEMY_LEVEL;
      get().addGold(goldEarned);
      get().endBattle(true);
    } else if (playerDead) {
      get().endBattle(false);
    } else if (!isPlayerUnit(attacker)) {
      setTimeout(() => get().endTurn(), 500);
    }
  },
  endTurn: () => {
    const { player, enemies, turnOrder, currentTurnIndex } = get();
    if (
      (player && player.currentHp <= 0) ||
      enemies.every((e) => e.currentHp <= 0)
    ) {
      return;
    }

    const updatedTurnOrder = [...turnOrder];
    updatedTurnOrder[currentTurnIndex] = discardHand(
      turnOrder[currentTurnIndex],
    );
    const nextIndex = (currentTurnIndex + 1) % updatedTurnOrder.length;
    updatedTurnOrder[nextIndex] = prepareForTurnStart(
      updatedTurnOrder[nextIndex],
    );
    const nextUnit = updatedTurnOrder[nextIndex];
    const isNextUnitPlayer = isPlayerUnit(nextUnit);

    set({
      player: updatedTurnOrder.find(isPlayerUnit) as PlayerPokemon | undefined,
      enemies: updatedTurnOrder.filter(
        (u) => !isPlayerUnit(u),
      ) as EnemyPokemon[],
      turnOrder: updatedTurnOrder,
      currentTurnIndex: nextIndex,
      phase: isNextUnitPlayer ? "battle" : "enemy_turn",
    });
  },
  executeEnemyAction: () => {
    const { turnOrder, currentTurnIndex, player } = get();
    const currentEnemy = turnOrder[currentTurnIndex] as EnemyPokemon;
    if (!currentEnemy || !player) {
      get().endTurn();
      return;
    }
    const availableMoves = currentEnemy.hand.filter(
      (m) => m.energyCost <= currentEnemy.energy,
    );
    if (availableMoves.length > 0) {
      const randomMove =
        availableMoves[Math.floor(Math.random() * availableMoves.length)];
      set({ selectedCard: randomMove });
      get().selectTarget(player.pokemon.id);
    } else {
      get().endTurn();
    }
  },
  refreshBattle: () => {
    set({ battleKey: get().battleKey + 1 });
  },
});
