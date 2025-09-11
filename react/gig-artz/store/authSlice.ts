import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

// Firebase
import { auth } from "../src/config/firebase";
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { createUser, fetchUserProfile, UserProfile } from "./profileSlice";
import { notify } from "../src/helpers/notify";
import { AppDispatch } from "./store";
import { useNavigate } from "react-router-dom";

// User Interface
export interface User {
  userName: string;
  emailAddress: string;
  phoneNumber: string;
  profilePic?: string;
  uid?: string;
}

interface AuthState {
  user: User | null;
  uid: string | null;
  loading: boolean;
  error: string | null;
  current_user: UserProfile | null;
}

// Define formData type for registration
export interface RegistrationData {
  email: string;
  password: string;
  userName: string;
  phoneNumber: string;
}

// Load user from localStorage during initialization
const persistedUserRaw = localStorage.getItem("authUser");
let persistedUser: User | null = null;

if (persistedUserRaw) {
  try {
    const parsed = JSON.parse(persistedUserRaw);
    // Check if it's a Firebase user object (has providerData and stsTokenManager)
    if (parsed && parsed.providerData && parsed.stsTokenManager) {
      persistedUser = {
        userName: parsed.email || parsed.userName || "Unnamed User",
        emailAddress: parsed.email || parsed.emailAddress || "",
        phoneNumber: parsed.phoneNumber || "",
        profilePic: parsed.photoURL || "",
        uid: parsed.uid || null,
      };
    } else {
      // Assume it's already in User format
      persistedUser = parsed;
    }
  } catch {
    persistedUser = null;
  }
}

// Initial state
const initialState: AuthState = {
  user: persistedUser,
  current_user: null,
  uid: persistedUser ? persistedUser.uid : null, // Ensure uid is extracted from the persisted user
  loading: false,
  error: null,
};

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    registerStart(state) {
      state.loading = true;
      state.error = null;
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.uid = action.payload.uid || null; // Ensure uid is set when user is updated
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<{ user: User; uid: string }>) {
      state.loading = false;
      state.user = action.payload.user;
      state.uid = action.payload.uid; // Ensure uid is set
      state.error = null;
      localStorage.setItem("authUser", JSON.stringify(action.payload.user)); // Persist user
    },
    registerSuccess(state, action: PayloadAction<{ user: User; uid: string }>) {
      state.loading = false;
      state.user = action.payload.user;
      state.uid = action.payload.uid; // Ensure uid is set
      state.error = null;
      localStorage.setItem("authUser", JSON.stringify(action.payload.user)); // Persist user
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      state.user = null;  // Reset user state on failure
    },
    registerFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    resetPasswordFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.uid = null; // Clear uid on logout
      state.error = null;
      localStorage.removeItem("authUser"); // Clear persisted user
    },
    resetError(state) {
      state.error = null;
    },
  },
});

// Action creators for async operations
export const registerUser = (formData: RegistrationData, navigate: Function) => async (dispatch: AppDispatch) => {
  dispatch(authSlice.actions.registerStart());
  try {
    console.log("Sending registration request with data:", formData);
    const response = await axios.post(
      "https://gigartz.onrender.com/register",
      formData
    );


    // Verification alert
    if (response) {
      console.log(response)
      notify(`Registration successful! Please verify your email`, "success")

      // Redirect
      navigate("/"); // Use the passed navigate function
    }
  } catch (error) {
    console.error("Registration failed:", error);
    dispatch(authSlice.actions.registerFailure(error.message));
  }
};

export const resetPassword = (email: string) => async (dispatch: AppDispatch) => {
  try {
    console.log("Sending password reset request with email:", email);
    await axios.post("https://gigartz.onrender.com/reset-password", { email });
    console.log("Password reset email sent successfully.");
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("Axios error during password reset:", error.response || error.message);
      dispatch(authSlice.actions.resetPasswordFailure(error.response?.data.error || "An error occurred"));
    } else if (error instanceof Error) {
      console.error("Error during password reset:", error.message);
      dispatch(authSlice.actions.resetPasswordFailure(error.message));
    } else {
      console.error("An unexpected error occurred during password reset");
      dispatch(authSlice.actions.resetPasswordFailure("An unexpected error occurred"));
    }
  }
};

// Accept rememberMe in credentials
export const loginUser = (email: string, password: string, rememberMe?: boolean) => async (dispatch: AppDispatch) => {
  dispatch(authSlice.actions.loginStart());
  try {
    // Defensive: ensure email and password are not objects/undefined and coerce to string
    const emailStr = typeof email === "string" ? email : String(email ?? "");
    const passwordStr = typeof password === "string" ? password : String(password ?? "");
    if (!emailStr || !passwordStr) {
      dispatch(authSlice.actions.loginFailure("Email and password are required and must be strings."));
      return;
    }
    const payload = { emailAddress: emailStr, password: passwordStr };
    console.log("Sending login request with payload:", payload);
    const response = await axios.post(
      "https://gigartz.onrender.com/login",
      payload
    );

    if (response && response.data) {
      const uid = response.data.user.uid;
      console.log("Logged Data:", response.data);
      console.log("Uid:", uid);

      // Fetch user profile after successful login
      const profileResponse = await dispatch(fetchUserProfile(uid));
      console.log("User profile data: ", profileResponse);

      // Only persist user if rememberMe is true
      if (rememberMe) {
        localStorage.setItem("authUser", JSON.stringify(response.data.user));
      } else {
        localStorage.removeItem("authUser");
      }

      dispatch(authSlice.actions.loginSuccess({
        user: response.data.user,
        uid: uid,
      }));

      // --- LOGIN NOTIFICATION ---
      notify("Successfully Logged in", "success");

      console.log("Login Successful!");
    }
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("Axios error during login:", error.response?.data.error || error.message);
      dispatch(authSlice.actions.loginFailure(error.response?.data.error || "An error occurred"));
    } else if (error instanceof Error) {
      console.error("Error during login:", error.message);
      dispatch(authSlice.actions.loginFailure(error.message));
    } else {
      console.error("An unexpected error occurred during login");
      dispatch(authSlice.actions.loginFailure("An unexpected error occurred"));
    }
  }
};



// Social login handler
export const socialLogin = (provider: "facebook" | "google" | "twitter") => async (dispatch: AppDispatch) => {
  dispatch(authSlice.actions.loginStart());
  let authProvider;

  switch (provider) {
    case "facebook":
      authProvider = new FacebookAuthProvider();
      break;
    case "google":
      authProvider = new GoogleAuthProvider();
      break;
    case "twitter":
      authProvider = new TwitterAuthProvider();
      break;
    default:
      return dispatch(authSlice.actions.loginFailure("Unknown provider"));
  }

  try {
    const result = await signInWithPopup(auth, authProvider);
    const user = result.user;

    console.log(user);

    const customUser: User = {
      userName: user.displayName || user.email || "Unnamed User",
      emailAddress: user.email || "",
      phoneNumber: user.phoneNumber || "",
      profilePic: user.photoURL || "",
      uid: user.uid,
    };

    // Dispatch createUser from profileSlice after successful login
    console.log("Creating user: ", user.uid);
    await dispatch(createUser({ uid: user.uid, customUser }));

    dispatch(authSlice.actions.loginSuccess({ user: customUser, uid: user.uid }));

    // --- LOGIN NOTIFICATION (SOCIAL) ---
    notify("Successfully Logged in", "success");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error during social login:", error.message);
      dispatch(authSlice.actions.loginFailure(error.message));
    } else {
      console.error("An unexpected error occurred during social login");
      dispatch(authSlice.actions.loginFailure("An unexpected error occurred"));
    }
  }
};

export const deleteUserAccount = (userId: string, currentPassword: string) => async (dispatch: AppDispatch) => {
  dispatch(authSlice.actions.loginStart()); // Use loginStart to show loading spinner
  try {
    const response = await axios.post(
      `https://gigartz.onrender.com/deleteUserAccount/${userId}`,
      { currentPassword }
    );
    console.log("Account deletion successful:", response.data);

    dispatch(logout()); // Clear auth state
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("Delete account error:", error.response?.data?.error || error.message);
      dispatch(authSlice.actions.loginFailure(error.response?.data?.error || "Failed to delete account."));
    } else if (error instanceof Error) {
      console.error("Delete account error:", error.message);
      dispatch(authSlice.actions.loginFailure(error.message));
    } else {
      dispatch(authSlice.actions.loginFailure("An unexpected error occurred while deleting account."));
    }
  }
};

export const suspendUserAccount = (userId: string, suspend: boolean) => async (dispatch: AppDispatch) => {
  dispatch(authSlice.actions.loginStart());
  try {
    const response = await axios.post(
      `https://gigartz.onrender.com/suspendUserAccount/${userId}`,
      { suspend }
    );
    console.log(`User ${suspend ? "suspended" : "unsuspended"} successfully:`, response.data);

    // Optional: Fetch fresh profile or notify
    notify(`Account status changed: ${suspend ? "Suspended" : "Active"}`, "info");
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("Suspend account error:", error.response?.data?.error || error.message);
      dispatch(authSlice.actions.loginFailure(error.response?.data?.error || "Failed to change account status."));
    } else if (error instanceof Error) {
      console.error("Suspend account error:", error.message);
      dispatch(authSlice.actions.loginFailure(error.message));
    } else {
      dispatch(authSlice.actions.loginFailure("An unexpected error occurred while updating account status."));
    }
  }
};


export const resetPasswordWithoutEmail = (newPassword: string, token: string) => async (dispatch: AppDispatch) => {
  try {
    const response = await axios.post(
      "https://gigartz.onrender.com/resetPasswordWithOutEmail",
      { newPassword },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Password reset without email successful:", response.data);
    // You can optionally dispatch a success toast here
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("Reset password (no email) error:", error.response?.data?.error || error.message);
      dispatch(authSlice.actions.resetPasswordFailure(error.response?.data?.error || "Failed to reset password."));
    } else if (error instanceof Error) {
      console.error("Reset password (no email) error:", error.message);
      dispatch(authSlice.actions.resetPasswordFailure(error.message));
    } else {
      dispatch(authSlice.actions.resetPasswordFailure("An unexpected error occurred during password reset."));
    }
  }
};


// Selectors for use in components
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user;

// Export actions
export const { logout, resetError } = authSlice.actions;

export default authSlice.reducer;