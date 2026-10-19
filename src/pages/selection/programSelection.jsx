import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/navbar";
import PageLoader from "../../components/PageLoader";
import { apiRequest, assetUrl } from "../../services/api";

export default function ProgramSelection() {
  const [items, setItems] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [availableGames, setAvailableGames] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [membershipLoading, setMembershipLoading] = useState(true);

  useEffect(() => {
    apiRequest("/catalog/programs")
      .then((data) => setItems(data.programs || []))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));

    apiRequest("/institutions/my-learning")
      .then((data) => { setMemberships(data.memberships || []); setAvailableGames(data.availableGames || []); })
      .catch(() => undefined)
      .finally(() => setMembershipLoading(false));
  }, []);

  const orderedItems = [...items].sort((a, b) => (a.program_type === "games" ? 0 : 1) - (b.program_type === "games" ? 0 : 1));

  return <div className="selection-page min-h-screen bg-[#fff9ef]"><Navbar /><main className="selection-page__content mx-auto max-w-6xl px-5 py-10">
    <section className="selection-hero rounded-[2rem] bg-gradient-to-br from-violet-600 to-fuchsia-500 p-10 text-center text-white shadow-xl"><p className="text-sm font-black uppercase tracking-widest">Choose your learning world</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">What would you like to explore?</h1></section>
    <Link to="/institutions" className="group mt-6 flex items-center justify-between gap-4 rounded-3xl border border-purple-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-400 hover:shadow-lg sm:p-6"><div><p className="text-xs font-black uppercase tracking-wider text-purple-600">Learning together</p><h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">Join an institution</h2><p className="mt-1 text-sm text-slate-500">Find your school or enter its invitation code to request access.</p></div><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-purple-600 text-xl font-black text-white transition group-hover:translate-x-1">→</span></Link>
    {!membershipLoading && memberships.length > 0 && <InstitutionMemberships memberships={memberships} availableGames={availableGames} />}
    {loading ? <PageLoader message="Opening your learning worlds..." cards={2} className="mt-8" /> : error ? <p className="mt-8 text-center text-red-600">{error}</p> : <div className="mt-8 grid gap-6 md:grid-cols-2">{orderedItems.map((item, index) => <Link key={item.id} to={item.program_type === "games" ? "/age-selection/games" : "/learn?program=" + item.id} style={{ animationDelay: (120 + index * 110) + "ms" }} className="selection-card group overflow-hidden rounded-3xl border-4 border-white bg-white shadow-lg"><img src={assetUrl(item.image_url)} alt="" className="selection-card__image h-56 w-full object-cover" /><div className="p-6"><span className="text-xs font-black uppercase tracking-wider text-purple-600">{item.tag}</span><h2 className="mt-1 text-3xl font-black">{item.title}</h2>{item.description && <p className="mt-2 text-slate-500">{item.description}</p>}<span className="selection-card__action mt-5 inline-block rounded-full bg-purple-600 px-5 py-2 font-bold text-white">Open →</span></div></Link>)}</div>}
  </main></div>;
}

function InstitutionMemberships({ memberships, availableGames }) {
  return <section className="mt-6 rounded-3xl border border-purple-100 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wider text-purple-600">Learning together</p><h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">Your institutions</h2><p className="mt-1 text-sm text-slate-500">Schools and learning centres connected to your account.</p></div><span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-700">{memberships.length} connected · {availableGames.length} games</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{memberships.map((membership) => <InstitutionMembership key={membership.id || membership.institution_id} membership={membership} />)}</div></section>;
}

function InstitutionMembership({ membership }) {
  const status = membership.status || "pending";
  const statusTone = status === "active" ? "bg-emerald-100 text-emerald-700" : status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";
  const location = [membership.city, membership.state].filter(Boolean).join(", ");
  return <article className="flex min-w-0 flex-wrap items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-purple-100 text-lg font-black text-purple-700">{membership.institution_name?.slice(0, 1).toUpperCase() || "I"}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="min-w-0 truncate text-base font-black text-slate-900">{membership.institution_name || "Institution"}</h3><span className={"rounded-full px-2.5 py-1 text-[10px] font-black capitalize " + statusTone}>{status}</span></div><p className="mt-1 text-sm font-semibold text-purple-700">{membership.institution_type || "Learning institution"}</p>{location && <p className="mt-1 truncate text-xs text-slate-500">{location}</p>}<p className="mt-3 text-[11px] text-slate-400">{status === "active" ? "Joined" : status === "rejected" ? "Request declined" : "Request awaiting approval"}</p></div>{status === "active" && <Link to={"/age-selection/games?institution=" + encodeURIComponent(membership.institution_id)} className="w-full rounded-xl bg-purple-600 px-3 py-2 text-center text-xs font-black text-white sm:w-auto">Play available games →</Link>}</article>;
}
