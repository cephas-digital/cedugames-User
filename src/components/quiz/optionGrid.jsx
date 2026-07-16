const OptionsGrid = ({ options, onSelect }) => {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <h1 className="my-4 text-lg sm:text-xl text-black">Select Option</h1>
      <ul className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3 sm:gap-6 mt-4 sm:mt-6">
        {options.map((option, index) => (
          <li
            key={index}
            className={`${option.bg} min-w-0 rounded-2xl overflow-hidden`}
          >
            <button
              onClick={() => onSelect(option)}
              className="w-full min-h-32 sm:min-h-44 p-3 sm:p-6 flex justify-center items-center cursor-pointer"
            >
              <img
                src={option.image}
                alt="option"
                className="w-28 sm:w-40 max-h-32 object-contain"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OptionsGrid;
