import PasswordInput from "../../components/passwordInput";
import Bt from "../../assets/bt.png";
import ResetIcon from "../../assets/resetIcon.png";
import AuthCard from "../../components/autoCard";
import HeaderText from "../../components/HeaderText";
import PasswordStrength from "../../components/passwordStrength";
import { Button } from "../../components/button";
import { Link } from "react-router-dom";

function ResetPassword() {
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
        <div className=" p-2 space-y-6 text-center">
          <div className="flex justify-center">
            <img
              src={ResetIcon}
              className=" w-20"
              alt="reset-icon"
            />
          </div>

          <div>
            <HeaderText>Reset Password</HeaderText>
            <p className="text-[#8E8E8E]  text-base mt-1">
              Create a strong and secure password for your account to keep your
              progress safe.
            </p>
          </div>

          <div className="text-left space-y-4">
            <div>
              <PasswordInput
                label="Create password"
                placeholder="Enter password"
              />
              <PasswordStrength />
            </div>

            <PasswordInput
              label="Confirm password"
              placeholder="Confirm password"
            />
          </div>

          <Button text="Reset Password" />

          <Link to="/login">
            <button className="text-purple-500 font-bold text-sm hover:underline">
              Back to login
            </button>
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}

export default ResetPassword;
