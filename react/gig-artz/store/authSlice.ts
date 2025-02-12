import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// User Interface
export interface User {
  username: string;
  email: string;
  phone: string;
  profilePic?: string;
  token?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

// Async thunk to register a user
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData: any, { rejectWithValue }) => {
    try {
      console.log("Sending registration request with data:", formData);
      const response = await axios.post(
        "https://gigartz.onrender.com/register",
        formData
      );
      console.log("Registration response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error during registration:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to login a user
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      console.log("Sending login request with credentials:", credentials);
      const response = await axios.post(
        "https://gigartz.onrender.com/login",
        credentials
      );
      console.log("Login response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error during login:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to reset password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      console.log("Sending password reset request with email:", email);
      await axios.post("https://gigartz.onrender.com/reset-password", {
        email,
      });
      console.log("Password reset email sent successfully.");
      return email;
    } catch (error: any) {
      console.error("Error during password reset:", error.message);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to fetch user profile
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchUserProfile",
  async (uid: string, { rejectWithValue }) => {
    try {
      console.log("Fetching user profile for UID:", uid);
      const response = await axios.get(
        `https://gigartz.onrender.com/profile/${uid}`
      );
      console.log("User profile response:", response.data);
      return response.data; // Return user profile data for success action
    } catch (error: any) {
      console.error("Error fetching user profile:", error.message);
      return rejectWithValue(error.message); // Return the error message for failure action
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.error = null;
    },
    resetError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Handle register user actions
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Handle login user actions
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Handle password reset actions
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        resetPassword.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = null;
        }
      )
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Handle fetching user profile actions
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchUserProfile.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.user = action.payload; // Assuming the profile response has user data
          state.error = null;
        }
      )
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, resetError } = authSlice.actions;

export default authSlice.reducer;
