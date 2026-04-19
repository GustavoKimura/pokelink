import type { PlayerPokemon, EnemyPokemon } from "../models/Player";
import type { Card } from "../models/Card";
import { CARDS_PER_TURN, MAX_ENERGY } from "../config/gameConfig";
import { drawCards, createStruggleCard } from "./deckService";
import { getEffectiveness, calculateDamage } from "./battleService";

type BattleUnit = PlayerPokemon | EnemyPokemon;

export const isPlayerUnit = (unit: BattleUnit): unit is PlayerPokemon =>
  "runXp" in unit;

export const discardHand = <T extends BattleUnit>(unit: T): T => {
  const newDiscard = [...unit.discardPile, ...unit.hand];
  return { ...unit, hand: [], discardPile: newDiscard };
};

export const prepareForTurnStart = <T extends BattleUnit>(unit: T): T => {
  const {
    drawn: newHand,
    newDeck: newDrawPile,
    newDiscard: finalDiscard,
  } = drawCards(unit.drawPile, unit.discardPile, CARDS_PER_TURN);
  return {
    ...unit,
    drawPile: newDrawPile,
    hand: newHand,
    discardPile: finalDiscard,
    energy: MAX_ENERGY,
  };
};

export interface AttackResult {
  updatedAttacker: BattleUnit;
  updatedDefender: BattleUnit;
  logEntries: string[];
}

export const executeAttack = (
  attacker: BattleUnit,
  defender: BattleUnit,
  card: Card,
): AttackResult => {
  const effectiveness = getEffectiveness(
    card.type,
    defender.pokemon.types,
    card.typeless,
  );
  const rawDamage = calculateDamage(attacker, card);
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

  const moveIndex = attacker.hand.findIndex((c) => c.id === card.id);
  const newHand = attacker.hand.filter((_, idx) => idx !== moveIndex);
  const newDiscard = [...attacker.discardPile, card];
  let updatedAttacker: BattleUnit = {
    ...attacker,
    hand: newHand,
    discardPile: newDiscard,
    energy: attacker.energy - card.energyCost,
  };

  const logEntries: string[] = [];
  let effectivenessMessage = "";
  if (effectiveness > 1) effectivenessMessage = " Foi super efetivo!";
  else if (effectiveness < 1 && effectiveness > 0)
    effectivenessMessage = " Não foi muito efetivo...";
  else if (effectiveness === 0) effectivenessMessage = " Não afetou o alvo!";

  const shieldMessage =
    shieldAbsorbed > 0 ? ` (Escudo absorveu ${shieldAbsorbed})` : "";
  logEntries.push(
    `${attacker.pokemon.name} usou ${card.name} e causou ${damage} de dano${shieldMessage}!${effectivenessMessage}`,
  );

  if (effectiveness === 0 && !card.temporary) {
    const struggleCard = createStruggleCard();
    updatedAttacker = {
      ...updatedAttacker,
      hand: [...updatedAttacker.hand, struggleCard],
    };
    logEntries.push(
      `Uma carta ${struggleCard.name} foi adicionada à mão de ${attacker.pokemon.name}!`,
    );
  }

  return { updatedAttacker, updatedDefender, logEntries };
};
