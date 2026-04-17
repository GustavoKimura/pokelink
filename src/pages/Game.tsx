import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function Game() {
  const location = useLocation();
  const navigate = useNavigate();
  const starterId = location.state?.starterId;

  useEffect(() => {
    if (!starterId) {
      navigate("/select");
    }
  }, [starterId, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl mb-4">Preparando aventura...</h2>
        <p className="text-gray-400">Starter ID: {starterId}</p>
        <p className="text-sm text-gray-500 mt-4">
          Próximo passo: inicialização do jogo
        </p>
      </div>
    </div>
  );
}
