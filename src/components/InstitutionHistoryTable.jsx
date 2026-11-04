import { useEffect, useRef, useState } from "react";
import PracticeReviewQuestion from "./PracticeReviewQuestion";

function scorePercent(play) {
  const total = Number(play.questionCount) || 0;
  return total ? Math.round((Number(play.correctCount || 0) / total) * 100) : 0;
}

export default function InstitutionHistoryTable({ plays, emptyMessage = "No completed practice yet" }) {
  const [selectedPlay, setSelectedPlay] = useState(null);
  if (!plays.length) {
    return <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
      <p className="font-bold text-slate-700">{emptyMessage}</p>
      <p className="mt-1 text-sm text-slate-500">Completed practice plays from this institution will appear here.</p>
    </div>;
  }

  return <div className="overflow-x-auto">
    <table className="w-full min-w-[680px] border-collapse text-left text-sm">
      <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
        <tr>
          <th scope="col" className="px-3 py-3">Completed</th>
          <th scope="col" className="px-3 py-3">Learning area</th>
          <th scope="col" className="px-3 py-3 text-center">Questions</th>
          <th scope="col" className="px-3 py-3">Score</th>
          <th scope="col" className="px-3 py-3">Review</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {plays.map((play) => {
          const total = Number(play.questionCount) || 0;
          const correct = Number(play.correctCount) || 0;
          const percent = scorePercent(play);
          return <tr key={play.id} className="align-top transition-colors hover:bg-slate-50/70">
            <td className="whitespace-nowrap px-3 py-3 text-xs font-medium leading-5 text-slate-600">{play.completedAt ? new Date(play.completedAt).toLocaleString() : "—"}</td>
            <td className="max-w-xs px-3 py-3">
              <p className="font-bold leading-5 text-slate-900">{play.level || "Institution practice"}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{play.subject || "Learning area"}</p>
            </td>
            <td className="px-3 py-3 text-center font-semibold tabular-nums text-slate-700">{total}</td>
            <td className="whitespace-nowrap px-3 py-3">
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{correct}/{total} correct</span>
              <span className="ml-2 text-xs font-semibold tabular-nums text-slate-500">{percent}%</span>
            </td>
            <td className="px-3 py-3">
              {play.attempts?.length ? <button type="button" onClick={() => setSelectedPlay(play)} aria-haspopup="dialog" className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-bold text-purple-700 outline-none transition hover:bg-purple-50 focus-visible:ring-2 focus-visible:ring-purple-300">
                Review answers <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] text-purple-700">{play.attempts.length}</span>
              </button> : <span className="text-xs text-slate-400">Unavailable</span>}
            </td>
          </tr>;
        })}
      </tbody>
    </table>
    {selectedPlay && <ReviewAnswersDialog play={selectedPlay} onClose={() => setSelectedPlay(null)} />}
  </div>;
}

function ReviewAnswersDialog({ play, onClose }) {
  const dialogRef = useRef(null);
  const total = Number(play.questionCount) || 0;
  const correct = Number(play.correctCount) || 0;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    dialog.showModal();
    return () => { if (dialog.open) dialog.close(); };
  }, [play.id]);

  return <dialog ref={dialogRef} onClose={onClose} aria-labelledby="history-review-title" className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/60">
    <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
      <header className="flex items-start justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-white to-purple-50/70 px-5 py-5 sm:px-7">
        <div className="min-w-0">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-purple-600">Practice review</p>
          <h2 id="history-review-title" className="mt-1 break-words text-lg font-extrabold leading-6 text-slate-900 sm:text-xl">{play.level || "Institution practice"}<span className="mx-1.5 text-slate-300">/</span>{play.subject || "Learning area"}</h2>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">{play.completedAt ? new Date(play.completedAt).toLocaleString() : "Completed practice"} <span className="mx-1 text-slate-300">·</span> {correct}/{total} correct ({scorePercent(play)}%)</p>
        </div>
        <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Close answer review" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-lg font-semibold text-slate-500 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300">×</button>
      </header>
      <div className="overflow-y-auto px-5 py-2 sm:px-7">
        {(play.attempts || []).map((attempt, index) => <PracticeReviewQuestion
          key={attempt.id}
          question={{ text: attempt.question, mediaUrl: attempt.questionMediaUrl, mediaType: attempt.questionMediaType, shapeType: attempt.questionShapeType, shapeColor: attempt.questionShapeColor, options: attempt.options || [] }}
          item={{ correct: attempt.correct, timedOut: attempt.timedOut, selectedOptionOrder: attempt.selectedOptionOrder, correctOptionOrder: attempt.correctOptionOrder, explanation: attempt.explanation }}
          questionNumber={index + 1}
        />)}
      </div>
      <footer className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-right sm:px-7">
        <button type="button" onClick={() => dialogRef.current?.close()} className="min-h-10 rounded-xl bg-purple-600 px-5 text-sm font-bold text-white transition hover:bg-purple-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600">Close review</button>
      </footer>
    </div>
  </dialog>;
}
