import { assetUrl } from "../../services/api";

export default function OptionsGrid({ options, onSelect, revealedOptionId }) {
  const useTwoColumns = options.length > 1 && options.every((option) => {
    const text = (option.text || "").replace(/<[^>]*>/g, " ").replace(/&[^;]+;/g, " ").replace(/\s+/g, " ").trim();
    return text.length <= 50 && !["audio", "video"].includes(option.mediaType);
  });

  return <div className="w-full max-w-3xl mx-auto">
    <h1 className="my-4 text-lg sm:text-xl text-black">Select Option</h1>
    <ul className={`grid gap-3 sm:gap-6 mt-4 sm:mt-6 ${useTwoColumns?"grid-cols-2":"grid-cols-1"}`}>
      {options.map((option) => <li key={option.id} className={`min-w-0 rounded-2xl overflow-hidden bg-white/90 shadow-md ${revealedOptionId===option.id?"ring-4 ring-emerald-400":""}`}>
        <button type="button" onClick={() => onSelect(option)} className="w-full min-h-32 sm:min-h-44 p-3 sm:p-6 flex justify-center items-center cursor-pointer">
          <span className="flex min-w-0 flex-col items-center gap-3 text-center text-base font-bold text-gray-800 sm:text-lg"><OptionShape option={option}/><OptionMedia option={option} />{option.text && <span className="rich-content max-w-full break-words" dangerouslySetInnerHTML={{ __html: option.text }}/>}</span>
        </button>
      </li>)}
    </ul>
  </div>;
}

function OptionShape({ option }) {
  if (!option.shapeType || !option.shapeColor) return null;
  const clips = { circle: "circle(50%)", square: "none", rectangle: "none", triangle: "polygon(50% 0,100% 100%,0 100%)", star: "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 93%,50% 72%,21% 93%,32% 57%,2% 35%,39% 35%)", hexagon: "polygon(25% 7%,75% 7%,100% 50%,75% 93%,25% 93%,0 50%)" };
  return <span role="img" aria-label={`${option.shapeColor} ${option.shapeType}`} style={{ display: "block", width: option.shapeType === "rectangle" ? 120 : 88, height: option.shapeType === "rectangle" ? 62 : 88, backgroundColor: option.shapeColor, clipPath: clips[option.shapeType], borderRadius: option.shapeType === "square" || option.shapeType === "rectangle" ? 8 : 0 }} />;
}

function OptionMedia({ option }) {
  if (!option.mediaUrl) return null;
  const src = assetUrl(option.mediaUrl);
  if (option.mediaType === "image") return <img src={src} alt="Answer option" className="w-28 sm:w-40 max-h-32 object-contain" />;
  if (option.mediaType === "audio") return <audio controls preload="metadata" onClick={(event) => event.stopPropagation()} className="max-w-full"><source src={src} /></audio>;
  if (option.mediaType === "video") return <video controls preload="metadata" onClick={(event) => event.stopPropagation()} className="max-h-36 max-w-full rounded-lg"><source src={src} /></video>;
  return <a href={src} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="text-purple-700 underline">Open attachment</a>;
}
