import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { db } from "../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios, { AxiosError } from "axios";
import { AppDispatch } from "./store";

// User Profile Interface
export interface UserProfile {
  id?: string;
  userName: string;
  name: string;
  emailAddress: string;
  phoneNumber: string;
  profilePicUrl: string | null;
  coverPic: string | null;
  bio: string;
  bookingRequests: any[]; // Adjust type as needed
  city: string;
  country: string;
  genre: string;
  followers: number;
  following: number;
  rating: number;
  reviews: {
    reviewReceived: number;
    reviewGiven: number;
  };
  fcmToken: string;
  roles: {
    generalUser: boolean;
    freelancer: boolean;
  };
}

interface ProfileState {
  profile: UserProfile | null;
  userList: UserProfile[] | null;
  loading: boolean;
  error: string | null;
  success: string | null;
}

const initialState: ProfileState = {
  profile: null,
  userList: null,
  loading: false,
  error: null,
  success: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    fetchProfileStart(state) {
      state.loading = true;
      state.error = null;
    },
    updateProfileStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchProfileSuccess(state, action: PayloadAction<UserProfile>) {
      state.loading = false;
      state.profile = action.payload;
      state.error = null;
    },
    createBookingStart(state) {
      state.loading = true;
      state.error = null;
    },
    createBookingSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.success = action.payload;
      state.error = null;
    },
    createBookingFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchDrawerProfileSuccess(state, action: PayloadAction<UserProfile>) {
      state.loading = false;
      state.profile = action.payload;
      state.error = null;
    },
    followProfileSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.success = action.payload;
      state.error = null;
    },
    getProfileSuccess(state, action: PayloadAction<UserProfile>) {
      state.loading = false;
      state.userList = action.payload;
      state.error = null;
    },
    updateProfileSuccess(state, action: PayloadAction<UserProfile>) {
      state.loading = false;
      state.profile = action.payload;
      state.error = null;
    },
    fetchProfileFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    updateProfileFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    resetError(state) {
      state.error = null;
    },
    updateProfile(state, action: PayloadAction<UserProfile>) {
      state.profile = action.payload;
    },
  },
});

// Axios error handling function
const handleAxiosError = (
  error: unknown,
  dispatch: AppDispatch,
  failureAction: Function
) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      dispatch(
        failureAction(axiosError.response?.data?.error || "An error occurred")
      );
    } else if (axiosError.request) {
      dispatch(failureAction("No response received from server"));
    } else {
      dispatch(failureAction(axiosError.message));
    }
  } else {
    dispatch(failureAction("Unexpected error occurred"));
  }
};

// Fetch user profile from Firestore
export const fetchDrawerUserProfile =
  (uid: string) => async (dispatch: AppDispatch) => {
    dispatch(profileSlice.actions.fetchProfileStart());

    try {
      console.log("Fetching user profile with user id:", uid);
      const response = await axios.get(
        `https://gigartz.onrender.com/user/${uid}`
      );
      console.log("User profile response:", response.data.userProfile);
      dispatch(
        profileSlice.actions.fetchDrawerProfileSuccess(
          response.data.userProfile
        )
      );
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          // The request was made and the server responded with an error
          console.error("Response error:", axiosError.response?.data?.error);
          dispatch(
            profileSlice.actions.fetchProfileFailure(
              axiosError.response?.data?.error || "Failed to fetch user profile"
            )
          );
        } else if (axiosError.request) {
          // The request was made, but no response was received
          console.error("Request error:", axiosError.request);
          dispatch(
            profileSlice.actions.fetchProfileFailure(
              "No response received from server"
            )
          );
        } else {
          // Something else happened during the setup of the request
          console.error("Error setting up request:", axiosError.message);
          dispatch(
            profileSlice.actions.fetchProfileFailure(axiosError.message)
          );
        }
      } else {
        // Handle non-Axios errors
        console.error("Unexpected error fetching user profile:", error);
        dispatch(
          profileSlice.actions.fetchProfileFailure("Unexpected error occurred")
        );
      }
    }
  };

// Fetch user profile
export const fetchUserProfile =
  (uid: string) => async (dispatch: AppDispatch) => {
    dispatch(profileSlice.actions.fetchProfileStart());

    try {
      console.log("Fetching user profile with user id:", uid);
      const response = await axios.get(
        `https://gigartz.onrender.com/user/${uid}`
      );
      console.log("User profile response:", response.data.userProfile);
      dispatch(profileSlice.actions.fetchProfileSuccess(response.data.userProfile));
    } catch (error: unknown) {
      handleAxiosError(error, dispatch, profileSlice.actions.fetchProfileFailure);
    }
  };

// Fetch all user profiles
export const fetchAllProfiles = () => async (dispatch: AppDispatch) => {
  dispatch(profileSlice.actions.fetchProfileStart());

  try {
    console.log("Fetching user profiles");
    const response = await axios.get(`https://gigartz.onrender.com/users/`);
    console.log("User profile responses:", response.data);

    dispatch(profileSlice.actions.getProfileSuccess(response.data));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        // The request was made and the server responded with an error
        console.error("Response error:", axiosError.response?.data);
        dispatch(
          profileSlice.actions.fetchProfileFailure(
            axiosError.response?.data?.error || "Failed to fetch user profile"
          )
        );
      } else if (axiosError.request) {
        // The request was made, but no response was received
        console.error("Request error:", axiosError.request);
        dispatch(
          profileSlice.actions.fetchProfileFailure(
            "No response received from server"
          )
        );
      } else {
        // Something else happened during the setup of the request
        console.error("Error setting up request:", axiosError.message);
        dispatch(profileSlice.actions.fetchProfileFailure(axiosError.message));
      }
    } else {
      // Handle non-Axios errors
      console.error("Unexpected error fetching user profile:", error);
      dispatch(
        profileSlice.actions.fetchProfileFailure("Unexpected error occurred")
      );
    }
  }
};

// Update user profile via API
export const updateUserProfile =
  (uid: string, profileData: Partial<UserProfile>) =>
    async (dispatch: AppDispatch) => {
      dispatch(profileSlice.actions.updateProfileStart());

      try {
        // Prepare the data to send
        const updatedData = {
          uid,
          ...profileData,
          updatedAt: new Date().toISOString(), // Add updatedAt timestamp
        };

        console.log("Updating user profile with data:", updatedData);

        // Send the updated profile data to the API endpoint
        const response = await axios.put(
          `https://gigartz.onrender.com/updateprofile/${uid}`,
          updatedData
        );

        console.log("User profile update response 2:", response.data);

        // Fetch updated profile data
        await dispatch(fetchUserProfile(uid));
        console.log(updateProfile);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            // The request was made and the server responded with an error
            console.error("Response error:", axiosError.response?.data);
            dispatch(
              profileSlice.actions.updateProfileFailure(
                axiosError.response?.data?.message ||
                "Failed to fetch user profile"
              )
            );
          } else if (axiosError.request) {
            // The request was made, but no response was received
            console.error("Request error:", axiosError.request);
            dispatch(
              profileSlice.actions.updateProfileFailure(
                "No response received from server"
              )
            );
          } else {
            // Something else happened during the setup of the request
            console.error("Error setting up request:", axiosError.message);
            dispatch(
              profileSlice.actions.updateProfileFailure(axiosError.message)
            );
          }
        } else {
          // Handle non-Axios errors
          console.error("Unexpected error fetching user profile:", error);
          dispatch(
            profileSlice.actions.updateProfileFailure("Unexpected error occurred")
          );
        }
      }
    };

// Switch user profile via API
export const switchUserProfile =
  (userId: string, genre: [], acceptTips: boolean, acceptBookings: boolean) =>
    async (dispatch: AppDispatch) => {
      dispatch(profileSlice.actions.updateProfileStart());

      try {
        // Send the updated profile data to the API endpoint
        const response = await axios.post(
          "https://gigartz.onrender.com/switchUser",
          { userId, acceptTips, genre, acceptBookings }
        );

        console.log("User profile update response:", response.data);

        // Dispatch success action with the updated profile response if needed
        dispatch(
          profileSlice.actions.updateProfileSuccess(response.data.updatedProfile)
        );
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            // The request was made and the server responded with an error
            console.error("Response error:", axiosError.response?.data);
            dispatch(
              profileSlice.actions.updateProfileFailure(
                axiosError.response?.data?.error || "Failed to fetch user profile"
              )
            );
          } else if (axiosError.request) {
            // The request was made, but no response was received
            console.error("Request error:", axiosError.request);
            dispatch(
              profileSlice.actions.updateProfileFailure(
                "No response received from server"
              )
            );
          } else {
            // Something else happened during the setup of the request
            console.error("Error setting up request:", axiosError.message);
            dispatch(
              profileSlice.actions.updateProfileFailure(axiosError.message)
            );
          }
        } else {
          // Handle non-Axios errors
          console.error("Unexpected error fetching user profile:", error);
          dispatch(
            profileSlice.actions.updateProfileFailure("Unexpected error occurred")
          );
        }
      }
    };

// Create user profile in Firestore after social login
export const createUser =
  (payload: { uid: string; customUser: UserProfile }) =>
    async (dispatch: AppDispatch) => {
      const { uid, customUser } = payload;

      console.log("Creating user profile for fb user:", uid);

      // Define the user profile object to create in Firestore
      const userProfile: UserProfile = {
        id: customUser.id,
        userName: customUser.userName,
        name: customUser.userName,
        emailAddress: customUser.emailAddress,
        phoneNumber: customUser.phoneNumber || "Add a number",
        profilePicUrl: customUser.profilePicUrl || null,
        coverPic: customUser.profilePicUrl || null,
        bio: "", // Default empty bio
        city: "", // Default empty city
        country: "", // Default empty country
        genre: "", // Default empty genre
        followers: 0,
        following: 0,
        reviews: {
          reviewGiven: 0,
          reviewReceived: 0,
        },
        fcmToken: "", // Default empty token
        roles: {
          generalUser: true,
          freelancer: false,
        },
        bookingRequests: [],
        rating: 0,
      };

      try {
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          // Create the user profile if it doesn't exist
          await setDoc(userDocRef, userProfile);
          dispatch(profileSlice.actions.updateProfile(userProfile));
          console.log("User profile created in Firestore");
        } else {
          console.log("User profile already exists");
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          console.error("Axios error creating profile:", axiosError.message);
          dispatch(
            profileSlice.actions.fetchProfileFailure(
              `Failed to create user profile: ${axiosError.message}`
            )
          );
        } else {
          // Handle non-Axios errors and errors not related to Axios
          console.error("Error creating user profile:", error);
          dispatch(
            profileSlice.actions.fetchProfileFailure(
              `Failed to create user profile: ${error instanceof Error ? error.message : "Unknown error"
              }`
            )
          );
        }
      }
    };

// Follow a specified user
export const followUser =
  (followerId: string, followingId: string) =>
    async (dispatch: AppDispatch) => {
      dispatch(profileSlice.actions.updateProfileStart());
      try {
        // Send the updated profile data to the API endpoint
        const response = await axios.post(
          "https://gigartz.onrender.com/followUser",
          { followerId, followingId }
        );

        console.log("Follow user response:", response.data);

        // Dispatch success action with the updated profile response if needed
        console.log(response.data?.message);
        dispatch(
          profileSlice.actions.followProfileSuccess(response.data?.message)
        );
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            // The request was made and the server responded with an error
            console.error(
              "Follow response error:",
              axiosError.response?.data?.message
            );
            dispatch(
              profileSlice.actions.updateProfileFailure(
                axiosError.response?.data?.message ||
                "Failed to fetch user profile"
              )
            );
          } else if (axiosError.request) {
            // The request was made, but no response was received
            console.error("Request error:", axiosError.request);
            dispatch(
              profileSlice.actions.updateProfileFailure(
                "No response received from server"
              )
            );
          } else {
            // Something else happened during the setup of the request
            console.error("Error setting up request:", axiosError.message);
            dispatch(
              profileSlice.actions.updateProfileFailure(axiosError.message)
            );
          }
        } else {
          // Handle non-Axios errors
          console.error("Unexpected error fetching user profile:", error);
          dispatch(
            profileSlice.actions.updateProfileFailure("Unexpected error occurred")
          );
        }
      }
    };

// Booking a freelancer
export const bookFreelancer =
  (bookingData: {
    userId: string;
    freelancerId: string;
    eventDetails: string;
    date: string; // Timestamp as a string
    time: string;
    venue: string;
    additionalInfo?: string; // Optional additional information
    status: string;
    createdAt: string; // Timestamp as a string
  }) =>
    async (dispatch: AppDispatch) => {
      dispatch(profileSlice.actions.createBookingStart());

      try {
        console.log("Booking freelancer...");
        const response = await axios.post(
          `https://gigartz.onrender.com/bookFreelancer`,
          bookingData
        );
        console.log("Freelancer booked successfully:", response.data);

        dispatch(
          profileSlice.actions.createBookingSuccess(
            "Freelancer booked successfully!"
          )
        );
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            console.error("Response error:", axiosError.response?.data);
            dispatch(
              profileSlice.actions.createBookingFailure(
                axiosError.response?.data?.error || "Failed to book freelancer"
              )
            );
          } else if (axiosError.request) {
            console.error("Request error:", axiosError.request);
            dispatch(
              profileSlice.actions.createBookingFailure(
                "No response received from server"
              )
            );
          } else {
            console.error("Error setting up request:", axiosError.message);
            dispatch(
              profileSlice.actions.createBookingFailure(
                axiosError.message || "Unexpected error occurred"
              )
            );
          }
        } else {
          console.error("Unexpected error:", error);
          dispatch(
            profileSlice.actions.createBookingFailure("Unexpected error occurred")
          );
        }
      }
    };

// Export actions
export const {
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
  resetError,
  updateProfile,
  fetchDrawerProfileSuccess,
} = profileSlice.actions;

export default profileSlice.reducer;
