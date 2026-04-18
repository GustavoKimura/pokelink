import { useNavigate } from "react-router-dom";
import { useGameViewModel } from "../../viewmodels/game/useGameViewModel";

export default function GameOverModal() {
  const navigate = useNavigate();
  const { resetRun } = useGameViewModel();

  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-xl text-center max-w-md w-full mx-4 border border-gray-700">
        <h2 className="text-3xl font-bold text-red-500 mb-4">Derrota</h2>
        <p className="text-xl text-white mb-6">Seu Pokémon foi derrotado!</p>
        <button
          onClick={() => {
            resetRun();
            navigate("/");
          }}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
        >
          Voltar ao Menu
        </button>
      </div>
    </div>
  );
}
