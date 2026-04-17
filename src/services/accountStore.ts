import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AccountState {
  playerName: string;
  totalXp: number;
  unlockedStarters: string[];
  setPlayerName: (name: string) => void;
  addXp: (xp: number) => void;
  unlockStarter: (starterId: string) => void;
  resetAccount: () => void;
}

const DEFAULT_STATE = {
  playerName: "Trainer",
  totalXp: 0,
  unlockedStarters: ["eevee"],
};

export const useAccountStore = create<AccountState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,
      setPlayerName: (name) => set({ playerName: name }),
      addXp: (xp) => set((state) => ({ totalXp: state.totalXp + xp })),
      unlockStarter: (starterId) =>
        set((state) => ({
          unlockedStarters: state.unlockedStarters.includes(starterId)
            ? state.unlockedStarters
            : [...state.unlockedStarters, starterId],
        })),
      resetAccount: () => set(DEFAULT_STATE),
    }),
    {
      name: "pokelink-account",
    },
  ),
);
