interface RestModalProps {
  onContinue: () => void;
  healAmount: number;
}

export default function RestModal({ onContinue, healAmount }: RestModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-xl text-center max-w-md w-full mx-4">
        <h2 className="text-3xl font-bold text-green-400 mb-4">Descanso</h2>
        <p className="text-xl text-white mb-6">
          Você recuperou {healAmount} de HP!
        </p>
        <button
          onClick={onContinue}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
