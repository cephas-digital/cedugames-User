import { assetUrl } from "../../services/api";

export default function QuestionCard({ question }) {
  return <div className="mt-4 sm:mt-6 mx-auto w-full max-w-2xl bg-[#F4F4F4] rounded-2xl sm:rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
    <div className="flex flex-col items-center gap-3"><Shape type={question.shapeType} color={question.shapeColor}/><Media mediaType={question.mediaType} mediaUrl={question.mediaUrl} /></div>
    {question.text && <div className="rich-content flex-1 text-center text-lg sm:text-2xl font-medium text-gray-700 leading-snug" dangerouslySetInnerHTML={{ __html: question.text }}/>} 
  </div>;
}

function Shape({ type, color }) {
  if (!type || !color) return null;
  const clips = { circle: "circle(50%)", square: "none", rectangle: "none", triangle: "polygon(50% 0,100% 100%,0 100%)", star: "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 93%,50% 72%,21% 93%,32% 57%,2% 35%,39% 35%)", hexagon: "polygon(25% 7%,75% 7%,100% 50%,75% 93%,25% 93%,0 50%)" };
  return <span role="img" aria-label={`${color} ${type}`} style={{ display: "block", width: type === "rectangle" ? 150 : 110, height: type === "rectangle" ? 78 : 110, backgroundColor: color, clipPath: clips[type], borderRadius: type === "square" || type === "rectangle" ? 10 : 0 }} />;
}

function Media({ mediaType, mediaUrl }) {
  if (!mediaUrl) return null;
  const src = assetUrl(mediaUrl);
  if (mediaType === "image") return <img src={src} className="w-full max-w-52 sm:max-w-80 max-h-48 object-contain" alt="Question media" />;
  if (mediaType === "audio") return <audio controls preload="metadata" className="w-full max-w-xs"><source src={src} /></audio>;
  if (mediaType === "video") return <video controls preload="metadata" className="w-full max-w-sm max-h-64 rounded-xl"><source src={src} /></video>;
  return <a href={src} target="_blank" rel="noreferrer" className="rounded-xl bg-purple-100 px-4 py-3 font-bold text-purple-700">Open question attachment</a>;
}
