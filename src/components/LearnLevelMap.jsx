import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiRequest } from "../services/api";

const positions = [50,39,54,42,55,63,61,51,43];
export default function LearnLevelMap({ levels: initialLevels, programId, topicId }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const learningTopicId = topicId || params.get("parent");
  const [displayLevels, setDisplayLevels] = useState(initialLevels);
  const [selectedId, setSelectedId] = useState(initialLevels[0]?.id || "");
  useEffect(() => {
    if (!learningTopicId) return;
    apiRequest(`/gameplay/learning-topics/${learningTopicId}/levels`).then(data => {
      const found = data.levels || initialLevels;
      setDisplayLevels(found);
      const latestUnlocked = [...found].reverse().find(level => level.unlocked);
      setSelectedId(latestUnlocked?.id || found[0]?.id || "");
    }).catch(() => setDisplayLevels(initialLevels));
  }, [learningTopicId, initialLevels]);
  const levels = displayLevels;
  const selected = displayLevels.find(level => level.id === selectedId);
  const height = useMemo(() => Math.max(520, displayLevels.length * 92 + 120), [displayLevels.length]);
  return <section className="learn-level-map-wrap">
    <div className="learn-level-map-heading"><span>★</span><div><p>Your learning path</p><h2>{selected?.title || "Choose a level"}</h2></div><b>{levels.length} level{levels.length === 1 ? "" : "s"}</b></div>
    <div className="level-map relative mx-auto w-full max-w-4xl overflow-hidden" style={{ height }}>{levels.map((level, index) => <button key={level.id} type="button" onClick={() => setSelectedId(level.id)} style={{ "--level-x": positions[index % positions.length], "--level-bottom": `${index * 92 + 82}px` }} className={`level-map-node absolute z-10 grid h-[68px] w-[68px] place-items-center rounded-full border-[3px] text-center shadow-lg transition sm:h-[76px] sm:w-[76px] ${level.id === selectedId ? "scale-110 border-purple-300 bg-purple-600 text-white ring-4 ring-purple-200/70" : "border-white bg-white text-slate-800 hover:scale-105"}`}><span><span className="block text-lg leading-none">★</span><span className="mt-1 block text-[10px] font-black leading-none sm:text-xs">Level {index + 1}</span></span></button>)}</div>
    <div className="learn-level-start"><button disabled={!selected || selected.unlocked === false} onClick={() => navigate(`/quiz?level=${selected.id}&learning=1&program=${programId}&topic=${learningTopicId}`)} className="home-start-button min-h-12 w-full max-w-sm rounded-2xl bg-purple-600 px-5 py-3 text-base font-black text-white shadow-xl disabled:opacity-50">{selected?.unlocked === false ? "Complete the previous level first" : selected ? `Start ${selected.title}` : "Select a level"}</button></div>
  </section>;
}
