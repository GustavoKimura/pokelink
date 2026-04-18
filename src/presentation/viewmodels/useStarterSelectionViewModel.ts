import { useEffect, useState } from "react";
import { STARTER_OPTIONS } from "../../domain/config/gameConfig";
import { getPokemon } from "../../domain/services/pokeApi";
import type { Pokemon } from "../../domain/models/Pokemon";

export const useStarterSelectionViewModel = () => {
  const [startersData, setStartersData] = useState<Record<number, Pokemon>>({});
  const [loading, setLoading] = useState(true);

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

  return { startersData, loading };
};
