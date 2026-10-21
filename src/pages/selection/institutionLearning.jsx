import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../../components/navbar";
import PageLoader from "../../components/PageLoader";
import { apiRequest } from "../../services/api";

export default function InstitutionLearning() {
  const { institutionId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setData(null);
    setLoading(true);
    setError("");
    apiRequest(`/institutions/my-learning/${encodeURIComponent(institutionId)}`, { signal: controller.signal })
      .then(setData)
      .catch(requestError => { if (requestError.name !== "AbortError") setError(requestError.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [institutionId]);

  return <div className="min-h-screen bg-[#f6fbff]"><Navbar /><main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
    <Link to="/age-selection" className="font-bold text-purple-700">Back to learning worlds</Link>
    {loading ? <PageLoader message="Loading your institution learning..." cards={3} className="mt-6" />
      : error ? <div role="alert" className="mt-6 rounded-2xl border border-red-100 bg-red-50 p-6 font-semibold text-red-700">{error}</div>
      : data && <>
        <header className="mt-5 rounded-3xl bg-gradient-to-br from-indigo-600 to-fuchsia-500 p-6 text-white shadow-xl sm:p-10">
          <p className="text-xs font-black uppercase tracking-widest">CEDU-LEARN | YOUR INSTITUTION</p>
          <h1 className="mt-2 text-3xl font-black sm:text-5xl">{data.institution.name}</h1>
          <p className="mt-3 font-semibold text-white/85">Learning areas and published questions shared by your institution.</p>
          {(data.institution.city || data.institution.state) && <p className="mt-2 text-sm text-white/75">{[data.institution.city, data.institution.state].filter(Boolean).join(", ")}</p>}
        </header>
        {!data.levels.length ? <section className="mt-6 rounded-3xl border border-purple-100 bg-white p-8 text-center"><h2 className="text-xl font-black text-slate-900">Your learning plan is being prepared</h2><p className="mt-2 text-slate-500">Your institution has not published any learning groups yet.</p></section>
          : <div className="mt-6 space-y-5">{data.levels.map(level => {
            const questions = data.questions.filter(question => question.levelId === level.id);
            return <section key={level.id} className="rounded-3xl border border-purple-100 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wider text-purple-600">{level.category || "Learning group"}</p><h2 className="mt-1 text-2xl font-black text-slate-900">{level.name}</h2>{level.code && <p className="mt-1 text-sm text-slate-500">{level.code}</p>}</div><span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-700">{questions.length} published {questions.length === 1 ? "question" : "questions"}</span></div>
              {level.subjects.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{level.subjects.map(subject => <span key={subject} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{subject}</span>)}</div>}
              {questions.length ? <div className="mt-5 space-y-4">{questions.map((question, index) => <InstitutionQuestionCard key={question.id} question={question} index={index} institutionId={institutionId} />)}</div> : <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No published questions in this learning group yet.</p>}
            </section>;
          })}</div>}
      </>}
  </main></div>;
}

function InstitutionQuestionCard({ question, index, institutionId }) {
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const checkAnswer = async () => {
    if (selected === null || checking || result?.correct) return;
    setChecking(true);
    setError("");
    try {
      const response = await apiRequest(`/institutions/my-learning/${encodeURIComponent(institutionId)}/questions/${encodeURIComponent(question.id)}/answer`, { method: "POST", body: JSON.stringify({ optionIndex: selected }) });
      setResult(response);
    } catch (requestError) { setError(requestError.message); }
    finally { setChecking(false); }
  };
  const speak = () => {
    if (!question.readAloud || !window.speechSynthesis) return;
    const answerText = (question.options || []).map((option, optionIndex) => `${String.fromCharCode(65 + optionIndex)}. ${plainText(option.text)}`).join(". ");
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(`${plainText(question.text)}. ${answerText}`));
  };
  return <article className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-black uppercase tracking-wider text-purple-600">{question.subject} - Question {index + 1}</p>{question.readAloud && <button type="button" onClick={speak} className="rounded-lg border border-purple-200 bg-white px-3 py-2 text-xs font-bold text-purple-700">Read aloud</button>}</div>
    <div className="rich-content mt-3 font-semibold leading-7 text-slate-900" dangerouslySetInnerHTML={{ __html: question.text || "" }} />
    {question.shapeType && <QuestionShape type={question.shapeType} color={question.shapeColor} />}
    {question.mediaUrl && <QuestionMedia url={question.mediaUrl} type={question.mediaType} />}
    <div className="mt-4 grid gap-3 sm:grid-cols-2">{(question.options || []).map((option, optionIndex) => <div key={optionIndex} className={`rounded-xl border p-3 transition ${selected === optionIndex ? result?.correct ? "border-emerald-400 bg-emerald-50" : result?.correct === false ? "border-red-300 bg-red-50" : "border-purple-400 bg-purple-50" : "border-slate-200 bg-white"}`}><button type="button" onClick={() => { if (!result?.correct) { setSelected(optionIndex); setResult(null); setError(""); } }} disabled={Boolean(result?.correct)} aria-pressed={selected === optionIndex} className="w-full text-left"><span className="mr-2 font-black text-purple-700">{String.fromCharCode(65 + optionIndex)}.</span><span className="rich-content" dangerouslySetInnerHTML={{ __html: option.text || "" }} />{option.shapeType && <QuestionShape type={option.shapeType} color={option.shapeColor} compact />}</button>{option.mediaUrl && <QuestionMedia url={option.mediaUrl} type={option.mediaType} />}</div>)}</div>
    <div className="mt-4 flex flex-wrap items-center gap-3"><button type="button" onClick={checkAnswer} disabled={selected === null || checking || Boolean(result?.correct)} className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50">{checking ? "Checking..." : result?.correct ? "Correct" : "Check answer"}</button>{result?.correct === false && <span role="status" className="text-sm font-bold text-red-700">Not quite. Choose another answer and try again.</span>}{result?.correct && <span role="status" className="text-sm font-bold text-emerald-700">Correct answer!</span>}{error && <span role="alert" className="text-sm font-semibold text-red-700">{error}</span>}</div>
    {result?.correct && result.explanation && <div className="mt-4 rounded-xl bg-white p-4"><strong className="text-sm text-slate-900">Explanation</strong><p className="mt-1 text-sm leading-6 text-slate-600">{result.explanation}</p></div>}
  </article>;
}

function plainText(html) { const element = document.createElement("div"); element.innerHTML = html || ""; return element.textContent || element.innerText || ""; }
function QuestionShape({ type, color = "#7442ae", compact = false }) { const clips = { circle: "circle(50%)", square: "none", rectangle: "none", triangle: "polygon(50% 0,100% 100%,0 100%)", star: "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 93%,50% 72%,21% 93%,32% 57%,2% 35%,39% 35%)", hexagon: "polygon(25% 7%,75% 7%,100% 50%,75% 93%,25% 93%,0 50%)" }; return <span role="img" aria-label={`${type} shape`} className="my-3 block" style={{ width: compact ? 38 : 52, height: compact ? 38 : 52, backgroundColor: color, clipPath: clips[type] || clips.circle, borderRadius: type === "circle" ? "50%" : 2 }} />; }
function QuestionMedia({ url, type }) {
  if (type === "image") return <img className="mt-4 max-h-80 rounded-xl object-contain" src={url} alt="Question attachment" />;
  if (type === "audio") return <audio className="mt-4 w-full" controls src={url} />;
  if (type === "video") return <video className="mt-4 max-h-80 rounded-xl" controls src={url} />;
  return <a className="mt-3 inline-block font-bold text-purple-700 underline" href={url} target="_blank" rel="noreferrer">Open attached document</a>;
}
