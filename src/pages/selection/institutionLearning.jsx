import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../../components/navbar";
import PageLoader from "../../components/PageLoader";
import { apiRequest, assetUrl } from "../../services/api";
import {
  playClickSound,
  playCorrectSound,
  playGameEndSound,
  playWrongSound,
  startBackgroundMusic,
  stopBackgroundMusic,
} from "../../services/gameSounds";

export default function InstitutionLearning() {
  const { institutionId } = useParams();
  const [resource, setResource] = useState({ institutionId: null, data: null, error: "" });
  const [session, setSession] = useState(null);
  const [soundOn, setSoundOn] = useState(true);
  const [history, setHistory] = useState({ requestKey: "", attempts: [], pagination: { page: 1, limit: 10, total: 0 }, error: "" });
  const [historyPage, setHistoryPage] = useState(1);
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevelId, setSelectedLevelId] = useState("");
  const [startingArea, setStartingArea] = useState("");
  const [practiceError, setPracticeError] = useState("");
  useEffect(() => { setSelectedCategory(""); setSelectedLevelId(""); setPracticeError(""); }, [institutionId]);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    apiRequest(`/institutions/my-learning/${encodeURIComponent(institutionId)}`, { signal: controller.signal })
      .then(data => { if (active) setResource({ institutionId, data, error: "" }); })
      .catch(requestError => { if (active && requestError.name !== "AbortError") setResource({ institutionId, data: null, error: requestError.message }); });
    return () => { active = false; controller.abort(); };
  }, [institutionId]);
  const historyRequestKey = `${institutionId}:${historyPage}:${historyRefresh}`;
  useEffect(() => {
    const controller = new AbortController();
    apiRequest(`/institutions/my-learning/${encodeURIComponent(institutionId)}/history?page=${historyPage}&limit=10`, { signal: controller.signal })
      .then(response => setHistory({ requestKey: historyRequestKey, attempts: response.attempts || [], pagination: response.pagination || { page: historyPage, limit: 10, total: 0 }, error: "" }))
      .catch(requestError => { if (requestError.name !== "AbortError") setHistory({ requestKey: historyRequestKey, attempts: [], pagination: { page: historyPage, limit: 10, total: 0 }, error: requestError.message || "Your learning history could not be loaded." }); });
    return () => controller.abort();
  }, [institutionId, historyPage, historyRefresh, historyRequestKey]);
  const historyLoading = history.requestKey !== historyRequestKey;
  const historyError = historyLoading ? "" : history.error;
  const view = resource.institutionId === institutionId ? resource : { data: null, error: "", loading: true };
  const { data, error, loading = false } = view;
  const labels = data?.labels || { category: "Section", level: "Class", learner: "Learners", subject: "Learning areas" };
  const categoryNames = [...new Set((data?.levels || []).map(level => level.category || "Learning group"))];
  const levelsInCategory = (data?.levels || []).filter(level => (level.category || "Learning group") === selectedCategory);
  const selectedLevel = levelsInCategory.find(level => level.id === selectedLevelId);
  const learningAreas = selectedLevel ? (() => { const map = new Map((data.learningAreas || []).filter(area => area.levelId === selectedLevel.id).map(area => [area.name, Number(area.questionCount) || 0])); (selectedLevel.subjects || []).forEach(subject => { if (!map.has(subject)) map.set(subject, 0); }); if (!map.size) map.set("General", 0); return [...map.entries()]; })() : [];
  useEffect(() => {
    if (!loading && data && window.location.hash === "#learning-history") {
      window.requestAnimationFrame(() => document.getElementById("learning-history")?.scrollIntoView({ behavior: "smooth" }));
    }
  }, [loading, data]);

  const startPractice = async group => {
    const areaKey = `${group.levelId}:${group.title}`;
    if (!group.questionCount || startingArea) return;
    setStartingArea(areaKey); setPracticeError("");
    try {
      const response = await apiRequest(`/institutions/my-learning/${encodeURIComponent(institutionId)}/practice`, { method: "POST", body: JSON.stringify({ levelId: group.levelId, subject: group.title }) });
      const questions = response.questions || [];
      if (!questions.length) throw new Error("No published questions are available in this learning area yet.");
      if (soundOn) { playClickSound(); startBackgroundMusic(); }
      setSession({ ...group, questions, current: 0, correct: 0, phase: "starting", selected: null, attempt: null, remaining: 0, error: "" });
    } catch (requestError) { setPracticeError(requestError.message || "Practice could not be started. Please try again."); } finally { setStartingArea(""); }
  };
  const closeSession = () => { stopBackgroundMusic(); setSession(null); };
  const toggleSound = () => {
    setSoundOn(current => {
      const next = !current;
      if (next && session && session.phase !== "complete") startBackgroundMusic();
      else stopBackgroundMusic();
      return next;
    });
  };

  return <div className="min-h-screen bg-[#f6fbff]"><Navbar /><main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-7 sm:py-8 lg:px-10 lg:py-10">
    <Link to="/age-selection" className="inline-flex min-h-10 items-center text-sm font-bold text-purple-700">Back to learning worlds</Link>
    {loading ? <PageLoader message="Loading your institution learning..." cards={3} className="mt-6" />
      : error ? <div role="alert" className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-6 font-semibold text-red-700">{error}</div>
      : data && <>
        <header className="relative isolate mt-5 overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-700 via-purple-600 to-fuchsia-500 px-6 py-8 text-white shadow-[0_24px_60px_-30px_rgba(83,45,145,.55)] sm:px-10 sm:py-10 lg:mt-6 lg:flex lg:min-h-64 lg:items-center lg:justify-between lg:px-14 lg:py-12">
          <div className="pointer-events-none absolute -right-20 -top-28 -z-10 h-80 w-80 rounded-full border border-white/10 bg-white/5 shadow-[0_0_0_35px_rgba(255,255,255,.035),0_0_0_70px_rgba(255,255,255,.025)]" />
          <div className="relative max-w-3xl">
          <p className="text-xs font-black uppercase tracking-widest">CEDU-LEARN | YOUR INSTITUTION</p>
          <h1 className="mt-3 break-words text-3xl font-black leading-tight tracking-tight sm:text-5xl lg:text-[3.5rem]">{data.institution.name}</h1>
          <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-white/90 sm:text-base">Choose a learning area when you are ready. Your timer starts after you press Start practice.</p>
          {(data.institution.city || data.institution.state) && <p className="mt-3 break-words text-sm text-white/75">{[data.institution.city, data.institution.state].filter(Boolean).join(", ")}</p>}
          </div>
          <div className="mt-7 hidden shrink-0 items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 pr-6 shadow-lg backdrop-blur-sm lg:flex"><span className="grid h-14 w-14 place-items-center rounded-xl bg-white/15 text-3xl">&#10022;</span><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-white/65">Your workspace</p><strong className="mt-1 block text-sm">Learning at your pace</strong><span className="mt-1 block text-xs text-white/70">{data.levels.length} learning {data.levels.length === 1 ? "placement" : "placements"}</span></div></div>
        </header>
        {!data.levels.length ? <section className="mt-8 rounded-[2rem] border border-purple-100 bg-white p-8 text-center shadow-sm"><h2 className="text-xl font-black text-slate-900">Your learning plan is being prepared</h2><p className="mt-2 text-slate-500">Your institution has not published any learning groups yet.</p></section>
          : <section className="mt-7 overflow-hidden rounded-[2rem] border border-purple-100/80 bg-white shadow-[0_18px_55px_-38px_rgba(51,38,84,.38)] lg:mt-8">
            <div className="border-b border-slate-100 bg-gradient-to-r from-white via-white to-purple-50/80 p-5 sm:p-8 lg:px-10 lg:py-9">
              <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
                <div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-purple-600 sm:text-xs">Your learning path</p><h2 className="mt-1 text-xl font-black leading-tight tracking-tight text-slate-900 sm:text-2xl">Choose where to begin</h2><p className="mt-1 max-w-prose text-sm leading-6 text-slate-600">Pick {labels.category.toLowerCase()}, then {labels.level.toLowerCase()}, then {labels.subject.toLowerCase()}.</p></div>
                <span className="inline-flex max-w-full rounded-full bg-purple-100 px-3 py-1.5 text-xs font-black leading-5 text-purple-700">Up to {data.institution.questionsPerPlay || 10} questions per play · shuffled</span>
              </div>
              <div aria-label="Learning path steps" className="mt-4 flex w-full min-w-0 flex-nowrap items-center gap-1.5 overflow-x-auto pb-2 text-[11px] font-bold sm:mt-5 sm:flex-wrap sm:gap-2 sm:overflow-visible sm:pb-0 sm:text-xs">
                <span className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1.5 sm:px-3 ${!selectedCategory ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-700"}`}>1 &middot; {labels.category}</span><span className="shrink-0 text-slate-300">&gt;</span>
                <span className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1.5 sm:px-3 ${selectedCategory && !selectedLevel ? "bg-purple-600 text-white" : selectedLevel ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-400"}`}>2 &middot; {labels.level}</span><span className="shrink-0 text-slate-300">&gt;</span>
                <span className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1.5 sm:px-3 ${selectedLevel ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-400"}`}>3 &middot; {labels.subject}</span>
              </div>
            </div>
            <div className="p-5 sm:p-8 lg:px-10 lg:py-9">
              {!selectedCategory ? <>
                <div className="mb-4"><h3 className="text-lg font-black text-slate-900">Choose {labels.category.toLowerCase()}</h3><p className="mt-1 text-sm text-slate-500">Start with one of your institution's learning groups.</p></div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{categoryNames.map((category, index) => { const count = data.levels.filter(level => (level.category || "Learning group") === category).length; return <button key={category} type="button" onClick={() => { setSelectedCategory(category); setSelectedLevelId(""); }} className="group flex min-h-28 items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 text-left shadow-[0_4px_16px_-14px_rgba(25,32,52,.35)] transition duration-200 hover:-translate-y-1 hover:border-purple-200 hover:bg-purple-50/50 hover:shadow-[0_18px_35px_-24px_rgba(91,55,139,.42)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-100"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-purple-100 text-lg font-black text-purple-700">{String(index + 1).padStart(2, "0")}</span><span className="min-w-0 flex-1"><strong className="block break-words text-base font-black leading-snug text-slate-900">{category}</strong><small className="mt-1 block text-sm text-slate-500">{count} {structureLabel(labels.level, count)}</small></span><span className="text-xl font-bold text-purple-600 transition group-hover:translate-x-1">&rarr;</span></button>; })}</div>
              </> : !selectedLevel ? <>
                <button type="button" onClick={() => { setSelectedCategory(""); setSelectedLevelId(""); }} className="mb-4 text-sm font-bold text-purple-700 hover:text-purple-900">&larr; All {labels.category.toLowerCase()}</button>
                <div className="mb-4"><p className="text-xs font-black uppercase tracking-wide text-purple-600">{selectedCategory}</p><h3 className="mt-1 text-lg font-black text-slate-900">Choose {labels.level.toLowerCase()}</h3><p className="mt-1 text-sm text-slate-500">Select the placement you want to study.</p></div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{levelsInCategory.map(level => { const count = (data.learningAreas || []).filter(area => area.levelId === level.id).reduce((sum, area) => sum + (Number(area.questionCount) || 0), 0); return <button key={level.id} type="button" onClick={() => setSelectedLevelId(level.id)} className="group flex min-h-32 items-center gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 text-left shadow-[0_4px_16px_-14px_rgba(25,32,52,.35)] transition duration-200 hover:-translate-y-1 hover:border-purple-200 hover:bg-purple-50/50 hover:shadow-[0_18px_35px_-24px_rgba(91,55,139,.42)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-100"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-fuchsia-50 text-xl text-purple-700">&#10022;</span><span className="min-w-0 flex-1"><strong className="block break-words text-base font-black leading-snug text-slate-900">{level.name}</strong>{level.code && <small className="mt-0.5 block text-slate-500">{level.code}</small>}<small className="mt-1 block text-sm text-slate-500">{count} published question{count === 1 ? "" : "s"}</small></span><span className="text-xl font-bold text-purple-600 transition group-hover:translate-x-1">&rarr;</span></button>; })}</div>
              </> : <>
                <button type="button" onClick={() => setSelectedLevelId("")} className="mb-4 text-sm font-bold text-purple-700 hover:text-purple-900">&larr; {selectedCategory} <span className="mx-1 text-slate-300">/</span> {labels.level.toLowerCase()}</button>
                <div className="mb-4"><p className="text-xs font-black uppercase tracking-wide text-purple-600">{selectedCategory} <span className="mx-1 text-slate-300">/</span> {selectedLevel.name}</p><h3 className="mt-1 text-lg font-black text-slate-900">Choose {labels.subject.toLowerCase().replace(/s$/, "")}</h3><p className="mt-1 text-sm text-slate-500">Each play shuffles questions and includes up to {data.institution.questionsPerPlay || 10}.</p></div>
                {practiceError && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{practiceError}</p>}<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{learningAreas.map(([subject, questionCount], index) => <article key={subject} className="flex min-w-0 flex-col justify-between gap-5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_4px_16px_-14px_rgba(25,32,52,.35)] transition duration-200 hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-[0_18px_35px_-24px_rgba(91,55,139,.35)]"><div className="flex min-w-0 items-center gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-100 sm:h-11 sm:w-11 text-lg font-black text-purple-700">{String.fromCharCode(65 + index % 26)}</span><div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-wide text-purple-600">{labels.subject.replace(/s$/, "")}</p><h4 className="mt-0.5 truncate text-base font-black text-slate-900">{subject}</h4><p className="mt-1 text-xs text-slate-500">{questionCount ? `${Math.min(questionCount, data.institution.questionsPerPlay || 10)} per play · ${questionCount} available` : "No published questions yet"}</p></div></div><button type="button" disabled={!questionCount || Boolean(startingArea)} onClick={() => startPractice({ title: subject, levelName: selectedLevel.name, levelId: selectedLevel.id, questionCount })} className="min-h-11 w-full shrink-0 rounded-xl bg-purple-600 px-5 py-3 text-sm font-black sm:w-auto text-white shadow-md transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-slate-300">{startingArea === `${selectedLevel.id}:${subject}` ? "Starting..." : questionCount ? <>Start practice &rarr;</> : "Coming soon"}</button></article>)}</div>
              </>}
            </div>
          </section>}
        <section id="learning-history" className="mt-8 scroll-mt-6 rounded-[2rem] border border-purple-100/80 bg-white p-5 shadow-[0_18px_55px_-38px_rgba(51,38,84,.32)] sm:p-8 lg:mt-10 lg:px-10 lg:py-9">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wider text-purple-600">This institution</p><h2 className="mt-1 text-2xl font-black text-slate-900">Your learning history</h2><p className="mt-1 text-sm text-slate-500">Your completed practice from {data.institution.name}, for this player profile.</p></div><span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-700">{history.pagination.total} attempts</span></div>
          {historyLoading ? <p role="status" className="mt-5 rounded-xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">Loading your learning history...</p>
            : historyError ? <div className="mt-5 rounded-xl bg-red-50 p-5 text-sm font-semibold text-red-700"><p role="alert">{historyError}</p><button type="button" onClick={() => setHistoryRefresh(value => value + 1)} className="mt-3 rounded-lg bg-white px-4 py-2 font-black text-red-700">Try again</button></div>
            : history.attempts.length ? <>
              <div className="mt-4 divide-y divide-slate-100">{history.attempts.map(attempt => <article key={attempt.id} className="flex flex-wrap items-start justify-between gap-3 py-4"><div className="min-w-0 flex-1"><div className="rich-content font-bold leading-6 text-slate-900" dangerouslySetInnerHTML={{ __html: attempt.question || "Question no longer available" }} /><p className="mt-1 text-xs font-semibold text-slate-500">{[attempt.level, attempt.subject].filter(Boolean).join(" / ") || "Institution practice"} · {new Date(attempt.completedAt).toLocaleString()}</p>{attempt.selectedOption && <div className="rich-content mt-2 text-sm text-slate-600"><span className="font-semibold">Your answer: </span><span dangerouslySetInnerHTML={{ __html: attempt.selectedOption }} /></div>}</div><span className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${attempt.correct === true ? "bg-emerald-100 text-emerald-700" : attempt.timedOut ? "bg-amber-100 text-amber-700" : attempt.correct === false ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>{attempt.correct === true ? "Correct" : attempt.timedOut ? "Timed out" : attempt.correct === false ? "Incorrect" : "Completed"}</span></article>)}</div>
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-500"><span>Page {history.pagination.page} of {Math.max(1, Math.ceil(history.pagination.total / history.pagination.limit))}</span><div className="flex gap-2"><button type="button" disabled={historyPage <= 1} onClick={() => setHistoryPage(value => Math.max(1, value - 1))} className="rounded-lg border border-slate-200 px-3 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-40">Previous</button><button type="button" disabled={historyPage * history.pagination.limit >= history.pagination.total} onClick={() => setHistoryPage(value => value + 1)} className="rounded-lg border border-slate-200 px-3 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-40">Next</button></div></div>
            </> : <div className="mt-5 rounded-2xl border-2 border-dashed border-purple-100 p-8 text-center"><p className="font-bold text-slate-700">No completed practice yet</p><p className="mt-1 text-sm text-slate-500">Your completed questions from this institution will appear here.</p></div>}
        </section>
      </>}
  </main>
  {session && <InstitutionPractice session={session} setSession={setSession} soundOn={soundOn} onToggleSound={toggleSound} onClose={closeSession} onCompleted={() => { setHistoryPage(1); setHistoryRefresh(value => value + 1); }} institutionId={institutionId} />}
  </div>;
}

function InstitutionPractice({ session, setSession, soundOn, onToggleSound, onClose, onCompleted, institutionId }) {
  const currentQuestion = session.questions[session.current];
  const attemptKey = useRef("");
  const advanceTimer = useRef(null);
  const timeoutRequested = useRef(false);
  const answerRequested = useRef(false);
  const startRequested = useRef(false);
  const isMounted = useRef(true);
  const initialQuestionIndex = useRef(session.current);
  const base = `/institutions/my-learning/${encodeURIComponent(institutionId)}/questions/${encodeURIComponent(currentQuestion.id)}`;
  const patch = useCallback(values => setSession(current => current ? { ...current, ...values } : current), [setSession]);
  const startQuestionRef = useRef(null);
  const timeoutQuestionRef = useRef(null);
  const startQuestion = async questionIndex => {
    const question = session.questions[questionIndex];
    if (!question || startRequested.current) return;
    startRequested.current = true;
    answerRequested.current = false;
    timeoutRequested.current = false;
    patch({ current: questionIndex, phase: "starting", selected: null, attempt: null, remaining: 0, error: "", timedOut: false, lastCorrect: null });
    if (!attemptKey.current) attemptKey.current = window.crypto?.randomUUID?.() || makeUuid();
    const questionPath = `/institutions/my-learning/${encodeURIComponent(institutionId)}/questions/${encodeURIComponent(question.id)}`;
    try {
      const response = await apiRequest(`${questionPath}/start`, { method: "POST", body: JSON.stringify({ attemptKey: attemptKey.current }) });
      const expiresAt = new Date(response.attempt.expires_at).getTime();
      startRequested.current = false;
      if (!isMounted.current) return;
      patch({ attempt: { id: response.attempt.id, expiresAt }, remaining: Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)), phase: "playing" });
    } catch (requestError) { startRequested.current = false; if (isMounted.current) patch({ phase: "error", error: requestError.message || "This question could not be started." }); }
  };
  startQuestionRef.current = startQuestion;
  const finishPractice = correct => {
    stopBackgroundMusic();
    if (soundOn) playGameEndSound(correct >= Math.ceil(session.questions.length / 2));
    patch({ phase: "complete" });
    onCompleted();
  };
  const goNext = (next, correct = session.correct) => {
    if (next >= session.questions.length) { finishPractice(correct); return; }
    attemptKey.current = "";
    void startQuestion(next);
  };
  const showFeedback = (correct, selected) => {
    const nextCorrect = session.correct + (correct ? 1 : 0);
    patch({ phase: "feedback", selected, correct: nextCorrect, lastCorrect: correct, timedOut: false });
    advanceTimer.current = window.setTimeout(() => goNext(session.current + 1, nextCorrect), 1500);
  };
  const answer = async optionIndex => {
    if (session.phase !== "playing" || !session.attempt || answerRequested.current || timeoutRequested.current) return;
    answerRequested.current = true;
    if (soundOn) playClickSound();
    patch({ phase: "checking", selected: optionIndex, error: "" });
    try {
      const response = await apiRequest(`${base}/answer`, { method: "POST", body: JSON.stringify({ optionIndex, attemptId: session.attempt.id }) });
      if (!isMounted.current) return;
      if (!response.correct) await apiRequest(`${base}/finish`, { method: "POST", body: JSON.stringify({ attemptId: session.attempt.id }) });
      if (soundOn) response.correct ? playCorrectSound() : playWrongSound();
      showFeedback(Boolean(response.correct), optionIndex);
    } catch (requestError) {
      if (!isMounted.current) return;
      answerRequested.current = false;
      if (requestError.message?.toLowerCase().includes("time limit")) { await timeoutQuestion(); return; }
      patch({ phase: "playing", error: requestError.message || "Your answer could not be checked. Try again." });
    }
  };
  const timeoutQuestion = async () => {
    if (timeoutRequested.current || answerRequested.current || session.phase === "feedback" || session.phase === "complete") return;
    timeoutRequested.current = true;
    patch({ phase: "checking", error: "" });
    try {
      await apiRequest(`${base}/finish`, { method: "POST", body: JSON.stringify({ attemptId: session.attempt?.id, timedOut: true }) });
      if (!isMounted.current) return;
      if (soundOn) playWrongSound();
      patch({ phase: "feedback", selected: null, timedOut: true, lastCorrect: false });
      advanceTimer.current = window.setTimeout(() => goNext(session.current + 1, session.correct), 1500);
    } catch (requestError) { timeoutRequested.current = false; if (isMounted.current) patch({ phase: "error", error: requestError.message || "The timed question could not be completed." }); }
  };
  timeoutQuestionRef.current = timeoutQuestion;

  useEffect(() => { isMounted.current = true; void startQuestionRef.current?.(initialQuestionIndex.current); return () => { isMounted.current = false; window.clearTimeout(advanceTimer.current); }; // Start only once, after the learner presses Start practice.
  }, []);
  const attemptExpiresAt = session.attempt?.expiresAt;
  useEffect(() => {
    if (session.phase !== "playing" || !attemptExpiresAt) return undefined;
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((attemptExpiresAt - Date.now()) / 1000));
      patch({ remaining });
      if (!remaining) void timeoutQuestionRef.current?.();
    };
    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [session.phase, attemptExpiresAt, patch]);
  useEffect(() => () => { stopBackgroundMusic(); window.clearTimeout(advanceTimer.current); }, []);

  if (!currentQuestion) return null;
  const duration = Math.max(5, Math.min(600, Number(currentQuestion.timeLimitSeconds) || 30));
  const progress = session.phase === "complete" ? 100 : Math.round((session.current / session.questions.length) * 100);
  return <div className="fixed inset-0 z-[90] flex flex-col overflow-y-auto bg-[#11152d] px-3 py-4 text-white sm:px-6 sm:py-7" role="dialog" aria-modal="true" aria-label={`${session.title} practice`}>
    <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3"><div className="min-w-0"><p className="truncate text-xs font-black uppercase tracking-widest text-fuchsia-300">{session.levelName} · {session.title}</p><p className="mt-1 text-sm font-bold">{session.phase === "complete" ? "Practice complete" : `Question ${session.current + 1} of ${session.questions.length}`}</p></div><div className="flex shrink-0 gap-2"><button type="button" onClick={onToggleSound} className="min-h-11 rounded-xl border border-white/20 bg-white/10 px-3 text-sm font-bold" aria-pressed={soundOn}>{soundOn ? "🔊 Sound on" : "🔇 Sound off"}</button><button type="button" onClick={onClose} className="min-h-11 rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-bold">Exit</button></div></div>
    <div className="mx-auto mt-4 h-2 w-full max-w-3xl overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-fuchsia-400 transition-all" style={{ width: `${progress}%` }} /></div>
    {session.phase === "complete" ? <section className="mx-auto my-auto w-full max-w-xl rounded-3xl bg-white p-7 text-center text-slate-900 shadow-2xl sm:p-10"><div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-4xl text-emerald-700">{session.correct === session.questions.length ? "★" : "✓"}</div><p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-purple-600 sm:text-xs">Practice complete</p><h2 className="mt-2 text-3xl font-black">Nice work!</h2><p className="mt-3 text-slate-600">You answered {session.correct} of {session.questions.length} questions correctly.</p><button type="button" onClick={onClose} className="mt-7 rounded-xl bg-purple-600 px-6 py-3 font-black text-white">Back to learning areas</button></section>
      : <section className="mx-auto my-6 w-full max-w-4xl rounded-3xl bg-white p-4 text-slate-900 shadow-2xl sm:my-8 sm:p-7 lg:p-9">
        {session.phase === "starting" ? <div className="py-16 text-center font-bold text-slate-500">Starting your timed question…</div>
          : session.phase === "error" ? <div className="py-10 text-center"><p role="alert" className="font-bold text-red-700">{session.error}</p><button type="button" onClick={() => { if (session.attempt && session.remaining <= 0) void timeoutQuestion(); else void startQuestion(session.current); }} className="mt-5 rounded-xl bg-purple-600 px-5 py-3 font-black text-white">Try again</button></div>
          : <>
            <div className="flex items-center justify-between gap-3"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-purple-600 sm:text-xs">{currentQuestion.subject} · Question {session.current + 1}</p>{currentQuestion.readAloud && <button type="button" onClick={() => speakQuestion(currentQuestion)} className="rounded-xl border border-purple-200 px-3 py-2 text-xs font-bold text-purple-700">Read aloud</button>}</div>
            {session.phase !== "feedback" && <div className="mt-4 rounded-xl border border-purple-100 bg-purple-50 p-3"><div className="mb-2 flex justify-between text-xs font-black"><span>{session.remaining <= 0 ? "Time is up" : session.remaining <= Math.min(10, Math.ceil(duration / 4)) ? "Hurry up!" : "Time remaining"}</span><span className={session.remaining <= Math.min(10, Math.ceil(duration / 4)) ? "text-red-600" : "text-purple-700"}>{Math.floor(session.remaining / 60)}:{String(session.remaining % 60).padStart(2, "0")}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className={`h-full transition-[width] duration-300 ${session.remaining <= Math.min(10, Math.ceil(duration / 4)) ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${Math.max(0, session.remaining / duration * 100)}%` }} /></div></div>}
            <div className="rich-content mt-5 text-lg font-semibold leading-7 sm:text-xl" dangerouslySetInnerHTML={{ __html: currentQuestion.text || "" }} />
            {currentQuestion.shapeType && <Shape type={currentQuestion.shapeType} color={currentQuestion.shapeColor} />}
            {currentQuestion.mediaUrl && <Media url={currentQuestion.mediaUrl} type={currentQuestion.mediaType} />}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">{(currentQuestion.options || []).map((option, index) => <div key={index} className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${session.selected === index ? session.phase === "feedback" && session.lastCorrect ? "border-emerald-400 bg-emerald-50" : session.phase === "feedback" ? "border-red-300 bg-red-50" : "border-purple-400 bg-purple-50" : "border-slate-200 bg-white"}`}><button type="button" disabled={session.phase !== "playing"} onClick={() => void answer(index)} className="min-h-8 w-full text-left disabled:cursor-default"><span className="mr-2 font-black text-purple-700">{String.fromCharCode(65 + index)}.</span><span className="rich-content" dangerouslySetInnerHTML={{ __html: option.text || "" }} />{option.shapeType && <Shape type={option.shapeType} color={option.shapeColor} compact />}</button>{option.mediaUrl && <div className="mt-3"><Media url={option.mediaUrl} type={option.mediaType} /></div>}</div>)}</div>
            {session.phase === "checking" && <p role="status" className="mt-4 text-center text-sm font-bold text-slate-500">Checking your answer…</p>}
            {session.phase === "feedback" && <div role="status" aria-live="assertive" className={`mt-5 rounded-2xl p-4 text-center font-black ${session.timedOut ? "bg-amber-50 text-amber-700" : session.selected !== null && session.lastCorrect ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{session.timedOut ? "Time is up. Moving to the next question…" : session.selected !== null && session.lastCorrect ? "Correct answer!" : "Not quite. Moving to the next question…"}</div>}
            {session.error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{session.error}</p>}
          </>}
      </section>}
  </div>;
}

function structureLabel(label, count) {
  const value = String(label || "placement").trim();
  if (count === 1) {
    if (/ies$/i.test(value)) return value.slice(0, -3) + "y";
    if (/sses$/i.test(value)) return value.slice(0, -2);
    if (/ss$/i.test(value)) return value;
    return value.replace(/s$/i, "");
  }
  if (/ss$/i.test(value)) return value + "es";
  if (/s$/i.test(value)) return value;
  if (/y$/i.test(value)) return value.slice(0, -1) + "ies";
  return value + "s";
}
function makeUuid() { return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, char => { const random = Math.floor(Math.random() * 16); return (char === "x" ? random : (random & 3) | 8).toString(16); }); }
function plainText(html) { const element = document.createElement("div"); element.innerHTML = html || ""; return element.textContent || element.innerText || ""; }
function speakQuestion(question) { if (!window.speechSynthesis) return; const answers = (question.options || []).map((option, index) => `Option ${String.fromCharCode(65 + index)}: ${plainText(option.text)}`).join(". "); window.speechSynthesis.cancel(); const speech = new SpeechSynthesisUtterance(`${plainText(question.text)}. ${answers}`); speech.rate = 0.9; window.speechSynthesis.speak(speech); }
function Shape({ type, color = "#7442ae", compact = false }) { const clips = { circle: "circle(50%)", square: "none", rectangle: "none", triangle: "polygon(50% 0,100% 100%,0 100%)", star: "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 93%,50% 72%,21% 93%,32% 57%,2% 35%,39% 35%)", hexagon: "polygon(25% 7%,75% 7%,100% 50%,75% 93%,25% 93%,0 50%)" }; return <span role="img" aria-label={`${type} shape`} className="my-3 block" style={{ width: compact ? 38 : 60, height: compact ? 38 : 60, backgroundColor: color, clipPath: clips[type] || clips.circle, borderRadius: type === "circle" ? "50%" : 2 }} />; }
function Media({ url, type }) { const src = assetUrl(url); if (type === "image") return <img className="mt-4 max-h-72 rounded-xl object-contain" src={src} alt="Question or answer attachment" />; if (type === "audio") return <audio className="mt-4 w-full" controls src={src} />; if (type === "video") return <video className="mt-4 max-h-72 rounded-xl" controls src={src} />; return <a className="mt-3 inline-block font-bold text-purple-700 underline" href={src} target="_blank" rel="noreferrer">Open attached document</a>; }
