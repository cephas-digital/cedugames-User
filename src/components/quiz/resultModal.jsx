import nextLEvel from "../../assets/next-level.png";

export default function ResultModal({ isCorrect, onNext }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="text-black p-4 sm:p-6 rounded-2xl w-full max-w-80 text-center animate-scaleIn">
        <h2 className="text-2xl font-bold mb-4">
          {isCorrect ? "🎉 Correct!" : "❌ Wrong!"}
        </h2>

        {isCorrect && (
          <img
            src={nextLEvel}
            alt="Next Level"
            className="mx-auto mb-4 max-h-[60vh] object-contain"
          />
        )}

        <button
          onClick={onNext}
          className="bg-purple-600 text-white px-5 py-2 rounded-xl hover:bg-purple-700 transition"
        >
          Next Question →
        </button>
      </div>
    </div>
  );
}
