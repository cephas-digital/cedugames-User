import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/navbar";
import BackButton from "../../components/BackButton";
import PageLoader from "../../components/PageLoader";
import { apiRequest } from "../../services/api";

const locationLabel = (institution) => [institution.city, institution.state, institution.country].filter(Boolean).join(", ") || "Location not provided";

export default function JoinInstitution() {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("discover");
  const [code, setCode] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [result, setResult] = useState(null);
  const [joining, setJoining] = useState("");
  const [messages, setMessages] = useState({});

  useEffect(() => {
    apiRequest("/institutions/public").then((data) => setInstitutions(data.institutions || [])).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }, []);

  const requestToJoin = async (institution, inviteCode = "") => {
    setJoining(institution.id); setLookupError("");
    try {
      const data = await apiRequest(`/institutions/${institution.id}/join-requests`, { method: "POST", body: JSON.stringify(inviteCode ? { inviteCode } : {}) });
      setMessages((current) => ({ ...current, [institution.id]: data.message || "Join request sent." }));
    } catch (requestError) { setMessages((current) => ({ ...current, [institution.id]: requestError.message })); }
    finally { setJoining(""); }
  };

  const lookup = async (event) => {
    event.preventDefault(); setLookupError(""); setResult(null);
    const normalized = code.trim().toUpperCase();
    if (!normalized) return setLookupError("Enter an institution invite code.");
    setLookupLoading(true);
    try { const data = await apiRequest(`/institutions/code/${encodeURIComponent(normalized)}`); setResult(data.institution); }
    catch (requestError) { setLookupError(requestError.message); }
    finally { setLookupLoading(false); }
  };

  return <div className="min-h-screen bg-[#fff9ef]"><Navbar /><main className="mx-auto max-w-6xl px-5 py-8 sm:py-10"><BackButton fallback="/age-selection" className="font-bold text-purple-700" /><section className="mt-5 overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-700 via-purple-600 to-fuchsia-500 p-7 text-white shadow-xl sm:p-10"><p className="text-xs font-black uppercase tracking-[0.2em] text-white/80">Cedu community</p><h1 className="mt-3 text-3xl font-black sm:text-5xl">Join an institution</h1><p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/85 sm:text-base">Find your school or learning centre, or use the invitation code they gave you. Your request will be sent to the institution for approval.</p></section><div className="mt-6 grid gap-3 rounded-2xl bg-white p-2 shadow-sm sm:grid-cols-2"><button type="button" onClick={() => setMode("discover")} className={`rounded-xl px-4 py-3 text-sm font-black transition ${mode === "discover" ? "bg-purple-600 text-white" : "text-slate-500 hover:bg-purple-50"}`}>Browse public institutions</button><button type="button" onClick={() => setMode("code")} className={`rounded-xl px-4 py-3 text-sm font-black transition ${mode === "code" ? "bg-purple-600 text-white" : "text-slate-500 hover:bg-purple-50"}`}>Use an invitation code</button></div>{mode === "code" ? <section className="mt-6 rounded-3xl border border-purple-100 bg-white p-5 shadow-sm sm:p-7"><p className="text-xs font-black uppercase tracking-wider text-purple-600">Private or direct access</p><h2 className="mt-1 text-2xl font-black text-slate-900">Enter your institution code</h2><p className="mt-2 text-sm leading-6 text-slate-500">Your institution should share a code like <strong>CEDU-AB12CD34</strong>.</p><form onSubmit={lookup} className="mt-5 flex flex-col gap-3 sm:flex-row"><input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} className="min-h-12 flex-1 rounded-xl border border-slate-200 px-4 font-black tracking-widest outline-none focus:border-purple-500" placeholder="CEDU-AB12CD34" aria-label="Institution invite code" maxLength={13} /><button disabled={lookupLoading} className="min-h-12 rounded-xl bg-purple-600 px-6 font-black text-white hover:bg-purple-700 disabled:opacity-60">{lookupLoading ? "Checking..." : "Find institution"}</button></form>{lookupError && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700" role="alert">{lookupError}</p>}{result && <InstitutionCard institution={result} message={messages[result.id]} joining={joining === result.id} onJoin={() => requestToJoin(result, code.trim().toUpperCase())} />}</section> : <section className="mt-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wider text-purple-600">Discover and request access</p><h2 className="mt-1 text-2xl font-black text-slate-900">Public institutions</h2></div><span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-700">{institutions.length} available</span></div>{loading ? <PageLoader message="Finding public institutions..." cards={3} className="mt-5" /> : error ? <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-5 font-semibold text-red-700">{error}</div> : institutions.length ? <div className="mt-5 grid gap-4 md:grid-cols-2">{institutions.map((institution) => <InstitutionCard key={institution.id} institution={institution} message={messages[institution.id]} joining={joining === institution.id} onJoin={() => requestToJoin(institution)} />)}</div> : <div className="mt-5 rounded-3xl border-2 border-dashed border-purple-200 bg-white p-10 text-center"><p className="text-lg font-black text-slate-800">No public institutions yet</p><p className="mt-2 text-sm text-slate-500">Ask your school or learning centre for its invitation code.</p><button type="button" onClick={() => setMode("code")} className="mt-5 rounded-xl bg-purple-600 px-5 py-3 text-sm font-black text-white">Use an invitation code</button></div>}</section>}</main></div>;
}

function InstitutionCard({ institution, message, joining, onJoin }) {
  const success = message && !message.toLowerCase().includes("could not") && !message.toLowerCase().includes("already");
  return <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-5"><div className="flex items-start gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-purple-100 text-xl font-black text-purple-700">{institution.name?.slice(0, 1).toUpperCase()}</span><div className="min-w-0 flex-1"><h3 className="truncate text-lg font-black text-slate-900">{institution.name}</h3><p className="mt-1 text-sm font-semibold text-purple-700">{institution.institutionType || "Learning institution"}</p><p className="mt-1 text-xs text-slate-500">{locationLabel(institution)}</p></div></div>{message ? <p className={`mt-4 rounded-xl p-3 text-sm font-semibold ${success ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`} role="status">{message}</p> : <button type="button" disabled={joining} onClick={onJoin} className="mt-4 w-full rounded-xl bg-purple-600 px-4 py-3 text-sm font-black text-white transition hover:bg-purple-700 disabled:cursor-wait disabled:opacity-60">{joining ? "Sending request..." : "Ask to join"}</button>}</article>;
}
