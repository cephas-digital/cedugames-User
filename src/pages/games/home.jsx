import BG from "../../assets/Group 28.png";
import Navbar from "../../components/homeNavbar";
import { Navigate, useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full overflow-hidden flex flex-col text-white"
      style={{
        backgroundImage: `url(${BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Navbar />

      <div className="flex-1 flex flex-col justify-end items-center px-4 pt-20 sm:pt-40">
        <button
          onClick={() => navigate("/quiz")}
          className="text-white cursor-pointer shadow-xl w-full max-w-72 my-6 flex justify-center items-center bg-[#9B5DE5] hover:bg-[#8B4FD9] hover:shadow-2xl py-3 px-4 rounded-2xl transition-all duration-300"
        >
          Start game
        </button>
      </div>

      <div>
        <button onClick={() => navigate("/quiz")}></button>
      </div>
    </div>
  );
};
export default Home;
