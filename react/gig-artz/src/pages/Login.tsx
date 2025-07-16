import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectAuthUser,
  selectAuthError,
  selectAuthLoading,
  resetError,
  loginUser,
  socialLogin,
} from "../../store/authSlice";
import { setToken } from "../../store/notificationSlice";
import { FaFacebook, FaGoogle, FaSpinner } from "react-icons/fa";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import logo from "../assets/White.png";
import { AppDispatch } from "../../store/store";
import { requestNotificationPermission } from "../helpers/requestNotificationPermission";

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector(selectAuthUser);
  const error = useSelector(selectAuthError);
  const loading = useSelector(selectAuthLoading);

  const [formData, setFormData] = useState({ emailAddress: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.emailAddress || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    // Ensure both are strings and call loginUser with string args
    dispatch(
      loginUser(
        String(formData.emailAddress),
        String(formData.password),
        rememberMe
      )
    );
  };

  useEffect(() => {
    if (user) {
      toast.success("Login Successful! Welcome back!");
      // Request notification permission and save token to Redux and backend
      const getTokenAndSave = async () => {
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
          console.warn("VAPID key is missing in environment variables.");
          return;
        }
        const token = await requestNotificationPermission(vapidKey);
        if (token) {
          dispatch(setToken(token));
          // Send notification to backend, then fetch notifications
          dispatch(
            sendNotificationToBackend({
              token,
              body: "Welcome back!",
              title: "Login Successful",
            })
          ).then(() => {
            dispatch(fetchNotifications(token));
          });
        }
      };
      getTokenAndSave();
      navigate("/home");
    }
  }, [user, navigate, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(`Login Failed: ${error}`);
      dispatch(resetError());
    }
  }, [error, dispatch]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row md:justify-evenly items-center p-6 bg-dark">
      {/* Logo Section */}
      <div className="flex justify-center md:w-1/3">
        <img src={logo} alt="Logo" className="w-32 md:w-2/3" />
      </div>

      {/* Form Section */}
      <div className="w-full max-w-md bg-[#1F1C29] rounded-lg p-6 space-y-6 shadow-lg">
        <form className="space-y-6" onSubmit={handleLogin}>
          {/* Email Input */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-white">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="emailAddress"
              placeholder="Enter email"
              className="input-field"
              value={formData.emailAddress}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password Input */}
          <div className="space-y-2 relative">
            <label htmlFor="password" className="text-white">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Enter password"
              className="input-field"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-10 text-white"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <MdVisibilityOff size={24} />
              ) : (
                <MdVisibility size={24} />
              )}
            </button>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex justify-between items-center text-white">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              />
              <span>Remember Me</span>
            </label>
            <button
              type="button"
              onClick={() => navigate("/reset-password")}
              className="text-teal-500 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center justify-center h-12 w-full"
          >
            {loading ? (
              <FaSpinner className="text-teal-500 text-2xl animate-spin" />
            ) : (
              "Login"
            )}
          </button>

          {/* OR Separator */}
          <div className="text-center text-white">──── OR ────</div>

          {/* Social Login */}
          <div className="flex justify-center space-x-6">
            <FaFacebook
              size="2rem"
              className="text-teal-500 cursor-pointer"
              onClick={() => dispatch(socialLogin("facebook"))}
            />
            <FaGoogle
              size="2rem"
              className="text-teal-500 cursor-pointer"
              onClick={() => dispatch(socialLogin("google"))}
            />
          </div>

          {/* Sign Up Link */}
          <div className="text-center text-white">
            Don't have an account?{" "}
            <span
              className="text-teal-500 cursor-pointer"
              onClick={() => navigate("/register")}
            >
              Sign Up
            </span>
          </div>
        </form>
      </div>

      {/* Toast Notification Container */}
      <ToastContainer />
    </div>
  );
};

export default Login;
