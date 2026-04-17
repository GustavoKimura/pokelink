import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center">
      <h1 className="text-5xl font-bold mb-4 text-yellow-400">PokéLink</h1>
      <p className="text-xl mb-8 text-gray-300">
        Pokémon Roguelike Multiplayer
      </p>
      <div className="flex gap-4">
        <Link
          to="/select"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
        >
          Jogar Solo
        </Link>
        <button
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
          disabled
        >
          Criar Sala (em breve)
        </button>
        <button
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
          disabled
        >
          Entrar em Sala (em breve)
        </button>
      </div>
      <p className="mt-8 text-sm text-gray-500">Versão MVP</p>
    </div>
  );
}
