function WelcomeCard({ image, text, header }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 md:flex grid items-center gap-4 lg:max-w-200 mx-auto border border-purple-100">
      <img
        src={image}
        alt="welcome"
        className="w-full max-w-80 mx-auto"
      />

      <div>
        <h1 className=" text-[#281B22] mb-4 text-xl font-semibold">
          {" "}
          {header}{" "}
        </h1>
        <p className="text-gray-600 text-base sm:text-xl leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

export default WelcomeCard;
