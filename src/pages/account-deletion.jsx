import { useState } from "react";
import { Link } from "react-router-dom";
import { BrandLogo } from "../components/Brand";
import { apiRequest } from "../services/api";

const initialForm = { email: "", username: "", reason: "" };

const AccountDeletion = () => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiRequest("/auth/account-deletion-requests", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setConfirmation(data);
      setForm(initialForm);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5ff] text-slate-800">
      <a href="#deletion-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:font-bold focus:text-purple-700 focus:shadow-lg">Skip to account deletion request</a>
      <header className="border-b border-purple-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link to="/" aria-label="CEDUGAMES home"><BrandLogo className="w-32 sm:w-40" /></Link>
          <Link to="/login" className="font-bold text-purple-700 underline underline-offset-4">Login</Link>
        </div>
      </header>

      <main id="deletion-content" className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,25rem)]">
          <section>
            <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.16em] text-purple-700">Privacy &amp; data</p>
            <h1 className="text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">Request account deletion</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Use this page to ask CEDUGAMES to delete your account and the personal data associated with it. You do not need to be logged in.</p>

            <div className="mt-8 space-y-5 rounded-3xl border border-purple-100 bg-white p-6 shadow-sm sm:p-8">
              <div><h2 className="text-xl font-extrabold text-slate-900">What will be deleted</h2><p className="mt-2 leading-7 text-slate-600">Your profile and login information, linked child profiles, learning progress, answers, achievements, preferences and other account data will be permanently deleted or anonymised.</p></div>
              <div><h2 className="text-xl font-extrabold text-slate-900">What may be retained</h2><p className="mt-2 leading-7 text-slate-600">Limited transaction, fraud-prevention, safety or audit records may be retained where required by law. Retained records are restricted and removed when the applicable retention period ends.</p></div>
              <div><h2 className="text-xl font-extrabold text-slate-900">What happens next</h2><ol className="mt-2 list-decimal space-y-2 pl-5 leading-7 text-slate-600"><li>Submit the email used for the account.</li><li>We may email you to verify ownership and protect the account.</li><li>After verification, we process the request and confirm completion by email.</li></ol></div>
              <p className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">Account deletion is permanent. You will lose access to purchased coins, progress and achievements.</p>
            </div>
          </section>

          <section aria-labelledby="request-form-title" className="h-fit rounded-3xl border border-purple-100 bg-white p-6 shadow-lg shadow-purple-100/60 sm:p-8 lg:sticky lg:top-6">
            <h2 id="request-form-title" className="text-2xl font-extrabold text-slate-900">Send your request</h2>
            {confirmation ? (
              <div className="mt-6" role="status" aria-live="polite">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-green-100 text-2xl text-green-700" aria-hidden="true">✓</div>
                <h3 className="mt-4 text-xl font-extrabold text-slate-900">Request received</h3>
                <p className="mt-2 leading-7 text-slate-600">{confirmation.message}</p>
                <p className="mt-4 break-all rounded-xl bg-slate-50 p-3 text-sm text-slate-600"><strong>Reference:</strong> {confirmation.requestId}</p>
                <button type="button" onClick={() => setConfirmation(null)} className="mt-5 font-bold text-purple-700 underline underline-offset-4">Submit another request</button>
              </div>
            ) : (
              <form className="mt-6 space-y-5" onSubmit={submit}>
                {error && <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700" role="alert">{error}</p>}
                <label className="block"><span className="mb-2 block font-bold text-slate-700">Account email <span className="text-red-600" aria-hidden="true">*</span></span><input className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-100" type="email" name="email" autoComplete="email" value={form.email} onChange={update} required maxLength={254} aria-required="true" /></label>
                <label className="block"><span className="mb-2 block font-bold text-slate-700">Username <span className="font-normal text-slate-500">(optional)</span></span><input className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-100" name="username" autoComplete="username" value={form.username} onChange={update} maxLength={80} /></label>
                <label className="block"><span className="mb-2 block font-bold text-slate-700">Reason <span className="font-normal text-slate-500">(optional)</span></span><textarea className="min-h-28 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-purple-600 focus:ring-4 focus:ring-purple-100" name="reason" value={form.reason} onChange={update} maxLength={1000} /></label>
                <button className="w-full rounded-xl bg-[#8b36c7] px-5 py-3.5 font-extrabold text-white shadow-sm transition hover:bg-[#7325ad] focus:outline-none focus:ring-4 focus:ring-purple-200 disabled:cursor-wait disabled:opacity-60" type="submit" disabled={loading}>{loading ? "Submitting request…" : "Request account deletion"}</button>
                <p className="text-xs leading-5 text-slate-500">We use these details only to locate the account, verify ownership and process this request. See our <Link className="font-bold text-purple-700 underline" to="/privacy-policy">Privacy Policy</Link>.</p>
              </form>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default AccountDeletion;
