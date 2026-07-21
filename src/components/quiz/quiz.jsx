import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../homeNavbar";
import { apiRequest } from "../../services/api";
import BG from "../../assets/BG.png";
import OptionsGrid from "./optionGrid";
import QuestionCard from "./questionCard";
import ResultModal from "./resultModal";

export default function Quiz() {
  const [params] = useSearchParams();
  const levelId = params.get("level");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(Boolean(levelId));
  const [error, setError] = useState(levelId ? "" : "Choose a level before starting the quiz.");
  const [current, setCurrent] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (!levelId) return;
    apiRequest(`/catalog/levels/${levelId}/questions`)
      .then((data) => setQuestions(data.questions || []))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [levelId]);

  const question = questions[current];
  const handleSelectAnswer = (option) => { setSelectedOption(option); setIsCorrect(option.isCorrect); setShowModal(true); };
  const handleNextQuestion = () => {
    setShowModal(false); setSelectedOption(null);
    if (current < questions.length - 1) setCurrent((value) => value + 1);
    else alert("Quiz completed!");
  };

  return <div className="min-h-screen w-full overflow-x-hidden flex flex-col text-white" style={{ backgroundImage: `url(${BG})`, backgroundSize: "cover", backgroundPosition: "center" }}>
    <Navbar />
    <main className="w-full flex-1 px-3 sm:px-6 pb-8">
      {loading ? <QuizState message="Loading your questions..." /> : error ? <QuizState message={error} error /> : !question ? <QuizState message="No published questions are available for this level yet." /> : <>
        <div className="mx-auto mt-4 max-w-3xl text-sm font-bold text-white/90">Question {current + 1} of {questions.length}</div>
        <QuestionCard question={question} />
        <OptionsGrid options={question.options} onSelect={handleSelectAnswer} selectedOption={selectedOption} />
      </>}
    </main>
    {showModal && question && <ResultModal isCorrect={isCorrect} onNext={handleNextQuestion} />}
  </div>;
}

function QuizState({ message, error = false }) {
  return <div className={`mx-auto mt-20 max-w-xl rounded-2xl p-8 text-center font-semibold shadow-lg ${error ? "bg-red-50 text-red-700" : "bg-white text-gray-600"}`}>{message}</div>;
}
