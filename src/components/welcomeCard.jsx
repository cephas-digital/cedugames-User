function WelcomeCard({ image, text, header }) {
  return (
    <div className="w-full max-w-5xl mx-auto grid md:grid-cols-[minmax(16rem,2fr)_minmax(16rem,3fr)] items-center gap-4 md:gap-8 bg-white rounded-2xl shadow-md p-4 sm:p-6 border border-purple-100">
      <img
        src={image}
        alt="welcome"
        className="w-full max-w-80 md:max-w-none mx-auto object-contain"
      />

      <div className="min-w-0">
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
