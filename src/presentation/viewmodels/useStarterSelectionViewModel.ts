import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { STARTER_OPTIONS } from "../../domain/config/gameConfig";
import { getPokemon } from "../../domain/services/pokeApi";
import type { Pokemon } from "../../domain/models/Pokemon";
import type { Card } from "../../domain/models/Card";
import { useAccountStore } from "../../data/stores/accountStore";

export const useStarterSelectionViewModel = () => {
  const navigate = useNavigate();
  const [startersData, setStartersData] = useState<Record<number, Pokemon>>({});
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [pokemonForModal, setPokemonForModal] = useState<Pokemon | null>(null);
  const [customDecks, setCustomDecks] = useState<Record<number, Card[]>>({});
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

  const handleSelectStarter = (id: number) => {
    if (unlockedStarters.has(id)) {
      setSelectedId(id);
    }
  };

  const handleConfirm = () => {
    if (selectedId) {
      const deck = customDecks[selectedId];
      navigate("/game", { state: { starterId: selectedId, customDeck: deck } });
    }
  };

  const handleViewDeck = (id: number) => {
    const pokemon = startersData[id];
    if (pokemon) {
      setPokemonForModal(pokemon);
      setShowDeckModal(true);
    }
  };

  const handleSaveCustomDeck = (deck: Card[]) => {
    if (pokemonForModal) {
      setCustomDecks((prev) => ({
        ...prev,
        [pokemonForModal.id]: deck,
      }));
    }
    setShowDeckModal(false);
  };

  const handleCloseDeckModal = () => {
    setShowDeckModal(false);
    setPokemonForModal(null);
  };

  return {
    totalXp,
    startersData,
    loading,
    unlockedStarters,
    selectedId,
    handleSelectStarter,
    handleConfirm,
    showDeckModal,
    pokemonForModal,
    handleViewDeck,
    handleSaveCustomDeck,
    handleCloseDeckModal,
  };
};
