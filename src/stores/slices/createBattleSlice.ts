import type { BattleSlice, StoreSlice } from "../types";
import type { PlayerPokemon, EnemyPokemon } from "../../models/Player";
import { getPokemon } from "../../services/pokeApi";
import {
  buildInitialDeck,
  shuffleArray,
  drawCards,
  createStruggleCard,
} from "../../services/deckService";
import {
  calculateMaxHp,
  calculateShield,
  calculateDamage,
  getEffectiveness,
} from "../../services/battleService";
import { CARDS_PER_TURN, MAX_ENERGY } from "../../config/gameConfig";

const isPlayerUnit = (
  unit: PlayerPokemon | EnemyPokemon,
): unit is PlayerPokemon => "runXp" in unit;
const prepareForTurnStart = <T extends PlayerPokemon | EnemyPokemon>(
  unit: T,
): T => {
  const newDiscard = [...unit.discardPile, ...unit.hand];
  const {
    drawn: newHand,
    newDeck: newDrawPile,
    newDiscard: finalDiscard,
  } = drawCards(unit.drawPile, newDiscard, CARDS_PER_TURN);
  return {
    ...unit,
    drawPile: newDrawPile,
    hand: newHand,
    discardPile: finalDiscard,
    energy: MAX_ENERGY,
  };
};

export const createBattleSlice: StoreSlice<BattleSlice> = (set, get) => ({
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
      energy: MAX_ENERGY,
    };

    const playerWithShield = {
      ...player,
      shield: calculateShield(
        player.pokemon.stats.defense,
        player.pokemon.stats.specialDefense,
        player.level,
      ),
    };
    const turnOrder = [playerWithShield, enemy].sort(
      (a, b) => b.pokemon.stats.speed - a.pokemon.stats.speed,
    );
    let firstUnit = turnOrder[0];
    firstUnit = prepareForTurnStart(firstUnit);
    turnOrder[0] = firstUnit;

    const isFirstUnitPlayer = isPlayerUnit(firstUnit);

    set({
      player: isFirstUnitPlayer
        ? (firstUnit as PlayerPokemon)
        : playerWithShield,
      enemies: [isFirstUnitPlayer ? enemy : (firstUnit as EnemyPokemon)],
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

    const effectiveness = getEffectiveness(
      selectedCard.type,
      defender.pokemon.types,
      selectedCard.typeless,
    );
    const rawDamage = calculateDamage(attacker, selectedCard);
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
    const moveIndex = attacker.hand.findIndex((c) => c.id === selectedCard.id);
    const newHand = attacker.hand.filter((_, idx) => idx !== moveIndex);
    const newDiscard = [...attacker.discardPile, selectedCard];
    let updatedAttacker = {
      ...attacker,
      hand: newHand,
      discardPile: newDiscard,
      energy: attacker.energy - selectedCard.energyCost,
    };

    let effectivenessMessage = "";
    if (effectiveness > 1) effectivenessMessage = " Foi super efetivo!";
    else if (effectiveness < 1 && effectiveness > 0)
      effectivenessMessage = " Não foi muito efetivo...";
    else if (effectiveness === 0) effectivenessMessage = " Não afetou o alvo!";

    const shieldMessage =
      shieldAbsorbed > 0 ? ` (Escudo absorveu ${shieldAbsorbed})` : "";
    const newLogEntry = `${attacker.pokemon.name} usou ${selectedCard.name} e causou ${damage} de dano${shieldMessage}!${effectivenessMessage}`;
    const newLog = [...get().battleLog, newLogEntry];

    if (effectiveness === 0 && !selectedCard.temporary) {
      const struggleCard = createStruggleCard();
      updatedAttacker = {
        ...updatedAttacker,
        hand: [...updatedAttacker.hand, struggleCard],
      };
      newLog.push(
        `Uma carta ${struggleCard.name} foi adicionada à mão de ${attacker.pokemon.name}!`,
      );
    }

    const isPlayerAttacker = isPlayerUnit(attacker);
    const newPlayer = isPlayerAttacker
      ? (updatedAttacker as PlayerPokemon)
      : isPlayerUnit(updatedDefender)
        ? (updatedDefender as PlayerPokemon)
        : get().player;
    const newEnemies = isPlayerAttacker
      ? get().enemies.map((e) =>
          e.pokemon.id === (updatedDefender as EnemyPokemon).pokemon.id
            ? (updatedDefender as EnemyPokemon)
            : e,
        )
      : get().enemies.map((e) =>
          e.pokemon.id === (updatedAttacker as EnemyPokemon).pokemon.id
            ? (updatedAttacker as EnemyPokemon)
            : e,
        );

    const newTurnOrder = get().turnOrder.map((unit) => {
      if (unit.pokemon.id === updatedAttacker.pokemon.id)
        return updatedAttacker;
      if (unit.pokemon.id === updatedDefender.pokemon.id)
        return updatedDefender;
      return unit;
    });

    set({
      player: newPlayer,
      enemies: newEnemies,
      turnOrder: newTurnOrder,
      battleLog: newLog,
      selectedCard: null,
      isTargeting: false,
    });

    if (!isPlayerAttacker) {
      setTimeout(() => get().endTurn(), 500);
    }
  },
  endTurn: () => {
    const { player, enemies } = get();
    if (player && player.currentHp <= 0) {
      get().endBattle(false);
      return;
    }
    if (enemies.every((e) => e.currentHp <= 0)) {
      get().endBattle(true);
      return;
    }

    const nextIndex = (get().currentTurnIndex + 1) % get().turnOrder.length;
    let nextUnit = get().turnOrder[nextIndex];
    nextUnit = prepareForTurnStart(nextUnit);

    const newTurnOrder = get().turnOrder.map((u, i) =>
      i === nextIndex ? nextUnit : u,
    );

    const isNextUnitPlayer = isPlayerUnit(nextUnit);
    set({
      player: isNextUnitPlayer ? (nextUnit as PlayerPokemon) : get().player,
      enemies: isNextUnitPlayer
        ? get().enemies
        : get().enemies.map((e) =>
            e.pokemon.id === nextUnit.pokemon.id
              ? (nextUnit as EnemyPokemon)
              : e,
          ),
      turnOrder: newTurnOrder,
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
});
