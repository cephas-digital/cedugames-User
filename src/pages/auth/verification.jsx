import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthCard from "../../components/autoCard";
import Bt from "../../assets/bt-mobile.jpg";
import { BrandLogo } from "../../components/Brand";
import OTPInput from "../../components/otp-input";
import { apiRequest } from "../../services/api";

const VERIFICATION_SESSION_KEY = "cedugames_pending_verification";

function readVerificationSession() {
  try { return JSON.parse(window.sessionStorage.getItem(VERIFICATION_SESSION_KEY) || "null"); }
  catch { return null; }
}

function VerifyCard() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const pendingVerification = useMemo(() => state?.email ? state : readVerificationSession(), [state]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(() => pendingVerification?.initialError || "");
  const [message, setMessage] = useState(() => pendingVerification?.initialMessage || "");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [resendAvailableAt, setResendAvailableAt] = useState(() => Number(pendingVerification?.resendAvailableAt) || (Number(pendingVerification?.sentAt || 0) + 60_000));
  const resendCooldown = Math.max(0, Math.ceil((resendAvailableAt - now) / 1000));
  const email = pendingVerification?.email || "";
  const purpose = pendingVerification?.purpose || "register";

  useEffect(() => {
    if (!pendingVerification?.email) return;
    try { window.sessionStorage.setItem(VERIFICATION_SESSION_KEY, JSON.stringify(pendingVerification)); }
    catch { /* Keep OTP verification usable when browser storage is unavailable. */ }
  }, [pendingVerification]);

  useEffect(() => {
    if (!resendCooldown) return undefined;
    const timer = window.setTimeout(() => setNow(Date.now()), Math.min(1000, resendAvailableAt - now));
    return () => window.clearTimeout(timer);
  }, [resendCooldown, resendAvailableAt, now]);

  const verify = async () => {
    if (!email) return setError(purpose === "password_reset" ? "Your reset session is missing. Request a new code to continue." : "Your verification session is missing. Please register again.");
    setLoading(true); setError("");
    try {
      const data = await apiRequest("/auth/verify-otp", { method: "POST", body: JSON.stringify({ email, otp: otp.join(""), purpose }) });
      if (purpose === "register") {
        try { window.sessionStorage.removeItem(VERIFICATION_SESSION_KEY); } catch { /* The verified account remains usable if storage is unavailable. */ }
        navigate("/login", { replace: true, state: { message: data.message, returnTo: pendingVerification?.returnTo } });
      }
      else if (data.resetToken) {
        try { window.sessionStorage.setItem("cedu-password-reset-token", data.resetToken); } catch { /* Location state remains available for this navigation. */ }
        try { window.sessionStorage.removeItem(VERIFICATION_SESSION_KEY); } catch { /* Reset flow can continue from router state. */ }
        navigate("/reset-password", { replace: true, state: { resetToken: data.resetToken } });
      }
      else throw new Error("A password reset session could not be created. Please verify the code again.");
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  };

  const resend = async () => {
    if (!email) return setError("Your verification session is missing. Request a new code to continue.");
    setError(""); setMessage(""); setResending(true);
    try {
      const data = await apiRequest("/auth/resend-otp", { method: "POST", body: JSON.stringify({ email, purpose }) });
      setOtp(["", "", "", "", "", ""]);
      setMessage(data.message);
      const sentAt = Date.now();
      const nextResendAvailableAt = sentAt + (Number(data.resendAfterSeconds) || 60) * 1000;
      setNow(sentAt);
      setResendAvailableAt(nextResendAvailableAt);
      try { window.sessionStorage.setItem(VERIFICATION_SESSION_KEY, JSON.stringify({ ...pendingVerification, sentAt, resendAvailableAt: nextResendAvailableAt })); }
      catch { /* The backend still enforces the resend cooldown. */ }
    } catch (requestError) {
      setError(requestError.message);
      if (requestError.status === 429) {
        const retrySeconds = Math.max(1, Number(requestError.retryAfterSeconds) || 60);
        const nextResendAvailableAt = Date.now() + retrySeconds * 1000;
        setNow(Date.now());
        setResendAvailableAt(nextResendAvailableAt);
        try { window.sessionStorage.setItem(VERIFICATION_SESSION_KEY, JSON.stringify({ ...pendingVerification, resendAvailableAt: nextResendAvailableAt })); }
        catch { /* The backend remains authoritative if browser storage is unavailable. */ }
      }
    }
    finally { setResending(false); }
  };

  return (
    <div className="min-h-screen font-Nunito flex items-center justify-center bg-gray-100 p-4" style={{ backgroundImage: `url(${Bt})`, backgroundSize: "cover", backgroundPosition: "center" }}>
      <AuthCard><div className="text-center mb-6">
        <div className="flex justify-center mb-4"><BrandLogo className="w-48 sm:w-56" /></div>
        <h1 className="text-2xl sm:text-[32px] font-bold">Verify OTP</h1>
        <p className="text-gray-500 text-sm mt-2">Enter the six-digit code sent to {email || "your email"}. The code expires in 15 minutes.</p>
        {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">{error}</p>}
        {message && <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{message}</p>}
        <OTPInput otp={otp} setOtp={setOtp} />
        <button onClick={verify} disabled={loading || !email || otp.join("").length !== 6} className="mt-6 w-full rounded-xl bg-[#BF5AF2] px-4 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Verifying..." : "Verify code"}</button>
        <button onClick={resend} disabled={loading || resending || !email || resendCooldown > 0} className="mt-4 text-sm text-purple-500 disabled:cursor-not-allowed disabled:opacity-50">{resending ? "Sending..." : resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}</button>
        {!email && <Link to={purpose === "password_reset" ? "/forgot-password" : "/sign-up"} className="mt-4 inline-block text-sm font-bold text-purple-600">{purpose === "password_reset" ? "Request a new reset code" : "Create an account"}</Link>}
      </div></AuthCard>
    </div>
  );
}
export default VerifyCard;
