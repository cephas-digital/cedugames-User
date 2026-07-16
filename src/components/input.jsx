function Input({ label, type = "text", placeholder, name, value, onChange, required, min, max }) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm text-gray-600">{label}</label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        max={max}
        placeholder={placeholder}
        className="border border-[#E2E8F0] bg-[#F8FAFC] rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-400"
      />
    </div>
  );
}

export default Input;
