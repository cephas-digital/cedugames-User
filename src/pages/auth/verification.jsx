import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthCard from "../../components/autoCard";
import Bt from "../../assets/bt.png";
import Vc from "../../assets/VC.png";
import OTPInput from "../../components/otp-input";
import { apiRequest } from "../../services/api";

function VerifyCard() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const email = state?.email || "";
  const purpose = state?.purpose || "register";

  const verify = async () => {
    if (!email) return setError("Your verification session is missing. Please register again.");
    setLoading(true); setError("");
    try {
      const data = await apiRequest("/auth/verify-otp", { method: "POST", body: JSON.stringify({ email, otp: otp.join(""), purpose }) });
      if (purpose === "register") navigate("/login", { replace: true, state: { message: data.message } });
      else navigate("/reset-password", { state: { resetToken: data.resetToken } });
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  };

  const resend = async () => {
    setError("");
    try {
      const data = await apiRequest("/auth/resend-otp", { method: "POST", body: JSON.stringify({ email, purpose }) });
      setMessage(data.message);
    } catch (requestError) { setError(requestError.message); }
  };

  return (
    <div className="min-h-screen font-Nunito flex items-center justify-center bg-gray-100 p-4" style={{ backgroundImage: `url(${Bt})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <AuthCard><div className="text-center mb-6">
        <div className="flex justify-center mb-4"><img src={Vc} alt="Verification code" className="w-20" /></div>
        <h1 className="text-2xl sm:text-[32px] font-bold">Verify OTP</h1>
        <p className="text-gray-500 text-sm mt-2">Enter the 6-digit code sent to {email || "your email"}.</p>
        {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">{error}</p>}
        {message && <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}
        <OTPInput otp={otp} setOtp={setOtp} />
        <button onClick={verify} disabled={loading || otp.join("").length !== 6} className="mt-6 w-full rounded-xl bg-[#BF5AF2] px-4 py-3 font-bold text-white disabled:opacity-60">{loading ? "Verifying..." : "Verify code"}</button>
        <button onClick={resend} className="mt-4 text-sm text-purple-500">Resend code</button>
      </div></AuthCard>
    </div>
  );
}
export default VerifyCard;
