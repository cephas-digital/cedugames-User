import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isSignedIn } from "../services/api";

import Backgroundpic from "../assets/b.png";
import side from "../assets/side.png";

export default function Background() {
  const [progress, setProgress] = useState(8);
  const navigate = useNavigate();

  useEffect(() => {
    const frame = requestAnimationFrame(() => setProgress(100));
    const timer = window.setTimeout(
      () => navigate(isSignedIn() ? "/age-selection" : "/login"),
      850,
    );
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center px-4 text-white"
      style={{
        backgroundImage: `url(${Backgroundpic})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <img
        src={side}
        alt="side"
        className="w-full max-w-105"
      />

      <p className="mt-8 text-sm tracking-widest text-white/80">
        Loading fun...
      </p>

      <div className="w-full max-w-[380px] h-3 bg-white/30 rounded-full mt-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-[width] duration-700 ease-out shadow-[0_0_10px_orange]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-3 font-semibold text-lg">{progress}%</p>
    </div>
  );
}
