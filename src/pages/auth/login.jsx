import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthCard from "../../components/autoCard";
import Input from "../../components/input";
import HeaderText from "../../components/HeaderText";
import Bt from "../../assets/bt.png";
import BB from "../../assets/Background+Border.png";
import { apiRequest, saveSession } from "../../services/api";

function Login() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const data = await apiRequest("/auth/login", { method: "POST", body: JSON.stringify(form) });
      saveSession(data.token, data.user);
      navigate("/age-selection", { replace: true });
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen font-Nunito flex items-center justify-center bg-gray-100 p-4" style={{ backgroundImage: `url(${Bt})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <AuthCard><form onSubmit={submit}>
        <div className="text-center mb-6"><div className="flex justify-center"><img src={BB} className="w-20" alt="CeduGames" /></div><HeaderText>Welcome to CeduGames</HeaderText><p className="text-gray-500 text-sm">Cephas Educational Games</p></div>
        <div className="bg-purple-100 text-purple-600 text-sm rounded-lg px-4 py-3 mb-6">Let's get smart and have fun!</div>
        {state?.message && <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{state.message}</p>}
        {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">{error}</p>}
        <div className="flex flex-col gap-4">
          <Input label="Email" name="email" type="email" value={form.email} onChange={update} required placeholder="example@mail.com" />
          <Input label="Password" name="password" type="password" value={form.password} onChange={update} required placeholder="Your password" />
          <Link to="/forgot-password"><p className="text-right text-sm text-[#FFAF42] font-semibold">Forgot Password?</p></Link>
          <button disabled={loading} className="w-full rounded-xl bg-[#BF5AF2] px-4 py-3 font-bold text-white disabled:opacity-60">{loading ? "Signing in..." : "Login"}</button>
        </div>
        <Link to="/sign-up"><p className="text-center text-sm mt-6">Don't have an account? <span className="text-purple-600 ml-1">Signup</span></p></Link>
      </form></AuthCard>
    </div>
  );
}
export default Login;
