export default function Badge({ children, className = "" }) {
  return (
    <div className={`flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm ${className || "bg-white/20 text-white"}`}>
      {children}
    </div>
  );
}
