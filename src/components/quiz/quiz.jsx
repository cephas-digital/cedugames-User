import { useState } from "react";
import Navbar from "../homeNavbar";
import Questions from "../../question";
import BG from "../../assets/BG.png";
import OptionsGrid from "./optionGrid";
import QuestionCard from "./questionCard";
import ResultModal from "./resultModal";

export default function Quiz() {
  const [current, setCurrent] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  // const [userAnswers, setUserAnswers] = useState([]);

  // const activeQuestion = userAnswers.length;

  // function handleSelectAnswer(selectedAnswer) {
  //   // setUserAnswers([...userAnswers, selectedAnswer]);
  //   setUserAnswers((prevAnswers) => {
  //     return [...prevAnswers, selectedAnswer];
  //   });
  // }

  // function handleSelectAnswer(option) {
  //   if (option.correct) {
  //     alert("Correct!");
  //   } else {
  //     alert("Wrong! Try again.");
  //   }
  // }

  function handleSelectAnswer(option) {
    setSelectedOption(option);
    setIsCorrect(option.correct);
    setShowModal(true);
  }

  const question = Questions[current];

  function handleNextQuestion() {
    setShowModal(false);
    setSelectedOption(null);

    if (current < Questions.length - 1) {
      setCurrent((prev) => prev + 1);
    } else {
      alert("Quiz Completed 🎉");
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col text-white"
      style={{
        backgroundImage: `url(${BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Navbar />

      <QuestionCard question={question} />

      <OptionsGrid
        options={question.options}
        onSelect={handleSelectAnswer}
        selectedOption={selectedOption}
      />

      {showModal && (
        <ResultModal
          isCorrect={isCorrect}
          onNext={handleNextQuestion}
        />
      )}
    </div>
  );
}
