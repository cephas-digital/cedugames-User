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
  useEffect(() => {
    if (!loading && data && window.location.hash === "#learning-history") {
      window.requestAnimationFrame(() => document.getElementById("learning-history")?.scrollIntoView({ behavior: "smooth" }));
    }
  }, [loading, data]);

  const startPractice = group => {
    if (!group.questions.length) return;
    if (soundOn) { playClickSound(); startBackgroundMusic(); }
    setSession({ ...group, current: 0, correct: 0, phase: "starting", selected: null, attempt: null, remaining: 0, error: "" });
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

  return <div className="min-h-screen bg-[#f6fbff]"><Navbar /><main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
    <Link to="/age-selection" className="font-bold text-purple-700">Back to learning worlds</Link>
    {loading ? <PageLoader message="Loading your institution learning..." cards={3} className="mt-6" />
      : error ? <div role="alert" className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-6 font-semibold text-red-700">{error}</div>
      : data && <>
        <header className="mt-5 rounded-3xl bg-gradient-to-br from-indigo-600 to-fuchsia-500 p-6 text-white shadow-xl sm:p-10">
          <p className="text-xs font-black uppercase tracking-widest">CEDU-LEARN | YOUR INSTITUTION</p>
          <h1 className="mt-2 text-3xl font-black sm:text-5xl">{data.institution.name}</h1>
          <p className="mt-3 font-semibold text-white/85">Choose a learning area when you are ready. Your timer starts after you press Start practice.</p>
          {(data.institution.city || data.institution.state) && <p className="mt-2 text-sm text-white/75">{[data.institution.city, data.institution.state].filter(Boolean).join(", ")}</p>}
        </header>
        {!data.levels.length ? <section className="mt-6 rounded-3xl border border-purple-100 bg-white p-8 text-center"><h2 className="text-xl font-black text-slate-900">Your learning plan is being prepared</h2><p className="mt-2 text-slate-500">Your institution has not published any learning groups yet.</p></section>
          : <div className="mt-6 space-y-5">{data.levels.map(level => {
            const levelQuestions = data.questions.filter(question => question.levelId === level.id);
            const bySubject = new Map();
            levelQuestions.forEach(question => {
              const name = question.subject || "General";
              if (!bySubject.has(name)) bySubject.set(name, []);
              bySubject.get(name).push(question);
            });
            (level.subjects || []).forEach(subject => { if (!bySubject.has(subject)) bySubject.set(subject, []); });
            if (!bySubject.size) bySubject.set("General", []);
            return <section key={level.id} className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wider text-purple-600">{level.category || "Learning group"}</p><h2 className="mt-1 text-2xl font-black text-slate-900">{level.name}</h2>{level.code && <p className="mt-1 text-sm text-slate-500">{level.code}</p>}</div><span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-700">{levelQuestions.length} published {levelQuestions.length === 1 ? "question" : "questions"}</span></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">{[...bySubject.entries()].map(([subject, questions]) => <article key={subject} className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center"><div><p className="text-xs font-black uppercase tracking-wide text-purple-600">Learning area</p><h3 className="mt-1 text-lg font-black text-slate-900">{subject}</h3><p className="mt-1 text-sm text-slate-500">{questions.length ? `${questions.length} question${questions.length === 1 ? "" : "s"} · timed practice` : "No published questions yet"}</p></div><button type="button" disabled={!questions.length} onClick={() => startPractice({ title: subject, levelName: level.name, questions })} className="shrink-0 rounded-xl bg-purple-600 px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-slate-300">{questions.length ? "Start practice →" : "Coming soon"}</button></article>)}</div>
            </section>;
          })}</div>}
        <section id="learning-history" className="mt-6 scroll-mt-6 rounded-3xl border border-purple-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wider text-purple-600">This institution</p><h2 className="mt-1 text-2xl font-black text-slate-900">Your learning history</h2><p className="mt-1 text-sm text-slate-500">Completed practice from {data.institution.name}, visible only to you.</p></div><span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-700">{history.pagination.total} attempts</span></div>
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
    {session.phase === "complete" ? <section className="mx-auto my-auto w-full max-w-xl rounded-3xl bg-white p-7 text-center text-slate-900 shadow-2xl sm:p-10"><div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-4xl text-emerald-700">{session.correct === session.questions.length ? "★" : "✓"}</div><p className="mt-5 text-xs font-black uppercase tracking-widest text-purple-600">Practice complete</p><h2 className="mt-2 text-3xl font-black">Nice work!</h2><p className="mt-3 text-slate-600">You answered {session.correct} of {session.questions.length} questions correctly.</p><button type="button" onClick={onClose} className="mt-7 rounded-xl bg-purple-600 px-6 py-3 font-black text-white">Back to learning areas</button></section>
      : <section className="mx-auto my-6 w-full max-w-3xl rounded-3xl bg-white p-4 text-slate-900 shadow-2xl sm:my-8 sm:p-7">
        {session.phase === "starting" ? <div className="py-16 text-center font-bold text-slate-500">Starting your timed question…</div>
          : session.phase === "error" ? <div className="py-10 text-center"><p role="alert" className="font-bold text-red-700">{session.error}</p><button type="button" onClick={() => { if (session.attempt && session.remaining <= 0) void timeoutQuestion(); else void startQuestion(session.current); }} className="mt-5 rounded-xl bg-purple-600 px-5 py-3 font-black text-white">Try again</button></div>
          : <>
            <div className="flex items-center justify-between gap-3"><p className="text-xs font-black uppercase tracking-widest text-purple-600">{currentQuestion.subject} · Question {session.current + 1}</p>{currentQuestion.readAloud && <button type="button" onClick={() => speakQuestion(currentQuestion)} className="rounded-xl border border-purple-200 px-3 py-2 text-xs font-bold text-purple-700">Read aloud</button>}</div>
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

function makeUuid() { return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, char => { const random = Math.floor(Math.random() * 16); return (char === "x" ? random : (random & 3) | 8).toString(16); }); }
function plainText(html) { const element = document.createElement("div"); element.innerHTML = html || ""; return element.textContent || element.innerText || ""; }
function speakQuestion(question) { if (!window.speechSynthesis) return; const answers = (question.options || []).map((option, index) => `Option ${String.fromCharCode(65 + index)}: ${plainText(option.text)}`).join(". "); window.speechSynthesis.cancel(); const speech = new SpeechSynthesisUtterance(`${plainText(question.text)}. ${answers}`); speech.rate = 0.9; window.speechSynthesis.speak(speech); }
function Shape({ type, color = "#7442ae", compact = false }) { const clips = { circle: "circle(50%)", square: "none", rectangle: "none", triangle: "polygon(50% 0,100% 100%,0 100%)", star: "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 93%,50% 72%,21% 93%,32% 57%,2% 35%,39% 35%)", hexagon: "polygon(25% 7%,75% 7%,100% 50%,75% 93%,25% 93%,0 50%)" }; return <span role="img" aria-label={`${type} shape`} className="my-3 block" style={{ width: compact ? 38 : 60, height: compact ? 38 : 60, backgroundColor: color, clipPath: clips[type] || clips.circle, borderRadius: type === "circle" ? "50%" : 2 }} />; }
function Media({ url, type }) { const src = assetUrl(url); if (type === "image") return <img className="mt-4 max-h-72 rounded-xl object-contain" src={src} alt="Question or answer attachment" />; if (type === "audio") return <audio className="mt-4 w-full" controls src={src} />; if (type === "video") return <video className="mt-4 max-h-72 rounded-xl" controls src={src} />; return <a className="mt-3 inline-block font-bold text-purple-700 underline" href={src} target="_blank" rel="noreferrer">Open attached document</a>; }
