import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/homeNavbar";
import { apiRequest, clearSession } from "../../services/api";

export default function ChangePassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    if (form.newPassword !== form.confirmPassword) return setError("New passwords do not match.");
    setBusy(true); setError("");
    try {
      await apiRequest("/auth/update-password", { method: "POST", body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword }) });
      clearSession();
      navigate("/login", { replace: true, state: { message: "Password updated successfully. Please sign in again." } });
    } catch (requestError) { setError(requestError.message); setBusy(false); }
  };
  return <div className="min-h-screen bg-slate-100"><Navbar/><main className="mx-auto max-w-lg p-4 sm:p-8"><form onSubmit={submit} className="rounded-3xl bg-white p-6 shadow-xl sm:p-8"><h1 className="text-2xl font-black text-slate-900">Change password</h1><p className="mt-1 text-sm text-slate-500">Use at least 10 characters for your new password.</p>{error&&<p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}{[["currentPassword","Current password",false],["newPassword","New password",true],["confirmPassword","Confirm new password",true]].map(([name,label,required])=><label key={name} className="mt-5 block text-sm font-bold text-slate-700">{label}<span className="ml-1 text-red-500">*</span><input required={required||true} minLength={name!=="currentPassword"?10:undefined} type="password" name={name} value={form[name]} onChange={update} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-purple-500"/></label>)}<div className="mt-7 flex gap-3"><button type="button" onClick={()=>navigate(-1)} className="flex-1 rounded-xl border px-4 py-3 font-bold">Cancel</button><button disabled={busy} className="flex-1 rounded-xl bg-purple-600 px-4 py-3 font-bold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-slate-300">{busy?"Updating...":"Update password"}</button></div></form></main></div>;
}
