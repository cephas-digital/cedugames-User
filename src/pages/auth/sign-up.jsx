import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Bt from "../../assets/bt.png";
import Icon from "../../assets/Icon.png";
import Text from "../../components/text";
import Input from "../../components/input";
import { apiRequest } from "../../services/api";

const initialForm = { name: "", username: "", email: "", age: "", password: "", confirmPassword: "" };

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const data = await apiRequest("/auth/user/register", {
        method: "POST",
        body: JSON.stringify({ name: form.name, username: form.username, email: form.email, age: Number(form.age), password: form.password }),
      });
      if (data.requiresVerification) {
        navigate("/verification", { state: { email: form.email, purpose: "register" } });
      } else {
        navigate("/login", { replace: true, state: { message: data.message } });
      }
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen font-Nunito flex items-center justify-center bg-gray-100 p-4 sm:p-6" style={{ backgroundImage: `url(${Bt})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <div className="w-full max-w-5xl grid md:grid-cols-[minmax(0,25rem)_minmax(0,1fr)]">
        <div className="bg-[#BF5AF2] rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none w-full p-5 sm:p-8 grid justify-center items-center">
          <div><Text className="text-white font-medium" size="text-[32px]">Welcome to CeduGames</Text><Text className="text-white mb-4 font-light">Cephas Educational Games</Text><Text className="text-white font-light">Where learning meets play.</Text></div>
          <img src={Icon} className="w-40 mx-auto" alt="CeduGames" />
          <Text className="text-white mb-4 font-light">Join thousands of students learning through interactive challenges and fun adventures.</Text>
        </div>
        <div className="flex items-center rounded-b-2xl md:rounded-r-2xl md:rounded-bl-none justify-center bg-gray-50 p-5 sm:p-8 md:py-12">
          <form className="w-full max-w-md" onSubmit={submit}>
            <h2 className="text-2xl font-semibold mb-2">Create an account to get started</h2>
            <p className="text-gray-500 mb-6">Fill in your details to join the community.</p>
            {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <Input label="Full name" name="name" value={form.name} onChange={update} required placeholder="Jane Doe" />
              <Input label="Username" name="username" value={form.username} onChange={update} required placeholder="janedoe123" />
              <Input label="Email" name="email" type="email" value={form.email} onChange={update} required placeholder="example@mail.com" />
              <Input label="Age" name="age" type="number" min="1" max="130" value={form.age} onChange={update} required placeholder="10" />
              <Input label="Create password" name="password" type="password" value={form.password} onChange={update} required placeholder="At least 10 characters" />
              <Input label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={update} required placeholder="Repeat password" />
            </div>
            <button disabled={loading} className="w-full rounded-xl bg-[#BF5AF2] px-4 py-3 font-bold text-white disabled:opacity-60">{loading ? "Creating account..." : "Create account"}</button>
            <Link to="/login"><p className="text-center font-semibold text-sm mt-4">Already have an account? <span className="text-purple-600">Login</span></p></Link>
          </form>
        </div>
      </div>
    </div>
  );
};
export default Signup;
