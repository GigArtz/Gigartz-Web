import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../store/authSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RootState } from "../store/store";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import logo from "../assets/White.png";
import { useNavigate } from "react-router-dom";

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
      />
      {showToggle && onToggle && (
        <button
          type="button"
          className="absolute right-3 top-3 text-white"
          onClick={onToggle}
        >
          {showValue ? <MdVisibilityOff size={24} /> : <MdVisibility size={24} />}
        </button>
      )}
    </div>
  </div>
);

const Button = ({ label, onClick, disabled }) => (
  <button
  className="btn-primary"
    onClick={onClick}
    disabled={disabled}
  >
    {label}
  </button>
);

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [userName, setUserName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const toggleShowPassword = () => setShowPassword((prev) => !prev);
  const toggleShowPassword2 = () => setShowPassword2((prev) => !prev);

  const handleRegister = () => {
    if (!userName || !emailAddress || !password || !confirmPassword || !phoneNumber) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (phoneNumber.length < 10) {
      toast.error("Invalid phone number");
      return;
    }
    if (!/^[\w.-]+@[\w.-]+\.\w{2,3}$/.test(emailAddress)) {
      toast.error("Invalid email address");
      return;
    }
    dispatch(
      registerUser({ userName, emailAddress, password, confirmPassword, phoneNumber, fcmToken: "12345678" })
    );
    if (error) {
      toast.error(`Sign up Failed! ${error}`);
      navigate("login");
      toast.success("Registration Successful!");
    }
  };

  return (
    <div className="min-h-screen bg-[#060512] flex flex-col items-center p-5">
      <img src={logo} alt="Logo" className="w-72 mt-2" />
      <div className="w-full max-w-md bg-[#1F1C29] rounded-lg p-6 space-y-6">
        <InputField label="Username" type="text" placeholder="Enter username" value={userName} onChange={(e) => setUserName(e.target.value)} />
        <InputField label="Phone Number" type="text" placeholder="Enter phone number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
        <InputField label="Email" type="email" placeholder="Enter email" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} />
        <InputField label="Password" type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} showToggle onToggle={toggleShowPassword} showValue={showPassword} />
        <InputField label="Confirm Password" type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} showToggle onToggle={toggleShowPassword2} showValue={showPassword2} />
        <Button label={loading ? "Signing up..." : "Sign Up"} onClick={handleRegister} disabled={loading} />
        <p className="text-center text-white mt-4">
          Already have an account? <span className="text-teal-400 cursor-pointer" onClick={() => navigation.navigate("/")}>Sign In</span>
        </p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Register;
