import { useEffect, useState, useMemo } from "react";
import { STARTER_OPTIONS } from "../../domain/config/gameConfig";
import { getPokemon } from "../../domain/services/pokeApi";
import type { Pokemon } from "../../domain/models/Pokemon";
import { useAccountStore } from "../../data/stores/accountStore";

export const useStarterSelectionViewModel = () => {
  const [startersData, setStartersData] = useState<Record<number, Pokemon>>({});
  const [loading, setLoading] = useState(true);
  const { totalXp } = useAccountStore();

  useEffect(() => {
    const loadStarters = async () => {
      setLoading(true);
      const data: Record<number, Pokemon> = {};
      for (const starter of STARTER_OPTIONS) {
        try {
          data[starter.id] = await getPokemon(starter.id);
        } catch (error) {
          console.error(`Failed to load starter ${starter.id}`, error);
        }
      }
      setStartersData(data);
      setLoading(false);
    };
    loadStarters();
  }, []);

  const unlockedStarters = useMemo(() => {
    const unlocked = new Set<number>();
    STARTER_OPTIONS.forEach((s) => {
      if (s.unlocked || totalXp >= s.requiredXp) {
        unlocked.add(s.id);
      }
    });
    return unlocked;
  }, [totalXp]);

  return { startersData, loading, unlockedStarters };
};
