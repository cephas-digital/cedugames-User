export default function Badge({ children }) {
  return (
    <div className="flex items-center gap-1 whitespace-nowrap rounded-full bg-white/20 px-2 py-1.5 text-xs text-white sm:px-4 sm:py-2 sm:text-sm">
      {children}
    </div>
  );
}
