// components/OTPInput.jsx

import { useRef } from "react";

function OTPInput({ otp, setOtp }) {
  const inputs = useRef([]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handlePaste = (event, index) => {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    event.preventDefault();
    const next = [...otp];
    digits.split("").forEach((digit, offset) => { if (index + offset < 6) next[index + offset] = digit; });
    setOtp(next);
    inputs.current[Math.min(index + digits.length, 5)]?.focus();
  };

  return (
    <div className="grid grid-cols-6 gap-1.5 sm:gap-3 mt-6">
      {otp.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputs.current[index] = el)}
          value={digit}
          maxLength={1}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          aria-label={`Verification code digit ${index + 1}`}
          onChange={(e) => handleChange(e.target.value, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={(event) => handlePaste(event, index)}
          className="w-full min-w-0 h-11 sm:h-12 text-center text-lg rounded-lg
          bg-gray-100 focus:outline-none focus:ring-2
          focus:ring-purple-400"
        />
      ))}
    </div>
  );
}

export default OTPInput;
