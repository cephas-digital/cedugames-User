import AuthCard from "../../components/autoCard";
import Input from "../../components/input";
import Bt from "../../assets/bt.png";
import { Button } from "../../components/button";
import BB from "../../assets/Overlay.png";
import { Link } from "react-router-dom";

function ForgotPassword() {
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
          <h1 className="text-2xl sm:text-[32px] text-[#281B22] font-bold">
            Forgot Password
          </h1>

          <p className="text-gray-500 text-sm">
            Enter the email address linked to your account. We’ll send you a
            verification code to reset your password.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="e.g., alex@example.com"
          />

          <Link to="/verification">
            <Button text="Send verification code" />
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}

export default ForgotPassword;
