import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiRequest, assetUrl, cacheWallet, getActiveProfileId, isSignedIn, TOKEN_KEY } from "../services/api";
import PriorityAudio from "./PriorityAudio";

export default function PromotionalQuestionGate() {
  const location = useLocation();
  const [question, setQuestion] = useState(null);
  const [result, setResult] = useState(null);
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const checkedSessions = useRef(new Set());
  const inFlightSessions = useRef(new Set());
  const mounted = useRef(false);
  const promptSession = useRef(null);

  const sessionKey = useCallback(() => {
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || "";
    return token + ":" + (getActiveProfileId() || "");
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const loadQuestion = useCallback(async () => {
    if (!isSignedIn()) {
      promptSession.current = null;
      setQuestion(null);
      return;
    }

    const key = sessionKey();
    if (promptSession.current && promptSession.current !== key) {
      promptSession.current = null;
      setQuestion(null);
      setResult(null);
      setSelectedOptionId("");
    }
    if (!key || checkedSessions.current.has(key) || inFlightSessions.current.has(key)) return;
    inFlightSessions.current.add(key);
    try {
      const response = await apiRequest("/gameplay/popup-question");
      if (!mounted.current || sessionKey() !== key) return;
      checkedSessions.current.add(key);
      if (response.popupQuestion) {
        promptSession.current = key;
        setQuestion(response.popupQuestion);
        setResult(null);
        setSelectedOptionId("");
      } else {
        promptSession.current = null;
        setQuestion(null);
      }
    } catch {
      // Retry on the next route change, window focus, or profile switch.
    } finally {
      inFlightSessions.current.delete(key);
    }
  }, [sessionKey]);

  useEffect(() => {
    if (!question) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [question]);

  const close = () => {
    promptSession.current = null;
    setQuestion(null);
  };

  const submitAnswer = async () => {
    if (!question || !selectedOptionId || submitting || result) return;
    const requestSession = sessionKey();
    setSubmitting(true);
    try {
      const response = await apiRequest("/gameplay/popup-question/answer", {
        method: "POST",
        body: JSON.stringify({
          campaignId: question.campaignId,
          questionId: question.id,
          optionId: selectedOptionId,
        }),
      });
      if (!mounted.current || sessionKey() !== requestSession) return;
      setResult(response);
      if (response.coinBalance !== undefined) {
        cacheWallet({ coins_count: response.coinBalance });
        window.dispatchEvent(new Event("cedugames:wallet-updated"));
      }
    } catch (error) {
      if (sessionKey() === requestSession) window.alert(error.message || "Your answer could not be saved. Please try again.");
    } finally {
      if (sessionKey() === requestSession) setSubmitting(false);
    }
  };

  /*
   * These effects and handlers intentionally live above the conditional render
   * so profile changes cannot leave a prior player's question on screen.
   */
  useEffect(() => {
    loadQuestion();
    window.addEventListener("cedugames:profile-updated", loadQuestion);
    window.addEventListener("focus", loadQuestion);
    return () => {
      window.removeEventListener("cedugames:profile-updated", loadQuestion);
      window.removeEventListener("focus", loadQuestion);
    };
  }, [loadQuestion, location.pathname]);

  if (!question) return null;

  const renderMedia = (url, type, label) => {
    if (!url) return null;
    const source = assetUrl(url);
    if (type === "image") {
      return <img src={source} alt={label} className="mx-auto my-3 max-h-40 rounded-xl object-contain" />;
    }
    if (type === "audio") {
      return <PriorityAudio controls src={source} className="my-3 w-full" />;
    }
    if (type === "video") {
      return <PriorityAudio as="video" controls src={source} className="my-3 max-h-44 rounded-xl" />;
    }
    return <a href={source} target="_blank" rel="noreferrer" className="my-2 inline-block text-sm font-bold text-purple-700 underline">Open attachment</a>;
  };

  const correctAnswer = result && result.correctAnswer;
  const resultClass = "mt-4 rounded-xl p-4 text-sm " + (result && result.isCorrect ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800");
  const renderShape = (type, color) => {
    if (!type) return null;
    const clips = {
      circle: "circle(50%)",
      triangle: "polygon(50% 0,100% 100%,0 100%)",
      star: "polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 93%,50% 72%,21% 93%,32% 57%,2% 35%,39% 35%)",
      hexagon: "polygon(25% 7%,75% 7%,100% 50%,75% 93%,25% 93%,0 50%)",
    };
    return <span role="img" aria-label={type + " shape"} className="my-3 block h-14 w-14" style={{ backgroundColor: color || "#7442ae", clipPath: clips[type] || "none", borderRadius: type === "circle" ? "50%" : "0.25rem", width: type === "rectangle" ? "6rem" : undefined, height: type === "rectangle" ? "3.5rem" : undefined }} />;
  };

  return (
    <div className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto bg-slate-950/75 p-4 backdrop-blur-sm">
      <section role="dialog" aria-modal="true" aria-labelledby="promo-question-title" className="my-auto max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-3xl border border-amber-200 bg-white p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase text-amber-800">
              Promotional question - {Number(question.rewardCoins).toLocaleString()} coins
            </span>
            <h2 id="promo-question-title" className="mt-3 text-xl font-black text-slate-900">A quick question for you</h2>
          </div>
          <button type="button" onClick={close} aria-label="Close question" className="rounded-full px-3 py-1 text-2xl text-slate-500 hover:bg-slate-100">X</button>
        </div>

        <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-slate-900" dangerouslySetInnerHTML={{ __html: question.text || "" }} />
        {renderShape(question.shapeType, question.shapeColor)}
        {renderMedia(question.mediaUrl, question.mediaType, "Question attachment")}

        <div className="mt-4 grid gap-2">
          {question.options.map((option) => (
            <div key={option.id} className={"rounded-xl border p-3 " + (selectedOptionId === option.id ? "border-purple-500 bg-purple-50" : "border-slate-200")}>
              <button
                type="button"
                disabled={Boolean(result)}
                onClick={() => setSelectedOptionId(option.id)}
                className="w-full text-left text-sm font-semibold text-slate-800"
                aria-pressed={selectedOptionId === option.id}
                aria-label={`Select answer ${String.fromCharCode(65 + question.options.indexOf(option))}`}
              >
                <span dangerouslySetInnerHTML={{ __html: option.text || "" }} />
              </button>
              {renderShape(option.shapeType, option.shapeColor)}
              {renderMedia(option.mediaUrl, option.mediaType, "Answer attachment")}
              {!option.text && (
                <button type="button" disabled={Boolean(result)} onClick={() => setSelectedOptionId(option.id)} className="mt-2 rounded-lg bg-purple-100 px-3 py-2 text-xs font-bold text-purple-800">
                  Select this option
                </button>
              )}
            </div>
          ))}
        </div>

        {result && (
          <div aria-live="polite" className={resultClass}>
            <p className="font-black">{result.isCorrect ? "Correct! " + Number(result.rewardCoins).toLocaleString() + " coins added." : "That answer is incorrect."}</p>
            {!result.isCorrect && correctAnswer && (
              <div className="mt-2 font-semibold">
                <p>Correct answer:</p>
                <div dangerouslySetInnerHTML={{ __html: correctAnswer.text || "" }} />
                {renderShape(correctAnswer.shapeType, correctAnswer.shapeColor)}
                {renderMedia(correctAnswer.mediaUrl, correctAnswer.mediaType, "Correct answer attachment")}
              </div>
            )}
            {result.explanation && <p className="mt-2 font-medium">{result.explanation}</p>}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={close} className="rounded-xl px-4 py-3 text-sm font-bold text-slate-500">
            {result ? "Continue" : "Not now"}
          </button>
          {!result && (
            <button type="button" disabled={!selectedOptionId || submitting} onClick={submitAnswer} className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-black text-white disabled:opacity-50">
              {submitting ? "Submitting..." : "Submit answer"}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
