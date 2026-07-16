const QuestionCard = ({ question }) => {
  return (
    <div className="mt-4 sm:mt-6 mx-auto w-full max-w-2xl bg-[#F4F4F4] rounded-2xl sm:rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 relative">
      <img
        src={question.image}
        className="w-full max-w-52 sm:max-w-80 max-h-48 sm:max-h-none object-contain"
        alt="Question illustration"
      />

      <div className="flex-1 text-center">
        <p className="text-lg sm:text-2xl font-medium text-gray-700 leading-snug">
          {question.text}
        </p>
      </div>

      {question.shape && (
        <img
          src={question.shape}
          className="w-14 sm:w-20"
          alt="Question shape"
        />
      )}
    </div>
  );
};
export default QuestionCard;
