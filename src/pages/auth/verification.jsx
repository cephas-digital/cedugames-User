// components/VerifyCard.jsx

import { useState } from "react";
import AuthCard from "../../components/autoCard";
import Bt from "../../assets/bt.png";
import Vc from "../../assets/VC.png";
import { Link } from "react-router-dom";
import OTPInput from "../../components/otp-input";
import { Button } from "../../components/button";
function VerifyCard() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const handleVerify = () => {
    // API integration belongs here. Never log one-time passwords.
    return otp.join("");
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
        <div className=" text-center mb-6">
          <div className="flex justify-center mb-4">
            <img
              src={Vc}
              alt="Verification code"
              className=" w-20"
            />
          </div>
          <h1 className="text-2xl sm:text-[32px] font-bold">Verify OTP</h1>
          <p className="text-gray-500 text-sm mt-2">
            Enter the 6-digit code sent to your email to continue.
          </p>
          <button className="text-purple-500 text-sm mt-1 underline">
            Use a different email?
          </button>

          <OTPInput
            otp={otp}
            setOtp={setOtp}
          />

          <div className="mt-6">
            <Link to="/reset-password">
              <Button
                text="Verify Code"
                onClick={handleVerify}
              />
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            <span className="text-purple-500 cursor-pointer">Resend Code</span>
            (active after 30s)
          </p>
        </div>
      </AuthCard>
    </div>
  );
}

export default VerifyCard;
