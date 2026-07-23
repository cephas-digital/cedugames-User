import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../../components/navbar";
import fallback from "../../assets/math.png";
import kidOne from "../../assets/userone.png";
import kidTwo from "../../assets/usertwo.png";
import { apiRequest } from "../../services/api";

const themes = [
  { gradient: "from-violet-500 to-fuchsia-500", pale: "bg-violet-50", icon: "🔢", accent: "text-violet-700" },
  { gradient: "from-sky-400 to-cyan-500", pale: "bg-sky-50", icon: "🔬", accent: "text-sky-700" },
  { gradient: "from-amber-400 to-orange-500", pale: "bg-amber-50", icon: "📚", accent: "text-orange-700" },
  { gradient: "from-emerald-400 to-teal-500", pale: "bg-emerald-50", icon: "🌍", accent: "text-emerald-700" },
  { gradient: "from-pink-400 to-rose-500", pale: "bg-pink-50", icon: "🎨", accent: "text-pink-700" },
  { gradient: "from-indigo-400 to-blue-500", pale: "bg-indigo-50", icon: "💡", accent: "text-indigo-700" },
];

export default function Categories() {
  const [params] = useSearchParams();
  const ageId = params.get("ageGroup");
  const [items, setItems] = useState([]);
  const [ageGroup, setAgeGroup] = useState(null);
  const [loading, setLoading] = useState(Boolean(ageId));
  const [error, setError] = useState(ageId ? "" : "Select an age group first.");

  useEffect(() => {
    if (!ageId) return;
    Promise.all([
      apiRequest(`/catalog/age-groups/${ageId}/categories`),
      apiRequest("/catalog/age-groups"),
    ])
      .then(([categoryData, ageData]) => {
        setItems(categoryData.categories || []);
        setAgeGroup((ageData.ageGroups || []).find((group) => group.id === ageId) || null);
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [ageId]);

  return (
    <div className="subject-selection min-h-screen overflow-hidden bg-[#f6fbff]">
      <Navbar />
      <main className="relative mx-auto max-w-6xl px-4 pb-14 pt-5 sm:px-8 sm:pt-9">
        <span className="subject-bubble subject-bubble-one" />
        <span className="subject-bubble subject-bubble-two" />

        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-500 px-5 pb-7 pt-6 text-white shadow-[0_18px_45px_rgba(109,40,217,.28)] sm:px-10 sm:py-10">
          <div className="subject-doodles" aria-hidden="true">✏️ ⭐ 🧩 💡</div>
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex rounded-full bg-white/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest backdrop-blur">Choose your quest</span>
            <h1 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">What shall we learn today?</h1>
            <p className="mt-2 max-w-xl text-sm font-semibold text-white/90 sm:text-lg">Pick a subject, discover new skills, and collect stars as you play!</p>
          </div>
          <img src={kidOne} alt="" className="subject-hero-kid absolute -bottom-3 -right-4 hidden h-48 object-contain drop-shadow-2xl sm:block lg:right-12 lg:h-56" />
        </section>

        <div className="relative z-10 mx-auto -mt-4 flex max-w-2xl items-center justify-between gap-3 rounded-2xl border-4 border-white bg-white px-3 py-3 shadow-lg sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-purple-100 text-xl">🎯</span>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-wider text-purple-500">Your age crew</p>
              <p className="truncate text-sm font-black text-slate-900 sm:text-base">
                {ageGroup ? `Ages ${ageGroup.min_age}–${ageGroup.max_age}: ${ageGroup.name}` : "Loading your crew…"}
              </p>
            </div>
          </div>
          <Link to="/age-selection" className="shrink-0 rounded-xl bg-purple-100 px-3 py-2 text-xs font-black text-purple-700 transition hover:bg-purple-200 active:scale-95 sm:text-sm">Change</Link>
        </div>

        <section className="relative mt-8">
          <div className="mb-5 text-center">
            <p className="text-xs font-black uppercase tracking-[.2em] text-purple-500">Tap a subject to begin</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">Pick your favorite!</h2>
          </div>

          {loading ? (
            <div className="grid place-items-center rounded-3xl bg-white py-20 shadow-sm">
              <span className="h-11 w-11 animate-spin rounded-full border-4 border-purple-100 border-t-purple-600" />
              <p className="mt-4 font-bold text-purple-700">Packing your learning quests…</p>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-100 bg-white p-6 text-center font-semibold text-red-600 shadow-sm">{error}</div>
          ) : items.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, index) => {
                const theme = themes[index % themes.length];
                const levels = Number(item.level_count || 0);
                return (
                  <Link
                    key={item.id}
                    to={`/play?ageGroup=${ageId}&category=${item.id}`}
                    className={`subject-card group relative isolate overflow-hidden rounded-[1.75rem] border-4 border-white p-4 shadow-[0_12px_28px_rgba(51,65,85,.12)] ${theme.pale}`}
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <div className={`absolute inset-x-0 top-0 h-2 bg-gradient-to-r ${theme.gradient}`} />
                    <span className="absolute right-4 top-4 text-3xl transition duration-300 group-hover:rotate-12 group-hover:scale-125" aria-hidden="true">{theme.icon}</span>
                    <div className={`grid h-24 w-24 place-items-center overflow-hidden rounded-3xl bg-gradient-to-br ${theme.gradient} shadow-lg`}>
                      <img src={item.image_url || fallback} alt="" className="h-[82%] w-[82%] object-contain drop-shadow transition duration-300 group-hover:scale-110" />
                    </div>
                    <h3 className="mt-4 pr-10 text-xl font-black text-slate-900">{item.name}</h3>
                    <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-relaxed text-slate-500">{item.description || "Open this subject and start an exciting learning adventure."}</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className={`rounded-full bg-white px-3 py-1.5 text-xs font-black shadow-sm ${theme.accent}`}>⭐ {levels} {levels === 1 ? "level" : "levels"}</span>
                      <span className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-r ${theme.gradient} text-lg font-black text-white shadow-md transition group-hover:translate-x-1`}>→</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border-4 border-dashed border-purple-100 bg-white py-14 text-center">
              <img src={kidTwo} alt="" className="mx-auto h-28 object-contain" />
              <p className="mt-3 font-bold text-slate-500">New subjects are coming to this age crew soon!</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
