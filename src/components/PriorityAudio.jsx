import { useEffect, useRef } from "react";
import { beginPriorityAudio, endPriorityAudio } from "../services/gameSounds";

/** Audio content temporarily takes priority over the game's looping music. */
export default function PriorityAudio({ as = "audio", ...props }) {
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    const pauseGameMusic = () => beginPriorityAudio(audio);
    const resumeGameMusic = () => endPriorityAudio(audio);
    audio.addEventListener("play", pauseGameMusic);
    audio.addEventListener("pause", resumeGameMusic);
    audio.addEventListener("ended", resumeGameMusic);
    audio.addEventListener("error", resumeGameMusic);
    return () => {
      audio.removeEventListener("play", pauseGameMusic);
      audio.removeEventListener("pause", resumeGameMusic);
      audio.removeEventListener("ended", resumeGameMusic);
      audio.removeEventListener("error", resumeGameMusic);
      endPriorityAudio(audio);
    };
  }, []);

  return as === "video" ? <video {...props} ref={audioRef} /> : <audio {...props} ref={audioRef} />;
}
