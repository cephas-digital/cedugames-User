import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/navbar";
import { apiRequest } from "../../services/api";
import kidOne from "../../assets/userone.png";
import kidTwo from "../../assets/usertwo.png";
import kidThree from "../../assets/userthree.png";

const kids = [kidOne, kidTwo, kidThree];
const themes = [
  { gradient: "from-fuchsia-500 to-violet-600", pale: "bg-fuchsia-50", emoji: "🌈", label: "Little Explorer" },
  { gradient: "from-sky-400 to-blue-600", pale: "bg-sky-50", emoji: "🚀", label: "Bright Adventurer" },
  { gradient: "from-amber-400 to-orange-500", pale: "bg-amber-50", emoji: "🏆", label: "Super Challenger" },
];

export default function AgeSelection() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/catalog/age-groups")
      .then((data) => setGroups(data.ageGroups || []))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="age-selection min-h-screen overflow-hidden bg-[#fff9ef]">
      <Navbar />
      <main className="relative mx-auto max-w-6xl px-4 pb-12 pt-5 sm:px-8 sm:pt-9">
        <span className="age-orb age-orb-one" />
        <span className="age-orb age-orb-two" />
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-400 px-5 py-7 text-center text-white shadow-[0_18px_45px_rgba(126,34,206,.28)] sm:px-10 sm:py-10">
          <div className="age-stars" aria-hidden="true">✦ ✧ ★ ✦</div>
          <span className="inline-flex rounded-full bg-white/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest backdrop-blur">Your next adventure</span>
          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">How old are you?</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm font-semibold text-white/90 sm:text-lg">Choose your age crew and we’ll find games made just for you!</p>
          <div className="age-float mx-auto mt-5 flex w-fit items-end justify-center">
            {kids.map((kid, index) => <img key={kid} src={kid} alt="" className={`h-20 w-20 object-contain drop-shadow-xl sm:h-28 sm:w-28 ${index === 1 ? "z-10 scale-110" : "opacity-90"}`} />)}
          </div>
        </section>

        <section className="relative -mt-1 pt-7">
          {loading ? (
            <div className="grid place-items-center rounded-3xl bg-white/90 py-20 shadow-sm">
              <span className="h-11 w-11 animate-spin rounded-full border-4 border-purple-100 border-t-purple-600" />
              <p className="mt-4 font-bold text-purple-700">Finding your adventures…</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-100 bg-white p-6 text-center font-semibold text-red-600 shadow-sm">{error}</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {groups.map((group, index) => {
                const theme = themes[index % themes.length];
                return (
                  <Link
                    key={group.id}
                    to={`/age-selection/little-explore?ageGroup=${group.id}`}
                    className={`age-card group relative isolate overflow-hidden rounded-[1.75rem] border-4 border-white p-4 shadow-[0_12px_30px_rgba(51,65,85,.12)] ${theme.pale}`}
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    <div className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${theme.gradient}`} />
                    <div className="flex items-center gap-4 md:flex-col md:text-center">
                      <div className={`relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-3xl bg-gradient-to-br ${theme.gradient} shadow-lg sm:h-28 sm:w-28`}>
                        <span className="absolute right-2 top-1 text-xl">{theme.emoji}</span>
                        <img src={group.image_url || kids[index % kids.length]} alt="" className="h-[90%] w-[90%] object-contain transition duration-300 group-hover:scale-110" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black uppercase tracking-wider text-slate-500">{theme.label}</p>
                        <h2 className="mt-1 text-xl font-black text-slate-900">Ages {group.min_age}–{group.max_age}</h2>
                        <p className="mt-1 font-bold text-purple-700">{group.name}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 sm:text-sm">{group.subtitle || group.description || "Fun games and exciting learning challenges!"}</p>
                      </div>
                      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-r ${theme.gradient} text-xl font-black text-white shadow-md transition group-hover:translate-x-1`} aria-hidden="true">→</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
        <p className="relative mt-7 text-center text-sm font-bold text-slate-500">✨ Every choice unlocks a world of fun! ✨</p>
      </main>
    </div>
  );
}
