import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword } from "../../store/authSlice";
import { AppDispatch } from "../../store/store";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/White.png";
import { RootState } from "../../store/store";

const Forgot: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState<string>("");

  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error("Email field cannot be empty!");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address!");
      return;
    }

   await dispatch(resetPassword(email));
  

    if (!error) {
      toast.success("Password reset link sent! Check your email.");
      setTimeout(() => navigate("/"), 2000);
    } else if (error) {
      toast.error("Password Reset Failed! " + error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 animated-background">
      <div className="flex flex-row md:justify-evenly items-center w-full max-w-4xl">
         {/* Logo Section */}
      <div className="flex justify-center md:w-1/3">
        <img src={logo} alt="Logo" className="w-32 md:w-2/3" />
      </div>
        {/* Forgot Password Form */}
        <div className="w-full max-w-md p-6 space-y-6 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 rounded-3xl shadow-2xl">
          <h2 className="text-xl font-semibold text-white text-center">Reset Password</h2>
          <p className="text-gray-400 text-center">Enter your email to receive a reset link.</p>
          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-white">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              className="input-field"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {/* Submit Button */}
          <button
            className="btn-primary"
            onClick={handleForgotPassword}
            disabled={!email.trim() || loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
          {/* Back to Login */}
          <p className="text-center text-gray-400 mt-3">
            Remember your password?{" "}
            <span
              className="text-teal-400 cursor-pointer hover:underline"
              onClick={() => navigate("/")}
            >
              Log in
            </span>
          </p>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default Forgot;
