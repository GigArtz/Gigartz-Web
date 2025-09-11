import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  registerUser,
  selectAuthUser,
  selectAuthError,
  selectAuthLoading,
  resetError,
} from "../../store/authSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import logo from "../assets/White.png";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FaSpinner } from "react-icons/fa";

const InputField = ({
  label,
  type,
  placeholder,
  value,
  onChange,
  showToggle,
  onToggle,
  showValue,
}) => (
  <div className="space-y-2">
    <label className="text-white">{label}</label>
    <div className="relative">
      <input
        type={showToggle && showValue ? "text" : type}
        placeholder={placeholder}
        className="input-field"
        value={value}
        onChange={onChange}
        required
      />
      {showToggle && onToggle && (
        <button
          type="button"
          className="absolute right-3 top-3 text-white"
          onClick={onToggle}
        >
          {showValue ? (
            <MdVisibilityOff size={24} />
          ) : (
            <MdVisibility size={24} />
          )}
        </button>
      )}
    </div>
  </div>
);

const Button = ({ label, onClick, disabled }) => (
  <button className="btn-primary" onClick={onClick} disabled={disabled}>
    {label}
  </button>
);

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectAuthUser);
  const error = useSelector(selectAuthError);
  const loading = useSelector(selectAuthLoading);

  const [userName, setUserName] = useState("");
  const [name, setName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const toggleShowPassword = () => setShowPassword((prev) => !prev);
  const toggleShowPassword2 = () => setShowPassword2((prev) => !prev);

  const handleRegister = (event) => {
    event.preventDefault(); // Prevent form submission and page reload
    if (
      !userName ||
      !name ||
      !emailAddress ||
      !city ||
      !password ||
      !confirmPassword
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!/^[\w.-]+@[\w.-]+\.\w{2,3}$/.test(emailAddress)) {
      toast.error("Invalid email address");
      return;
    }
    dispatch(
      // @ts-expect-error: Redux thunk type mismatch workaround
      registerUser(
        {
          confirmPassword: confirmPassword,
          emailAddress: emailAddress,
          password: password,
          userName: userName,
          name: name,
          city: city,
          fcmToken: "",
          phoneNumber: "", // Provide a value or connect to a field if needed
        },
        navigate // Pass navigate here
      )
    );
  };

  useEffect(() => {
    if (user) {
      toast.success("Registration Successful!");
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(`Registration Failed: ${error}`);
      dispatch(resetError());
    }
  }, [error, dispatch]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row md:justify-evenly items-center p-6 bg-[#060512]">
      {/* Logo Section */}
      <div className="flex justify-center md:w-1/3">
        <img src={logo} alt="Logo" className="w-32 md:w-2/3" />
      </div>

      {/* Form Section */}
      <div className="w-full max-w-md bg-[#1F1C29] rounded-lg p-6 space-y-6 shadow-lg">
        <form className="space-y-6" onSubmit={handleRegister}>
          <InputField
            label="Username"
            type="text"
            placeholder="Enter username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            showToggle={false}
            onToggle={undefined}
            showValue={false}
          />
          <InputField
            label="Name"
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            showToggle={false}
            onToggle={undefined}
            showValue={false}
          />

          <InputField
            label="Email"
            type="email"
            placeholder="Enter email"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            showToggle={false}
            onToggle={undefined}
            showValue={false}
          />
          <InputField
            label="City"
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            showToggle={false}
            onToggle={undefined}
            showValue={false}
          />
          <InputField
            label="Password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showToggle
            onToggle={toggleShowPassword}
            showValue={showPassword}
          />
          <InputField
            label="Confirm Password"
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            showToggle
            onToggle={toggleShowPassword2}
            showValue={showPassword2}
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center justify-center h-12 w-full"
          >
            {loading ? (
              <FaSpinner className="text-teal-500 text-2xl animate-spin" />
            ) : (
              "Sign Up"
            )}
          </button>

          <p className="text-center text-white mt-4">
            Already have an account?{" "}
            <span
              className="text-teal-400 cursor-pointer"
              onClick={() => navigate("/")}
            >
              Sign In
            </span>
          </p>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Register;
