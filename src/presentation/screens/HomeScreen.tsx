import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function HomeScreen() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold mb-4 text-yellow-400">PokéLink</h1>
      <p className="text-xl mb-8 text-gray-300">
        Pokémon Roguelike Multiplayer
      </p>
      <div className="flex gap-4">
        <Button as={Link} to="/select">
          Jogar Solo
        </Button>
        <Button
          disabled
          style={{ backgroundColor: "#16a34a", cursor: "not-allowed" }}
        >
          Criar Sala (em breve)
        </Button>
        <Button
          disabled
          style={{ backgroundColor: "#8b5cf6", cursor: "not-allowed" }}
        >
          Entrar em Sala (em breve)
        </Button>
      </div>
      <p className="mt-8 text-sm text-gray-500">Versão MVP</p>
    </div>
  );
}
