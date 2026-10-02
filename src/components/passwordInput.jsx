import { useState } from "react";

function PasswordInput({ id, label, name, placeholder, value, onChange, minLength = 8, autoComplete = "new-password" }) {
  const [show, setShow] = useState(false);
  const inputId = id || name || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="w-full space-y-2">
      <label htmlFor={inputId} className="text-sm text-gray-700">{label}<span className="ml-1 text-red-500" aria-hidden="true">*</span></label>

      <div className="flex items-center border w-full border-[#E2E8F0] bg-[#F8FAFC] rounded-2xl px-6 py-3 outline-none focus:ring-2 focus:ring-purple-400">
        <input
          id={inputId}
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          required
          minLength={minLength}
          maxLength={128}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="w-full  bg-transparent outline-none text-sm"
        />

        <button
          type="button"
          onClick={() => setShow((visible) => !visible)}
          aria-pressed={show}
          aria-label={show ? "Hide password" : "Show password"}
          className="text-gray-400 hover:text-purple-600"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            {show ? <><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 002.8 2.8" /><path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.3 4.3 9 7-.3 1.1-1.1 2.5-2.3 3.7M6.2 6.2C4.4 7.3 3.3 9.3 3 12c.7 2.7 4 7 9 7 1.1 0 2.1-.2 3-.6" /></> : <><path d="M2.5 12s3.4-7 9.5-7 9.5 7 9.5 7-3.4 7-9.5 7-9.5-7-9.5-7z" /><circle cx="12" cy="12" r="3" /></>}
          </svg>
        </button>
      </div>
    </div>
  );
}

export default PasswordInput;
