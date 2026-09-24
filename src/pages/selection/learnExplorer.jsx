import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../../components/navbar";
import PageLoader from "../../components/PageLoader";
import EmptyState from "../../components/EmptyState";
import LearnLevelMap from "../../components/LearnLevelMap";
import { apiRequest, assetUrl } from "../../services/api";

const next = { section: "grade", grade: "subject", subject: "topic", topic: "level", level: "questions" };
const emptyCopy = {
  section: ["No grade sections yet", "Grade sections will appear here once they are published.", "🏫"],
  grade: ["No grades in this section yet", "The school is still preparing grades for this section.", "🎒"],
  subject: ["No subjects in this grade yet", "Subjects will appear here when your learning plan is ready.", "📚"],
  topic: ["No topics in this subject yet", "New topics are being prepared for this subject.", "💡"],
  level: ["No levels in this topic yet", "Practice levels will appear here when they are ready.", "🏆"],
  questions: ["No questions in this level yet", "Questions are still being prepared. Try another level for now.", "🧩"],
};

export default function LearnExplorer() {
  const [params] = useSearchParams();
  const program = params.get("program");
  const parent = params.get("parent");
  const type = params.get("type") || "section";

  return <ExplorerContent key={`${program || ""}:${parent || ""}:${type}`} program={program} parent={parent} type={type} />;
}

function ExplorerContent({ program, parent, type }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const path = type === "questions"
      ? `/catalog/learning-items/${parent}/questions`
      : `/catalog/learning-items?programId=${program}${parent ? `&parentId=${parent}` : ""}`;

    apiRequest(path, { signal: controller.signal })
      .then((data) => setRows(type === "questions" ? data.questions || [] : data.items || []))
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [program, parent, type]);

  const [emptyTitle, emptyMessage, emptyIcon] = emptyCopy[type] || emptyCopy.section;

  return <div className="selection-page min-h-screen bg-[#f6fbff]">
    <Navbar />
    <main className="selection-page__content mx-auto max-w-6xl px-5 py-10">
      <Link to={parent ? `/learn?program=${program}` : "/age-selection"} className="selection-back font-bold text-purple-700">← Back</Link>
      <header className="selection-hero mt-4 rounded-[2rem] bg-gradient-to-r from-indigo-600 to-fuchsia-500 p-8 text-white">
        <p className="text-xs font-black uppercase tracking-widest">CEDU-LEARN</p>
        <h1 className="mt-2 text-4xl font-black">{type === "questions" ? "Level Questions" : type === "level" ? "Choose a level" : `Choose a ${type}`}</h1>
      </header>

      {loading ? <PageLoader message={`Finding your ${type === "section" ? "classes" : `${type}s`}…`} cards={3} className="mt-8" />
        : error ? <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-6 text-center font-bold text-red-700">{error}</div>
        : !rows.length ? <EmptyState title={emptyTitle} message={emptyMessage} icon={emptyIcon} actionLabel={parent ? "Choose another path" : "Choose a learning world"} actionTo={parent ? `/learn?program=${program}` : "/age-selection"} />
        : type === "level" ? <LearnLevelMap levels={rows} programId={program} />
        : type === "questions" ? <div className="mt-8 space-y-5">{rows.map((question, index) => <article key={question.id} style={{ animationDelay: `${index * 70}ms` }} className="selection-card rounded-2xl bg-white p-6 shadow"><h2 className="text-lg font-black">{index + 1}. {question.text}</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{(question.options || []).map((option, optionIndex) => <div key={option.id || optionIndex} className="rounded-xl border bg-slate-50 p-4 font-semibold">{String.fromCharCode(65 + optionIndex)}. {option.text}</div>)}</div></article>)}</div>
        : <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{rows.map((item, index) => <Link key={item.id} style={{ animationDelay: `${index * 85}ms` }} to={`/learn?program=${program}&parent=${item.id}&type=${next[item.item_type]}`} className="selection-card group overflow-hidden rounded-3xl border-4 border-white bg-white shadow-lg"><img src={assetUrl(item.image_url)} alt="" className="selection-card__image h-44 w-full object-cover"/><div className="p-5"><span className="text-xs font-black uppercase text-purple-600">{item.tag}</span><h2 className="mt-1 text-2xl font-black">{item.title}</h2>{item.description && <p className="mt-2 line-clamp-2 text-sm text-slate-500">{item.description}</p>}<p className="selection-card__action mt-4 font-bold text-purple-700">Open →</p></div></Link>)}</div>}
    </main>
  </div>;
}
