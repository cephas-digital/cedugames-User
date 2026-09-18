import { useEffect, useState } from "react";
import { assetUrl } from "../../services/api";

export default function QuestionCard({ question }) {
  const [speakingQuestionId, setSpeakingQuestionId] = useState(null);
  const speaking = speakingQuestionId === question.id;

  useEffect(() => {
    window.speechSynthesis?.cancel();
    return () => window.speechSynthesis?.cancel();
  }, [question.id]);

  const speak = () => {
    if (!window.speechSynthesis || !question.readAloud) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeakingQuestionId(null);
      return;
    }
    const questionText = toSpeechText(question.text);
    const answerText = (question.options || []).map((option, index) => `Option ${String.fromCharCode(65 + index)}: ${toSpeechText(option.text)}`).join(". ");
    const utterance = new SpeechSynthesisUtterance(`${questionText}. ${answerText}`);
    utterance.rate = 0.9;
    utterance.onend = () => setSpeakingQuestionId(null);
    utterance.onerror = () => setSpeakingQuestionId(null);
    window.speechSynthesis.speak(utterance);
    setSpeakingQuestionId(question.id);
  };

  return <div className="mt-4 sm:mt-6 mx-auto w-full max-w-2xl bg-[#F4F4F4] rounded-2xl sm:rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
    <div className="flex flex-col items-center gap-3"><Shape type={question.shapeType} color={question.shapeColor}/><Media mediaType={question.mediaType} mediaUrl={question.mediaUrl} /></div>
    <div className="flex min-w-0 flex-1 flex-col items-center gap-4"><div className="rich-content text-center text-lg font-medium leading-snug text-gray-700 sm:text-2xl" dangerouslySetInnerHTML={{ __html: question.text }}/>{question.readAloud && <button type="button" onClick={speak} className="flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-purple-700" aria-label={speaking ? "Stop reading question and answers" : "Read question and answers aloud"}>{speaking ? "Stop reading" : "Play audio"}</button>}</div>
  </div>;
}

function toSpeechText(value) {
  if (!value) return "";
  const element = document.createElement("div");
  element.innerHTML = value;
  return element.textContent?.replace(/\s+/g, " ").trim() || "";
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
