import { useNavigate } from "react-router-dom";
import { useAccountStore } from "../../data/stores/accountStore";
import { useGameViewModel } from "../viewmodels/useGameViewModel";
import { VICTORY_XP } from "../../domain/config/gameConfig";
import CenteredModal from "../components/common/modal/CenteredModal";

interface VictoryModalProps {
  xpEarned?: number;
}

export default function VictoryModal({
  xpEarned = VICTORY_XP,
}: VictoryModalProps) {
  const navigate = useNavigate();
  const { addXp } = useAccountStore();
  const { resetRun } = useGameViewModel();

  const handleContinue = () => {
    addXp(xpEarned);
    resetRun();
    navigate("/");
  };

  return (
    <CenteredModal>
      <h2 className="text-3xl font-bold text-yellow-400 mb-4">Vitória!</h2>
      <p className="text-xl text-white mb-2">Você derrotou o chefão!</p>
      <p className="text-lg text-green-400 mb-6">
        +{xpEarned} XP para sua conta
      </p>
      <button
        onClick={handleContinue}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
      >
        Voltar ao Menu
      </button>
    </CenteredModal>
  );
}
