import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

// Firebase
import { auth } from "../config/firebase";
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { createUser } from "./profileSlice";
import { AppDispatch } from "./store";

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
}

// Define formData type for registration
export interface RegistrationData {
  email: string;
  password: string;
  userName: string;
  phoneNumber: string;
}

// Initial state
const initialState: AuthState = {
  user: null,
  uid: null,
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
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<{ user: User; uid: string }>) {
      state.loading = false;
      state.user = action.payload.user;
      state.uid = action.payload.uid;
      state.error = null;
    },
    registerSuccess(state, action: PayloadAction<{ user: User; uid: string }>) {
      state.loading = false;
      state.user = action.payload.user;
      state.uid = action.payload.uid;
      state.error = null;
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
      state.uid = null;
      state.error = null;
    },
    resetError(state) {
      state.error = null;
    },
  },
});

// Action creators for async operations
export const registerUser = (formData: RegistrationData) => async (dispatch: AppDispatch) => {
  dispatch(authSlice.actions.registerStart());
  try {
    console.log("Sending registration request with data:", formData);
    const response = await axios.post(
      "https://gigartz.onrender.com/register",
      formData
    );
    console.log("Registration response:", response.data);
    dispatch(authSlice.actions.registerSuccess({ user: response.data.user, uid: response.data.user.uid }));
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error("Axios error response:", error.response);
      dispatch(authSlice.actions.registerFailure(error.response?.data.error || "An error occurred"));
    } else if (error instanceof Error) {
      console.error("Error during registration:", error.message);
      dispatch(authSlice.actions.registerFailure(error.message));
    } else {
      console.error("An unexpected error occurred during registration");
      dispatch(authSlice.actions.registerFailure("An unexpected error occurred"));
    }
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

export const loginUser = (credentials: { email: string; password: string }) => async (dispatch: AppDispatch) => {
  dispatch(authSlice.actions.loginStart());
  try {
    console.log("Sending login request with credentials:", credentials);
    const response = await axios.post(
      "https://gigartz.onrender.com/login",
      credentials
    );

    if (response && response.data) {
      const uid = response.data.user.uid;
      console.log("Res Data:", response.data);
      console.log("Uid:", uid);
      
      // Dispatch the login success action
      dispatch(authSlice.actions.loginSuccess({ user: response.data.user, uid: response.data.user.uid }));

      // Optionally, you can log the success message here for debugging, but do not rely on the store state immediately
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

// Export actions
export const { logout, resetError } = authSlice.actions;

export default authSlice.reducer;
