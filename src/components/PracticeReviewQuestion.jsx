import { assetUrl } from "../services/api";
import PriorityAudio from "./PriorityAudio";

export default function PracticeReviewQuestion({ question, item, questionNumber }) {
  if (!item) return <article className="rounded-2xl border border-slate-200 p-4">
    <p className="font-bold text-slate-900">{questionNumber}. <span className="rich-content" dangerouslySetInnerHTML={{ __html: question.text || "Question" }} /></p>
    <p className="mt-2 text-sm text-amber-700">Answer review is unavailable for this question.</p>
  </article>;

  return <article className={`rounded-2xl border p-4 sm:p-5 ${item.correct ? "border-emerald-200 bg-emerald-50/50" : item.timedOut ? "border-amber-200 bg-amber-50/50" : "border-slate-200 bg-slate-50/70"}`}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <p className="min-w-0 flex-1 font-bold leading-6 text-slate-900">{questionNumber}. <span className="rich-content" dangerouslySetInnerHTML={{ __html: question.text || "Question" }} /></p>
      <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-black ${item.correct ? "bg-emerald-100 text-emerald-700" : item.timedOut ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-700"}`}>{item.correct ? "Correct" : item.timedOut ? "Timed out" : "Incorrect"}</span>
    </div>
    {question.mediaUrl && <ReviewMedia url={question.mediaUrl} type={question.mediaType} />}
    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      {(question.options || []).map((option, optionIndex) => {
        const isCorrect = optionIndex === item.correctOptionOrder;
        const isSelected = optionIndex === item.selectedOptionOrder;
        return <div key={optionIndex} className={`rounded-xl border px-3 py-3 text-sm ${isCorrect ? "border-emerald-300 bg-emerald-100 text-emerald-900" : isSelected ? "border-red-200 bg-red-50 text-red-800" : "border-slate-200 bg-white text-slate-700"}`}>
          <span className="mr-2 font-black">{String.fromCharCode(65 + optionIndex)}.</span>
          <span className="rich-content" dangerouslySetInnerHTML={{ __html: option.text || "Option" }} />
          {option.shapeType && <ReviewShape type={option.shapeType} color={option.shapeColor} compact />}
          {option.mediaUrl && <ReviewMedia url={option.mediaUrl} type={option.mediaType} />}
          <span className="ml-2 block text-[11px] font-black">{isCorrect ? "Correct answer" : isSelected ? "Your answer" : ""}</span>
        </div>;
      })}
    </div>
    {item.explanation && <p className="mt-4 rounded-xl border border-purple-100 bg-white p-3 text-sm leading-6 text-slate-600"><strong className="text-slate-800">Explanation: </strong>{item.explanation}</p>}
  </article>;
}

function ReviewShape({ type, color = "#7442ae", compact = false }) {
  const clips = { circle: "circle(50%)", square: "none", rectangle: "none", triangle: "polygon(50% 0,100% 100%,0 100%)", star: "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 93%,50% 72%,21% 93%,32% 57%,2% 35%,39% 35%)", hexagon: "polygon(25% 7%,75% 7%,100% 50%,75% 93%,25% 93%,0 50%)" };
  return <span role="img" aria-label={`${type} shape`} className="my-3 block" style={{ width: compact ? 38 : 60, height: compact ? 38 : 60, backgroundColor: color, clipPath: clips[type] || clips.circle, borderRadius: type === "circle" ? "50%" : 2 }} />;
}

function ReviewMedia({ url, type }) {
  const src = assetUrl(url);
  if (type === "image") return <img className="mt-4 max-h-72 rounded-xl object-contain" src={src} alt="Question or answer attachment" />;
  if (type === "audio") return <PriorityAudio className="mt-4 w-full" controls src={src} />;
  if (type === "video") return <PriorityAudio as="video" className="mt-4 max-h-72 rounded-xl" controls src={src} />;
  return <a className="mt-3 inline-block font-bold text-purple-700 underline" href={src} target="_blank" rel="noreferrer">Open attached document</a>;
}
