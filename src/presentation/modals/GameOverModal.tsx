import { useNavigate } from "react-router-dom";
import { useGameViewModel } from "../viewmodels/useGameViewModel";
import CenteredModal from "../components/common/modal/CenteredModal";

export default function GameOverModal() {
  const navigate = useNavigate();
  const { resetRun } = useGameViewModel();

  return (
    <CenteredModal>
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
    </CenteredModal>
  );
}
