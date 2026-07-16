import AuthCard from "../../components/autoCard";
import Input from "../../components/input";
import HeaderText from "../../components/HeaderText";
import Bt from "../../assets/bt.png";
import { Button } from "../../components/button";
import BB from "../../assets/Background+Border.png";
import { Link } from "react-router-dom";

function Login() {
  return (
    <div
      className="min-h-screen font-Nunito flex items-center justify-center bg-gray-100 p-4"
      style={{
        backgroundImage: `url(${Bt})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <AuthCard>
        <div className="text-center mb-6">
          <div className=" flex justify-center items-center ">
            <img
              src={BB}
              className=" w-20"
              sss
              alt=""
            />
          </div>
          <HeaderText>Welcome to CeduGames</HeaderText>

          <p className="text-gray-500 text-sm">Cephas Educational Games</p>
        </div>

        <div className="bg-purple-100 text-purple-600 text-sm rounded-lg px-4 py-3 mb-6">
          ✨ Let's get smart and have fun!
        </div>

        <p className="text-center mb-6 text-gray-700">
          Let's get smart and have fun
        </p>

        <div className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="example@mail.com"
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="******"
          />
          <Link to="/forgot-password">
            <p className="text-right text-sm text-[#FFAF42] font-semibold cursor-pointer">
              Forgot Password?
            </p>
          </Link>

          <Link to="/age-selection">
            <Button text="Login" />
          </Link>
        </div>

        <Link to="/sign-up">
          <p className="text-center text-sm mt-6">
            Don’t have an account?
            <span className="text-purple-600 cursor-pointer ml-1">Signup</span>
          </p>
        </Link>
      </AuthCard>
    </div>
  );
}

export default Login;
