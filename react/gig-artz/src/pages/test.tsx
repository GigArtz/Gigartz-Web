import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  registerUser,
  loginUser,
  resetPassword,
  socialLogin,
} from "../store/authSlice";
import {
  fetchAllProfiles,
  fetchUserProfile,
  updateUserProfile,
} from "../store/profileSlice";
import { RootState } from "../../store/store";

const AuthComponent = () => {
  const dispatch = useDispatch();
  const { uid, loading, error } = useSelector((state: RootState) => state.auth);
  const { profile, userList } = useSelector(
    (state: RootState) => state.profile
  );

  // Fetch user profile when accessToken is available
  useEffect(() => {
    if (uid) {
      console.log("Fetching data for: " + uid);
      dispatch(fetchUserProfile(uid));
    }
  }, [uid, dispatch]);

  // Local state for user input
  const [emailAddress, setEmail] = useState("Kgaotlhaelwe@gmail.com");
  const [userName, setUsername] = useState("Jon");
  const [password, setPassword] = useState("Kabelo12!@");
  const [confirmPassword, setConfirmPassword] = useState("123456789");
  const [phoneNumber, setPhone] = useState("0234567089");
  const [fcmToken, setFcmToken] = useState(
    "dAIz4k9_lm2D:APA91bFpcck4jtOe-jwl93LJkP_lm8ccj1-oVjjZZQ5VZ"
  );
  const [city, setCity] = useState("Kim");

  // Handle registration
  const handleRegister = () => {
    const formData = {
      userName,
      emailAddress,
      password,
      confirmPassword: password,
      city,
      phoneNumber,
      fcmToken,
    };
    dispatch(registerUser(formData));
  };

  // Handle login
  const handleLogin = () => {
    dispatch(loginUser({ emailAddress, password }));
  };

  // Handle password reset
  const handleResetPassword = () => {
    dispatch(resetPassword(emailAddress));
  };

  // Fetch user profile by UID
  const handleFetchProfile = () => {
    dispatch(fetchUserProfile(uid));
  };

  // Fetch all user profiles
  const handleFetchAllProfiles = () => {
    dispatch(fetchAllProfiles());
  };

  // Update profile
  const handleUpdateProfile = () => {
    const formData = {
      userName,
      city,
      phoneNumber,
    };

    // Pass accessToken here
    dispatch(updateUserProfile(uid, formData));
  };

  // Handle social login for Facebook, Google, Twitter
  const handleSocialLogin = (provider: "facebook" | "google" | "twitter") => {
    dispatch(socialLogin(provider));
  };

  return (
    <div className="p-5 max-w-sm mx-auto">
      <h1 className="text-3xl font-bold text-gray-950 mb-4">hello</h1>
      <h1 className="text-center text-3xl font-bold underline mb-4">
        Hello World
      </h1>
      <h2 className="mb-4">Redux Async API Testing</h2>

      <p>Access Token:</p>

      {/* Input Fields */}
      <div>
        <input
          type="text"
          placeholder="Username"
          value={userName}
          onChange={(e) => setUsername(e.target.value)}
          className="block w-full mb-4 p-2 border rounded-md bg-gray-100"
        />
        <input
          type="email"
          placeholder="Email"
          value={emailAddress}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full mb-4 p-2 border rounded-md bg-gray-100"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full mb-4 p-2 border rounded-md bg-gray-100"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="block w-full mb-4 p-2 border rounded-md bg-gray-100"
        />
        <input
          type="text"
          placeholder="Phone"
          value={phoneNumber}
          onChange={(e) => setPhone(e.target.value)}
          className="block w-full mb-4 p-2 border rounded-md bg-gray-100"
        />
      </div>

      {/* Buttons for triggering actions */}
      <div className="mb-4">
        <button
          onClick={handleRegister}
          disabled={loading}
          className="mr-2 bg-primary text-white py-2 px-4 rounded-md"
        >
          Register
        </button>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="mr-2 bg-secondary text-white py-2 px-4 rounded-md"
        >
          Login
        </button>
        <button
          onClick={handleResetPassword}
          disabled={loading}
          className="mr-2 bg-gray-300 text-white py-2 px-4 rounded-md"
        >
          Reset Password
        </button>
        <button
          onClick={handleFetchProfile}
          disabled={loading}
          className="mr-2 bg-gray-300 text-white py-2 px-4 rounded-md"
        >
          Fetch Profile
        </button>
        <button
          onClick={handleUpdateProfile}
          disabled={loading}
          className="mr-2 bg-gray-300 text-white py-2 px-4 rounded-md"
        >
          Update Profile
        </button>
        <button
          onClick={handleFetchAllProfiles}
          disabled={loading}
          className="mr-2 bg-gray-300 text-white py-2 px-4 rounded-md"
        >
          Fetch Profiles
        </button>
      </div>

      {/* Social Login Buttons */}
      <div className="mb-4">
        <button
          onClick={() => handleSocialLogin("facebook")}
          disabled={loading}
          className="mr-2 bg-blue-600 text-white py-2 px-4 rounded-md"
        >
          Login with Facebook
        </button>
        <button
          onClick={() => handleSocialLogin("google")}
          disabled={loading}
          className="mr-2 bg-red-600 text-white py-2 px-4 rounded-md"
        >
          Login with Google
        </button>
        <button
          onClick={() => handleSocialLogin("twitter")}
          disabled={loading}
          className="mr-2 bg-blue-500 text-white py-2 px-4 rounded-md"
        >
          Login with Twitter
        </button>
      </div>

      {/* Loading state */}
      {loading && <p>Loading...</p>}

      {/* Error state */}
      {error && <p className="text-red-500">Error: {error}</p>}

      {/* User data display */}
      {profile && (
        <div className="mt-4">
          <h3>User Profile</h3>
          <p>Username: {profile.userName}</p>
          <p>Email: {profile.emailAddress}</p>
          <p>Phone: {profile.phoneNumber}</p>
          {profile.profilePicUrl && (
            <img
              src={profile.profilePicUrl}
              alt="Profile"
              className="w-24 h-24 rounded-full mt-2"
            />
          )}
          <p>Token: {uid}</p>
        </div>
      )}

      {/* Display users */}
      {userList && (
        <div className="mt-4">
          <h3>User Profiles</h3>
          {userList.map((user) => (
            <div key={user.id}>
              <p>Username: {user.userName}</p>
              <p>Email: {user.emailAddress}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuthComponent;
