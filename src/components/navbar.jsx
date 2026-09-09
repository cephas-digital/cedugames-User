import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrandLogo } from "./Brand";
import { assetUrl, USER_KEY } from "../services/api";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem(USER_KEY) || "null"));
  useEffect(() => { const refresh = () => setUser(JSON.parse(localStorage.getItem(USER_KEY) || "null")); window.addEventListener("cedugames:profile-updated", refresh); return () => window.removeEventListener("cedugames:profile-updated", refresh); }, []);
  return (
    <div className="w-full flex justify-between items-center px-4 sm:px-10 py-3 sm:py-4 bg-white shadow-sm">
      <h1 className="text-xl font-bold text-purple-600 leading-tight">
        <BrandLogo className="w-28 sm:w-36" />
      </h1>

      <button type="button" onClick={() => navigate("/profile")} aria-label="Open your profile" className="h-11 w-11 overflow-hidden rounded-full border-2 border-purple-200 bg-purple-500 text-white shadow-sm transition hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-200">
        {user?.profile_image_url ? <img src={assetUrl(user.profile_image_url)} alt="" className="h-full w-full object-cover" /> : <span className="grid h-full w-full place-items-center text-lg" aria-hidden="true">👤</span>}
      </button>
    </div>
  );
}

export default Navbar;
