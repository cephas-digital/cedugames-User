export function Button({ text, type = "button", disabled = false }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className="w-full py-3 cursor-pointer rounded-full text-white font-medium 
      bg-gradient-to-r from-purple-500 to-purple-600 
      hover:opacity-90 transition disabled:cursor-not-allowed disabled:opacity-60"
    >
      {text}
    </button>
  );
}

export function GoogleButton() {
  return (
    <button className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-full py-3 hover:bg-gray-50 transition">
      <img
        src="https://cdn-icons-png.flaticon.com/512/281/281764.png"
        alt="google"
        className="w-5"
      />
      Continue with Google
    </button>
  );
}
