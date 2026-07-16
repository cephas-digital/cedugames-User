import { useLocation, useNavigate } from "react-router-dom";
import NavItem from "./NavItem";
import Badge from "./badge";
export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { label: "Home", to: "/age-selection/little-explore/math" },
    { label: "Leaderboard", to: "/leaderboard" },
    { label: "Shop", to: "/shop" },
    { label: "Profile", to: "/profile" },
  ];

  const isWhiteBackground =
    location.pathname === "/leaderboard" ||
    location.pathname === "/shop" ||
    location.pathname === "/profile" ||
    location.pathname === "/notifications";
  const textColor = isWhiteBackground ? "text-[#000000]" : "text-white";
  const bgClass = isWhiteBackground
    ? "bg-white"
    : "bg-gradient-to-r from-purple-300/70 to-purple-400/60 backdrop-blur-md";

  return (
    <div
      className={`w-full ${bgClass} px-4 sm:px-6 lg:px-8 py-3 shadow-xl flex flex-wrap lg:flex-nowrap items-center justify-between gap-3 rounded-none sm:rounded-xl`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-500 text-white">
          👤
        </div>

        <div>
          <p
            className={`${textColor} text-sm   font-medium flex items-center gap-1`}
          >
            Player 123
            <span className="text-xs">✔</span>
          </p>
          <p
            className={`text-xs ${isWhiteBackground ? "text-gray-600" : "text-white/70"}`}
          >
            Level 1
          </p>
        </div>
      </div>

      <nav className={`order-3 lg:order-none flex w-full lg:w-auto items-center justify-between sm:justify-center gap-2 sm:gap-8 lg:gap-10 border-t border-current/10 pt-3 lg:border-0 lg:pt-0 ${textColor} font-medium`}>
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            label={item.label}
            to={item.to}
            active={location.pathname === item.to}
            textColor={textColor}
            activeColor={textColor}
          />
        ))}
      </nav>

      <div className="flex items-center gap-2 sm:gap-4 [&>div:nth-child(1)]:hidden sm:[&>div:nth-child(1)]:flex [&>div:nth-child(2)]:hidden min-[480px]:[&>div:nth-child(2)]:flex">
        <Badge>❤️ ❤️ ❤️</Badge>

        <Badge>🪙 100</Badge>

        <div
          className={`w-10 h-10 flex items-center justify-center rounded-full ${isWhiteBackground ? "bg-gray-200" : "bg-white/20"} ${textColor} cursor-pointer`}
          onClick={() => navigate("/notification")}
        >
          🔔
        </div>

        <button className="hidden md:block px-5 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-md hover:opacity-90">
          Settings
        </button>
      </div>
    </div>
  );
}
