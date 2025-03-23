import React, { useState, useEffect } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("authUser") || "{}");
    if (storedUser && storedUser.email) {
      setEmail(storedUser.email); // Pre-fill email if user is already stored
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getAuth();

    try {
      // Set persistence to local
      await setPersistence(auth, browserLocalPersistence);

      if (auth.currentUser) {
        // Reauthenticate if the user is already logged in
        console.log("Reauthenticating user...");
        const credential = EmailAuthProvider.credential(email, password);
        await reauthenticateWithCredential(auth.currentUser, credential);
        console.log("User reauthenticated:", auth.currentUser);
      } else {
        // Perform a fresh login
        console.log("Performing fresh login...");
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Store authenticated user in localStorage
        localStorage.setItem(
          "authUser",
          JSON.stringify({ uid: user.uid, email: user.email })
        );
        console.log(
          "Stored user in localStorage:",
          localStorage.getItem("authUser")
        );
        console.log("User logged in:", user);
      }

      // Log the current authentication status
      console.log("Authentication status:", auth.currentUser);

      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h2 className="text-center text-lg font-bold">Login</h2>
        {error && <p className="text-red-500">{error}</p>}
        <label className="block text-sm">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          placeholder="Enter your email"
          required
        />
        <label className="block text-sm">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
          placeholder="Enter your password"
          required
        />
        <button
          type="submit"
          className="p-2 px-4 bg-teal-500 text-white rounded-lg"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
