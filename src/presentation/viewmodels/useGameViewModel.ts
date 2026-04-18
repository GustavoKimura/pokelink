import { useGameStore } from "../../data/stores/useGameStore";
import type { PlayerPokemon } from "../../domain/models/Player";

export const useGameViewModel = () => {
  const store = useGameStore();
  return {
    ...store,
    applyItemToPokemon: store.applyItemToPokemon,
    updatePlayerRunDeck: (runDeck: PlayerPokemon["runDeck"]) => {
      const state = useGameStore.getState();
      if (state.player) {
        useGameStore.setState({ player: { ...state.player, runDeck } });
      }
    },
  };
};
