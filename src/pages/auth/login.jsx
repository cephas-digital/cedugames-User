import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthCard from "../../components/autoCard";
import Input from "../../components/input";
import HeaderText from "../../components/HeaderText";
import Bt from "../../assets/bt.png";
import { BrandLogo } from "../../components/Brand";
import { apiRequest, saveSession } from "../../services/api";

function Login() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const data = await apiRequest("/auth/login", { method: "POST", body: JSON.stringify({ ...form, rememberMe }) });
      saveSession(data.token, data.user, rememberMe);
      navigate("/profiles", { replace: true });
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen font-Nunito flex items-center justify-center bg-gray-100 p-4" style={{ backgroundImage: `url(${Bt})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <AuthCard><form onSubmit={submit}>
        <div className="text-center mb-6"><div className="flex justify-center"><BrandLogo className="mb-5 w-48 sm:w-56" /></div><HeaderText>Welcome to Cedu</HeaderText><p className="text-gray-500 text-sm">Cephas Educational Games</p></div>
        <div className="bg-purple-100 text-purple-600 text-sm rounded-lg px-4 py-3 mb-6">Let's get smart and have fun!</div>
        {state?.message && <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{state.message}</p>}
        {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">{error}</p>}
        <div className="flex flex-col gap-4">
          <Input label="Email or phone number" name="identifier" value={form.identifier} onChange={update} required placeholder="you@example.com or 08012345678" />
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="password" className="text-sm text-gray-600">Password<span className="ml-1 text-red-500" aria-hidden="true">*</span></label>
            <div className="flex items-center rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] pr-3 focus-within:ring-2 focus-within:ring-purple-400">
              <input id="password" type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={update} required placeholder="Your password" autoComplete="current-password" className="min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 outline-none" />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="p-1 text-gray-500 hover:text-purple-600">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  {showPassword ? <><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 002.8 2.8" /><path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.3 4.3 9 7-.3 1.1-1.1 2.5-2.3 3.7M6.2 6.2C4.4 7.3 3.3 9.3 3 12c.7 2.7 4 7 9 7 1.1 0 2.1-.2 3-.6" /></> : <><path d="M2.5 12s3.4-7 9.5-7 9.5 7 9.5 7-3.4 7-9.5 7-9.5-7-9.5-7z" /><circle cx="12" cy="12" r="3" /></>}
                </svg>
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="flex cursor-pointer items-center gap-2 font-semibold text-gray-600">
              <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} className="h-4 w-4 accent-purple-600" />
              Remember Me
            </label>
            <Link to="/forgot-password" className="font-semibold text-[#FFAF42]">Forgot Password?</Link>
          </div>
          <button disabled={loading} className="w-full rounded-xl bg-[#BF5AF2] px-4 py-3 font-bold text-white disabled:opacity-60">{loading ? "Signing in..." : "Login"}</button>
        </div>
        <Link to="/sign-up"><p className="text-center text-sm mt-6">Don't have an account? <span className="text-purple-600 ml-1">Signup</span></p></Link>
      </form></AuthCard>
    </div>
  );
}
export default Login;
