import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AccountState {
  totalXp: number;
  addXp: (xp: number) => void;
  resetAccount: () => void;
}

const DEFAULT_STATE = {
  totalXp: 0,
};

export const useAccountStore = create<AccountState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,
      addXp: (xp) => set((state) => ({ totalXp: state.totalXp + xp })),
      resetAccount: () => set(DEFAULT_STATE),
    }),
    { name: "pokelink-account" },
  ),
);
