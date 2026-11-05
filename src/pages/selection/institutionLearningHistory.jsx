import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../../components/navbar";
import PageLoader from "../../components/PageLoader";
import InstitutionHistoryTable from "../../components/InstitutionHistoryTable";
import { apiRequest } from "../../services/api";

const PAGE_SIZE = 10;

export default function InstitutionLearningHistory() {
  const { institutionId } = useParams();
  const [institution, setInstitution] = useState(null);
  const [institutionError, setInstitutionError] = useState("");
  const [plays, setPlays] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0 });
  const [page, setPage] = useState(1);
  const [loadedRequestKey, setLoadedRequestKey] = useState("");
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    let controller;
    const loadInstitution = () => {
      controller?.abort();
      controller = new AbortController();
      apiRequest(`/institutions/my-learning/${encodeURIComponent(institutionId)}`, { signal: controller.signal })
        .then((data) => { if (active) { setInstitution(data.institution); setInstitutionError(""); } })
        .catch((requestError) => { if (active && requestError.name !== "AbortError") setInstitutionError(requestError.message || "Institution details could not be loaded."); });
    };
    const refreshOnFocus = () => { if (document.visibilityState === "visible") loadInstitution(); };
    loadInstitution();
    window.addEventListener("focus", refreshOnFocus);
    document.addEventListener("visibilitychange", refreshOnFocus);
    return () => { active = false; controller?.abort(); window.removeEventListener("focus", refreshOnFocus); document.removeEventListener("visibilitychange", refreshOnFocus); };
  }, [institutionId]);

  const historyRequestKey = `${institutionId}:${page}:${retry}`;
  useEffect(() => {
    const controller = new AbortController();
    apiRequest(`/institutions/my-learning/${encodeURIComponent(institutionId)}/history?page=${page}&limit=${PAGE_SIZE}`, { signal: controller.signal })
      .then((response) => {
        setPlays(response.plays || []);
        setPagination(response.pagination || { page, limit: PAGE_SIZE, total: 0 });
        setError("");
        setLoadedRequestKey(historyRequestKey);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Your learning history could not be loaded.");
          setLoadedRequestKey(historyRequestKey);
        }
      });
    return () => controller.abort();
  }, [institutionId, page, retry, historyRequestKey]);

  const loading = loadedRequestKey !== historyRequestKey;
  const totalPages = Math.max(1, Math.ceil(pagination.total / PAGE_SIZE));
  const firstItem = pagination.total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const lastItem = Math.min(page * PAGE_SIZE, pagination.total);

  return <div className="min-h-screen bg-[#f6fbff]"><Navbar /><main className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-7 sm:py-8 lg:px-10 lg:py-10">
    <Link to={`/institutions/${encodeURIComponent(institutionId)}/learning#learning-history`} className="inline-flex min-h-10 items-center gap-2 text-sm font-bold text-purple-700 transition hover:text-purple-900"><span aria-hidden="true">←</span> Back to institution learning</Link>
    <section className="mt-5 overflow-hidden rounded-[2rem] border border-purple-100/80 bg-white shadow-[0_18px_55px_-38px_rgba(51,38,84,.32)] sm:mt-7">
      <header className="relative isolate overflow-hidden border-b border-slate-100 bg-gradient-to-br from-white via-white to-violet-50/80 px-5 py-6 sm:px-8 sm:py-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-16 -z-10 h-48 w-48 rounded-full border border-purple-100/70 bg-purple-100/20 shadow-[0_0_0_20px_rgba(139,92,246,.025),0_0_0_42px_rgba(139,92,246,.02)]" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-purple-100 bg-white/85 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.13em] text-purple-700 shadow-sm">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" aria-hidden="true" />
              <span className="truncate">{institution?.name || "Institution"}</span>
            </p>
            <h1 className="mt-3 text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl">Learning history</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Completed practice plays for this player profile. History is kept for 30 days.</p>
          </div>
          <div className="flex shrink-0 items-center gap-3 self-start rounded-2xl border border-purple-100/80 bg-white/90 px-4 py-3 shadow-[0_8px_24px_-18px_rgba(91,55,139,.45)] sm:self-auto">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-700" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 011 1v13H4V6a1 1 0 011-1z" /><path d="m8 14 2.5 2.5L16 11" /></svg></span>
            <span><strong className="block text-lg font-extrabold leading-5 tabular-nums text-slate-900">{pagination.total}</strong><span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">{pagination.total === 1 ? "Completed play" : "Completed plays"}</span></span>
          </div>
        </div>
      </header>
      <div className="p-4 sm:p-7">
        {institutionError && !institution && <p role="alert" className="mb-4 rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800">{institutionError}</p>}
        {error ? <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-700"><p role="alert">{error}</p><button type="button" onClick={() => setRetry((value) => value + 1)} className="mt-3 rounded-lg bg-white px-4 py-2 font-bold text-red-700 shadow-sm">Try again</button></div>
          : loading ? <PageLoader message="Loading your learning history..." cards={2} />
            : <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold text-slate-700">All completed plays</p><p className="text-xs text-slate-500">Select <strong className="text-purple-700">Review answers</strong> to inspect a play.</p></div>
              <InstitutionHistoryTable plays={plays} />
              <footer className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-medium text-slate-500">Showing <span className="font-bold text-slate-700">{firstItem}–{lastItem}</span> of <span className="font-bold text-slate-700">{pagination.total}</span> plays</p>
                <nav aria-label="Learning history pages" className="flex items-center gap-2">
                  <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((value) => Math.max(1, value - 1))} className="min-h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:border-purple-200 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
                  <span className="min-w-20 text-center text-xs font-semibold tabular-nums text-slate-500">Page {page} of {totalPages}</span>
                  <button type="button" disabled={page >= totalPages || loading} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="min-h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:border-purple-200 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
                </nav>
              </footer>
            </>}
      </div>
    </section>
  </main></div>;
}
