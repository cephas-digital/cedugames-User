import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/navbar";
import PageLoader from "../../components/PageLoader";
import { apiRequest, assetUrl } from "../../services/api";

export default function ProgramSelection() {
  const [items, setItems] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [membershipLoading, setMembershipLoading] = useState(true);

  useEffect(() => {
    apiRequest("/catalog/programs")
      .then((data) => setItems(data.programs || []))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));

    let active = true;
    const loadMemberships = () => apiRequest("/institutions/my-learning")
      .then((data) => { if (active) setMemberships(data.memberships || []); })
      .catch(() => undefined)
      .finally(() => { if (active) setMembershipLoading(false); });
    const refreshOnFocus = () => { if (document.visibilityState === "visible") loadMemberships(); };
    loadMemberships();
    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnFocus);
    return () => { active = false; window.removeEventListener("focus", refreshOnFocus); document.removeEventListener("visibilitychange", refreshOnFocus); };
  }, []);

  const orderedItems = [...items].sort(
    (a, b) =>
      (a.program_type === "games" ? 0 : 1) -
      (b.program_type === "games" ? 0 : 1),
  );

  return (
    <div className="selection-page min-h-screen bg-[#fff9ef]">
      <Navbar />
      <main className="selection-page__content mx-auto w-full max-w-6xl px-4 py-5 sm:px-5 sm:py-10">
        <section className="selection-hero rounded-[1.75rem] bg-gradient-to-br from-violet-600 to-fuchsia-500 p-6 text-center text-white shadow-xl sm:rounded-[2rem] sm:p-10">
          <p className="text-xs font-black uppercase tracking-widest sm:text-sm">Choose your learning world</p>
          <h1 className="mx-auto mt-3 max-w-md text-3xl font-black leading-tight sm:max-w-none sm:text-5xl">What would you like to explore?</h1>
        </section>

        {loading ? (
          <PageLoader message="Opening your learning worlds..." cards={2} className="mt-6" />
        ) : error ? (
          <p className="mt-6 text-center text-red-600">{error}</p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
            {orderedItems.map((item, index) => (
              <Link
                key={item.id}
                to={item.program_type === "games" ? "/age-selection/games" : "/learn?program=" + item.id}
                style={{ animationDelay: 120 + index * 110 + "ms" }}
                className="selection-card group overflow-hidden rounded-3xl border-4 border-white bg-white shadow-lg"
              >
                <img src={assetUrl(item.image_url)} alt="" className="selection-card__image h-44 w-full object-cover sm:h-56" />
                <div className="p-4 sm:p-6">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-600">{item.tag}</span>
                  <h2 className="mt-1 text-2xl font-black sm:text-3xl">{item.title}</h2>
                  {item.description && <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">{item.description}</p>}
                  <span className="selection-card__action mt-4 inline-block rounded-full bg-purple-600 px-5 py-2 font-bold text-white sm:mt-5">Open -&gt;</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <section className="mt-6">
          <Link to="/institutions" className="group flex items-center justify-between gap-3 rounded-3xl border border-purple-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-400 hover:shadow-lg sm:gap-4 sm:p-6">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-wider text-purple-600">Learning together</p>
              <h2 className="mt-1 text-lg font-black text-slate-900 sm:text-2xl">Join an institution</h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">Find your school or enter its invitation code to request access.</p>
            </div>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-purple-600 text-xl font-black text-white transition group-hover:translate-x-1 sm:h-12 sm:w-12">-&gt;</span>
          </Link>
          {!membershipLoading && memberships.length > 0 && <ProgramInstitutionMemberships memberships={memberships} onMembershipCanceled={(id) => setMemberships((current) => current.filter((membership) => membership.id !== id))} />}
        </section>
      </main>
    </div>
  );
}

function ProgramInstitutionMemberships({ memberships, onMembershipCanceled }) {
  const connectedCount = memberships.filter((membership) => membership.status === "active").length;
  return (
    <section className="mt-4 rounded-[1.75rem] border border-slate-200/80 bg-white p-4 shadow-sm sm:mt-6 sm:p-6">
      <header className="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-purple-600">Learning together</p>
          <h2 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">Your institutions</h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">Schools and learning centres connected to this player profile.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 ring-1 ring-inset ring-purple-100">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-500" aria-hidden="true" />
          {connectedCount} {connectedCount === 1 ? "institution" : "institutions"} connected
        </span>
      </header>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {memberships.map((membership) => <ProgramInstitutionMembership key={membership.id || membership.institution_id} membership={membership} onCanceled={onMembershipCanceled} />)}
      </div>
    </section>
  );
}

function ProgramInstitutionMembership({ membership, onCanceled }) {
  const [canceling, setCanceling] = useState(false);
  const status = membership.status || "pending";
  const statusTone = status === "active" ? "bg-emerald-100 text-emerald-700" : status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700";
  const location = [membership.city, membership.state, membership.country].filter(Boolean).join(", ");
  const cancel = async () => { if (canceling || !window.confirm("Cancel this pending institution request?")) return; setCanceling(true); try { await apiRequest(`/institutions/my-memberships/${membership.id}`, { method: "DELETE" }); onCanceled?.(membership.id); } catch (error) { window.alert(error.message); } finally { setCanceling(false); } };
  return (
    <article className="min-w-0 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 transition-colors hover:border-purple-200 hover:bg-white sm:p-5">
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-purple-100 text-base font-extrabold text-purple-700 ring-4 ring-white">
          {membership.institution_logo_url ? <img src={assetUrl(membership.institution_logo_url)} alt="" className="h-full w-full object-contain" /> : membership.institution_name?.slice(0, 1).toUpperCase() || "I"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-2">
            <h3 className="min-w-0 break-words text-[15px] font-extrabold leading-5 text-slate-900 sm:text-base">{membership.institution_name || "Institution"}</h3>
            <span className={"shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize " + statusTone}>{status}</span>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-purple-700">{membership.institution_type || "Learning institution"}</p>
          {location && <p className="mt-1.5 break-words text-xs leading-5 text-slate-500">{location}</p>}
          <p className="mt-3 text-[11px] font-medium text-slate-400">{status === "active" ? "Joined" : status === "rejected" ? "Request declined" : "Request awaiting approval"}</p>
        </div>
      </div>
      {membership.rejection_count > 0 && <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs leading-5 text-red-700">Previously rejected{membership.rejected_at ? ` on ${new Date(membership.rejected_at).toLocaleDateString()}` : ""}. {status === "pending" ? "Your new request is awaiting review." : "You can ask to join again."}</p>}
      {status === "active" && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Link to={"/institutions/" + encodeURIComponent(membership.institution_id) + "/learning"} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-purple-600 px-4 py-2.5 text-center text-xs font-bold text-white transition hover:bg-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600">Open institution learning</Link>
          <Link to={"/institutions/" + encodeURIComponent(membership.institution_id) + "/learning#learning-history"} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-center text-xs font-bold text-purple-700 transition hover:border-purple-300 hover:bg-purple-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600">View learning history</Link>
        </div>
      )}
      {status === "pending" && <button type="button" disabled={canceling} onClick={cancel} className="mt-4 min-h-10 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-red-200 hover:text-red-600 disabled:cursor-wait disabled:opacity-60">{canceling ? "Canceling..." : "Cancel request"}</button>}
      {status === "rejected" && <Link to="/institutions" className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-purple-700">Ask to join again</Link>}
    </article>
  );
}

/* Legacy implementation retained in history; the API-driven responsive implementation above is active.
function LegacyProgramSelection() {
  const [items, setItems] = useState([]);
  const [memberships, setMemberships] = useState([]);
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
  return <article className="flex min-w-0 flex-wrap items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-purple-100 text-lg font-black text-purple-700">{membership.institution_name?.slice(0, 1).toUpperCase() || "I"}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="min-w-0 truncate text-base font-black text-slate-900">{membership.institution_name || "Institution"}</h3><span className={"rounded-full px-2.5 py-1 text-[10px] font-black capitalize " + statusTone}>{status}</span></div><p className="mt-1 text-sm font-semibold text-purple-700">{membership.institution_type || "Learning institution"}</p>{location && <p className="mt-1 truncate text-xs text-slate-500">{location}</p>}<p className="mt-3 text-[11px] text-slate-400">{status === "active" ? "Joined" : status === "rejected" ? "Request declined" : "Request awaiting approval"}</p></div>{status === "active" && <Link to={"/institutions/" + encodeURIComponent(membership.institution_id) + "/learning"} className="w-full rounded-xl bg-purple-600 px-3 py-2 text-center text-xs font-black text-white sm:w-auto">Open institution learning →</Link>}</article>;
}
*/
