import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/homeNavbar";
import { apiRequest } from "../../services/api";

export default function DailyReward() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const load = () => apiRequest("/daily-checkin/status").then((data) => setStatus(data.status)).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const claim = async () => {
    setClaiming(true); setError("");
    try {
      const data = await apiRequest("/daily-checkin/claim", { method: "POST" });
      setStatus(data.status); setMessage(data.message);
      window.dispatchEvent(new Event("cedugames:wallet-updated"));
    } catch (requestError) { setError(requestError.message); await load(); }
    finally { setClaiming(false); }
  };
  return <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-amber-50"><Navbar/>
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <button onClick={() => navigate(-1)} className="mb-5 rounded-xl border bg-white px-4 py-2 text-sm font-bold text-slate-600">← Back</button>
      {loading ? <div className="rounded-3xl bg-white py-24 text-center text-slate-400 shadow-sm">Loading your reward calendar…</div> :
      error && !status ? <div className="rounded-3xl bg-red-50 p-8 text-center font-bold text-red-700">{error}</div> :
      <section className="overflow-hidden rounded-[2rem] bg-white shadow-xl ring-1 ring-violet-100">
        <div className="bg-gradient-to-br from-violet-600 to-fuchsia-500 px-6 py-9 text-center text-white sm:px-10">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-white/20 text-5xl shadow-inner">🔥</div>
          <h1 className="mt-5 text-3xl font-black">{status.title}</h1>
          <p className="mx-auto mt-2 max-w-xl text-violet-100">{status.subtitle}</p>
          <div className="mt-5 inline-flex rounded-full bg-white/15 px-5 py-2 font-black">{status.currentStreak} day streak</div>
        </div>
        <div className="p-5 sm:p-8">
          {!status.isEnabled && <div className="mb-6 rounded-2xl bg-amber-50 p-4 text-center font-bold text-amber-800">Daily rewards are currently paused. Your history is safe.</div>}
          {message && <div className="mb-6 rounded-2xl bg-emerald-50 p-4 text-center font-bold text-emerald-700">{message}</div>}
          {error && <div className="mb-6 rounded-2xl bg-red-50 p-4 text-center font-bold text-red-700">{error}</div>}
          <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {status.rewards.map((reward, index) => {
              const active = status.checkedInToday ? index + 1 === status.currentCycleDay : index + 1 === status.nextCycleDay;
              const collected = status.checkedInToday && active;
              return <article key={reward.day} className={`relative rounded-2xl border-2 p-4 text-center transition ${active ? "border-violet-500 bg-violet-50 shadow-md" : "border-slate-100 bg-slate-50"}`}>
                {active && <span className="absolute -right-2 -top-2 rounded-full bg-violet-600 px-2 py-1 text-[10px] font-black text-white">{collected ? "CLAIMED" : "NEXT"}</span>}
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">Day {reward.day}</p>
                <p className="my-3 text-3xl">🪙</p>
                <p className="font-black text-slate-800">{Number(reward.coins).toLocaleString()}</p>
              </article>;
            })}
          </div>
          <button disabled={!status.isEnabled || status.checkedInToday || claiming} onClick={claim} className="mx-auto mt-8 block w-full max-w-sm rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-4 text-lg font-black text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100">
            {status.checkedInToday ? "Today's reward collected ✓" : claiming ? "Collecting…" : `Check in · Get ${status.nextReward} coins`}
          </button>
          <p className="mt-4 text-center text-xs text-slate-400">Miss {status.resetAfterMissedDays} {status.resetAfterMissedDays === 1 ? "day" : "days"} and your streak restarts. Rewards {status.repeatCycle ? "repeat after the final day." : "stay at the final-day amount."}</p>
        </div>
      </section>}
    </main>
  </div>;
}
