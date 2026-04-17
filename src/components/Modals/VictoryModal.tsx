import { useNavigate } from "react-router-dom";
import { useAccountStore } from "../../store/accountStore";
import { useGameStore } from "../../store/gameStore";

interface VictoryModalProps {
  xpEarned: number;
}

export default function VictoryModal({ xpEarned }: VictoryModalProps) {
  const navigate = useNavigate();
  const { addXp } = useAccountStore();
  const { resetRun } = useGameStore();

  const handleContinue = () => {
    addXp(xpEarned);
    resetRun();
    navigate("/");
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-xl text-center max-w-md w-full mx-4">
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
      </div>
    </div>
  );
}
