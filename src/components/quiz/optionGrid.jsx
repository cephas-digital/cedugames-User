import { assetUrl } from "../../services/api";

export default function OptionsGrid({ options, onSelect }) {
  return <div className="w-full max-w-3xl mx-auto">
    <h1 className="my-4 text-lg sm:text-xl text-black">Select Option</h1>
    <ul className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-3 sm:gap-6 mt-4 sm:mt-6">
      {options.map((option) => <li key={option.id} className="min-w-0 rounded-2xl overflow-hidden bg-white/90 shadow-md">
        <button type="button" onClick={() => onSelect(option)} className="w-full min-h-32 sm:min-h-44 p-3 sm:p-6 flex justify-center items-center cursor-pointer">
          <span className="flex flex-col items-center gap-3 text-lg font-bold text-gray-800"><OptionMedia option={option} />{option.text && <span>{option.text}</span>}</span>
        </button>
      </li>)}
    </ul>
  </div>;
}

function OptionMedia({ option }) {
  if (!option.mediaUrl) return null;
  const src = assetUrl(option.mediaUrl);
  if (option.mediaType === "image") return <img src={src} alt="Answer option" className="w-28 sm:w-40 max-h-32 object-contain" />;
  if (option.mediaType === "audio") return <audio controls preload="metadata" onClick={(event) => event.stopPropagation()} className="max-w-full"><source src={src} /></audio>;
  if (option.mediaType === "video") return <video controls preload="metadata" onClick={(event) => event.stopPropagation()} className="max-h-36 max-w-full rounded-lg"><source src={src} /></video>;
  return <a href={src} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="text-purple-700 underline">Open attachment</a>;
}
