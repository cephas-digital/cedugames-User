function PasswordStrength({ password = "" }) {
  const acceptable = password.length >= 8 && password.length <= 128;
  const characterTypes = [/[a-z]/.test(password), /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  let score = 0;
  if (acceptable) {
    score = 1;
    if (password.length >= 10 && characterTypes >= 2) score = 2;
    if (password.length >= 12 && characterTypes >= 3) score = 3;
    if (password.length >= 14 && characterTypes === 4) score = 4;
  }
  const labels = ["Not acceptable", "Acceptable", "Fair", "Strong", "Very strong"];
  const colors = ["bg-slate-200", "bg-amber-500", "bg-yellow-500", "bg-lime-600", "bg-emerald-600"];
  const labelColor = acceptable ? score >= 3 ? "text-emerald-700" : score === 2 ? "text-yellow-700" : "text-amber-700" : "text-slate-500";

  return (
    <div className="mt-2" aria-live="polite">
      <div role="meter" aria-label="Password strength" aria-valuemin={0} aria-valuemax={4} aria-valuenow={score} aria-valuetext={password ? labels[score] : "No password entered"} className="grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((level) => <span key={level} className={`h-1.5 rounded-full ${score >= level ? colors[score] : "bg-slate-200"}`} />)}
      </div>
      <p className={`mt-1.5 text-xs font-semibold ${labelColor}`}>
        {password.length > 128 ? "Use no more than 128 characters." : password.length < 8 ? `Use at least ${8 - password.length} more character${8 - password.length === 1 ? "" : "s"}.` : `${labels[score]}. A mix of letters, numbers, and symbols makes it stronger.`}
      </p>
    </div>
  );
}

export default PasswordStrength;
