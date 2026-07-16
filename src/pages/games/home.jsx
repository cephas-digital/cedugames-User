import BG from "../../assets/Group 28.png";
import Navbar from "../../components/homeNavbar";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 783.99, 0];

const Home = () => {
  const navigate = useNavigate();
  const [soundOn, setSoundOn] = useState(true);
  const audioContextRef = useRef(null);
  const melodyTimerRef = useRef(null);

  const stopMelody = useCallback(() => {
    window.clearTimeout(melodyTimerRef.current);
    melodyTimerRef.current = null;
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  const startMelody = useCallback(() => {
    if (!soundOn) return;
    if (audioContextRef.current) {
      audioContextRef.current.resume();
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const context = new AudioContext();
    audioContextRef.current = context;
    let noteIndex = 0;

    const playNextNote = () => {
      if (audioContextRef.current !== context) return;
      const frequency = melody[noteIndex % melody.length];

      if (frequency) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0.0001, context.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start();
        oscillator.stop(context.currentTime + 0.38);
      }

      noteIndex += 1;
      melodyTimerRef.current = window.setTimeout(playNextNote, 460);
    };

    context.resume().then(playNextNote).catch(stopMelody);
  }, [soundOn, stopMelody]);

  useEffect(() => {
    if (!soundOn) {
      stopMelody();
      return undefined;
    }

    startMelody();
    window.addEventListener("pointerdown", startMelody, { once: true });
    return () => window.removeEventListener("pointerdown", startMelody);
  }, [soundOn, startMelody, stopMelody]);

  useEffect(() => stopMelody, [stopMelody]);

  const toggleSound = () => setSoundOn((current) => !current);

  return (
    <div
      className="min-h-screen w-full overflow-hidden flex flex-col text-white"
      style={{
        backgroundImage: `url(${BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Navbar />

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <span className="home-sparkle home-sparkle-one">â˜…</span>
        <span className="home-sparkle home-sparkle-two">âœ¦</span>
        <span className="home-sparkle home-sparkle-three">â˜…</span>
        <span className="home-sparkle home-sparkle-four">âœ¦</span>
      </div>

      <button
        type="button"
        onClick={toggleSound}
        aria-pressed={soundOn}
        aria-label={soundOn ? "Turn background music off" : "Turn background music on"}
        className="absolute right-3 top-32 sm:right-6 lg:top-24 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-lg text-white shadow-lg backdrop-blur-sm transition hover:scale-105 hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-white"
      >
        <span aria-hidden="true">{soundOn ? "ðŸ”Š" : "ðŸ”‡"}</span>
      </button>

      <div className="flex-1 flex flex-col justify-end items-center px-4 pt-20 sm:pt-40">
        <button
          onClick={() => navigate("/quiz")}
          className="home-start-button relative z-10 text-white cursor-pointer shadow-xl w-full max-w-72 my-6 flex justify-center items-center bg-[#9B5DE5] hover:bg-[#8B4FD9] hover:shadow-2xl py-3 px-4 rounded-2xl transition-all duration-300"
        >
          Start game
        </button>
      </div>
    </div>
  );
};
export default Home;
