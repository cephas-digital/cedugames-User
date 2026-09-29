import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthCard from "../../components/autoCard";
import Input from "../../components/input";
import Bt from "../../assets/bt.png";
import { Button } from "../../components/button";
import { BrandLogo } from "../../components/Brand";
import { apiRequest } from "../../services/api";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const normalizedEmail = email.trim();
      await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: normalizedEmail }),
      });
      navigate("/verification", { state: { email: normalizedEmail, purpose: "password_reset" } });
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
        <div className="text-center mb-6">
          <div className=" flex justify-center items-center ">
            <BrandLogo className="mb-5 w-48 sm:w-56" />
          </div>
          <h1 className="text-2xl sm:text-[32px] text-[#281B22] font-bold">
            Forgot Password
          </h1>

          <p className="text-gray-500 text-sm">
            Enter the email address linked to your account. We’ll send you a
            verification code to reset your password.
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">{error}</p>}
          <Input
            label="Email"
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="e.g., alex@example.com"
          />

          <Button text={loading ? "Sending..." : "Send verification code"} type="submit" disabled={loading} />
        </form>
      </AuthCard>
    </div>
  );
}

export default ForgotPassword;
