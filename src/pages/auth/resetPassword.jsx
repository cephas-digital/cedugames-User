import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PasswordInput from "../../components/passwordInput";
import Bt from "../../assets/bt.png";
import { BrandLogo } from "../../components/Brand";
import AuthCard from "../../components/autoCard";
import HeaderText from "../../components/HeaderText";
import PasswordStrength from "../../components/passwordStrength";
import { Button } from "../../components/button";
import { apiRequest } from "../../services/api";

function ResetPassword() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const resetToken = state?.resetToken;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!resetToken) {
      setError("Your password reset session is missing or expired. Request a new verification code.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest("/auth/reset-password", {
        method: "POST",
        headers: { Authorization: `Bearer ${resetToken}` },
        body: JSON.stringify({ newPassword: password }),
      });
      navigate("/login", { replace: true, state: { message: data.message || "Password reset successful. You can now log in." } });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen font-Nunito flex items-center justify-center bg-gray-100 p-4"
      style={{
        backgroundImage: `url(${Bt})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <AuthCard>
        <div className=" p-2 space-y-6 text-center">
          <div className="flex justify-center">
            <BrandLogo className="mb-2 w-48 sm:w-56" />
          </div>

          <div>
            <HeaderText>Reset Password</HeaderText>
            <p className="text-[#8E8E8E]  text-base mt-1">
              Create a strong and secure password for your account to keep your
              progress safe.
            </p>
          </div>

          {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-left text-sm text-red-600" role="alert">{error}</p>}

          {!resetToken && <p className="text-sm text-gray-600">Start again to receive and verify a new reset code.</p>}

          <form onSubmit={submit} className="text-left space-y-4">
            <div>
              <PasswordInput
                id="new-password"
                name="newPassword"
                label="Create password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
              />
              <PasswordStrength password={password} />
            </div>

            <PasswordInput
              id="confirm-password"
              name="confirmPassword"
              label="Confirm password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter your password"
              autoComplete="new-password"
            />

            <Button text={loading ? "Resetting..." : "Reset Password"} type="submit" disabled={loading || !resetToken || password.length < 8 || password.length > 128 || password !== confirmPassword} />
          </form>

          {resetToken ? (
            <Link to="/login" className="inline-block text-purple-500 font-bold text-sm hover:underline">Back to login</Link>
          ) : (
            <Link to="/forgot-password" className="inline-block text-purple-500 font-bold text-sm hover:underline">Request a new code</Link>
          )}
        </div>
      </AuthCard>
    </div>
  );
}

export default ResetPassword;
