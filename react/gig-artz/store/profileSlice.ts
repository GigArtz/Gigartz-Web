import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { db } from "../src/config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios, { AxiosError } from "axios";
import { AppDispatch } from "./store";
import { addNotification } from "./notificationSlice";
import { notify } from "../src/helpers/notify";

// Extend the Window interface to include 'store'
declare global {
  interface Window {
    store?: {
      dispatch?: Function;
    };
  }
}

// User Profile Interface
export interface UserProfile {
  id?: string;
  userName: string;
  name: string;
  emailAddress: string;
  phoneNumber: string;
  profilePicUrl: string | null;
  profilePicture: string | null;
  coverPic: string | null;
  coverProfile: string | null;
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
  userProfile: UserProfile | null;
  userList: UserProfile[] | null;
  likedEvents: null;
  userBookings: null;
  userBookingsRequests: null;
  userEventProfit: null;
  userEvents: null;
  userFollowers: null;
  userFollowing: null;
  userGuestList: null;
  userReviews: null;
  userTickets: null;
  userTipsProfit: null;
  loading: boolean;
  loadingProfile: boolean;
  error: string | null;
  success: string | null;
}

const initialState: ProfileState = {
  profile: null,
  userProfile: null,
  likedEvents: null,
  userBookings: null,
  userBookingsRequests: null,
  userEventProfit: null,
  userEvents: null,
  userFollowers: null,
  userFollowing: null,
  userGuestList: null,
  userReviews: null,
  userTickets: null,
  userTipsProfit: null,
  userList: null,
  loading: false,
  loadingProfile: false,
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
    fetchAProfileStart(state) {
      state.loading = true;
      state.error = null;
    },
    updateProfileStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchAProfileSuccess(state, action: PayloadAction<UserProfile>) {
      state.loading = false;
      state.userProfile = action.payload;
      state.error = null;
    },

    fetchProfileSuccess(state, action: PayloadAction<UserProfile>) {
      state.loading = false;
      state.profile = action.payload.userProfile;
      state.likedEvents = action.payload.likedEvents;
      state.userBookings = action.payload.userBookings;
      state.userBookingsRequests = action.payload.userBookingsRequests;
      state.userEventProfit = action.payload.userEventProfit;
      state.userEvents = action.payload.userEvents;
      state.userFollowers = action.payload.userFollowers;
      state.userFollowing = action.payload.userFollowing;
      state.userGuestList = action.payload.userGuestList;
      state.userReviews = action.payload.userReviews;
      state.userTickets = action.payload.userTickets;
      state.userTipsProfit = action.payload.userTipsProfit;
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
      // Notification now handled in thunk
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
      // Notification now handled in thunk
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
      // Notification now handled in thunk
    },
    // Example: Add notification for tipping (if tipping logic is present)
    tipReceivedSuccess(state, action: PayloadAction<{ amount: number; from: string }>) {
      state.loading = false;
      state.success = `Tip received from ${action.payload.from}`;
      state.error = null;
      // Notification now handled in thunk
    },
    switchUserProfileSuccess(state, action: PayloadAction<UserProfile>) {
      state.loading = false;
      state.profile = action.payload;
      state.error = null;
      // Notification now handled in thunk
    },
    reviewReceivedSuccess(state, action: PayloadAction<{ from: string; rating: number; comment: string }>) {
      state.loading = false;
      state.success = `Review received from ${action.payload.from}`;
      state.error = null;
      // Notification now handled in thunk
    },
    fetchProfileFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchAProfileFailure(state, action: PayloadAction<string>) {
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
    logout(state) {
      Object.assign(state, initialState);
    },
  },
});

// Error response type for axios
interface ErrorResponse {
  error?: string;
  message?: string;
}

// Axios error handling function
const handleAxiosError = (
  error: unknown,
  dispatch: AppDispatch,
  failureAction: (msg: string) => { type: string; payload: string }
) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      const data = axiosError.response.data as ErrorResponse;
      dispatch(
        failureAction(data.error || data.message || "An error occurred")
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
          const data = axiosError.response.data as ErrorResponse;
          // The request was made and the server responded with an error
          console.error("Response error:", data.error || data.message);
          dispatch(
            profileSlice.actions.fetchProfileFailure(
              data.error || data.message || "Failed to fetch user profile"
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
export const fetchUserProfile = (uid?: string) => async (dispatch: AppDispatch) => {
  dispatch(profileSlice.actions.fetchProfileStart());

  try {
    // Get UID from localStorage if not provided
    const userId = uid || localStorage.getItem("uid");
    if (!userId) throw new Error("User ID is undefined");
    console.log(`Fetching user profile for UID: ${userId}...`);

    const response = await axios.get(`https://gigartz.onrender.com/user/${userId}`);

    console.log("User profile response:", response.data);

    dispatch(profileSlice.actions.fetchProfileSuccess(response.data));
  } catch (error: unknown) {
    handleAxiosError(error, dispatch, profileSlice.actions.fetchProfileFailure);
  }
};

// Fetch user profile
export const fetchAUserProfile = (uid?: string) => async (dispatch: AppDispatch) => {
  dispatch(profileSlice.actions.fetchAProfileStart());

  try {
    // Get UID from localStorage if not provided
    const userId = uid || localStorage.getItem("uid");
    if (!userId) throw new Error("User ID is undefined");
    console.log(`Fetching user profile for UID: ${userId}...`);

    const response = await axios.get(`https://gigartz.onrender.com/user/${userId}`);

    console.log("User profile response:", response.data);

    dispatch(profileSlice.actions.fetchAProfileSuccess(response.data));
  } catch (error: unknown) {
    handleAxiosError(error, dispatch, profileSlice.actions.fetchAProfileFailure);
  }
};


// Fetch all user profiles
export const fetchAllProfiles = () => async (dispatch: AppDispatch) => {
  // dispatch(profileSlice.actions.fetchProfileStart());

  try {
    console.log("Fetching user profiles");
    const response = await axios.get(`https://gigartz.onrender.com/users/`);
    console.log("User profile responses:", response.data);

    dispatch(profileSlice.actions.getProfileSuccess(response.data));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const data = axiosError.response.data as ErrorResponse;
        // The request was made and the server responded with an error
        console.error("Response error:", data.error || data.message);
        dispatch(
          profileSlice.actions.fetchProfileFailure(
            data.error || data.message || "Failed to fetch user profile"
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
        // Send notification after successful update
        notify(dispatch, {
          type: "profile_update",
          data: { name: updatedData.name, date: new Date().toLocaleDateString() },
        });
        console.log(updateProfile);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            const data = axiosError.response.data as ErrorResponse;
            // The request was made and the server responded with an error
            console.error("Response error:", data.error || data.message);
            dispatch(
              profileSlice.actions.updateProfileFailure(
                data.message || data.error ||
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
  (userId: string, genre: string[], acceptTips: boolean, acceptBookings: boolean, services: unknown) =>
    async (dispatch: AppDispatch) => {
      dispatch(profileSlice.actions.updateProfileStart());

      console.log(userId, acceptTips, genre, acceptBookings, services);

      try {
        // Send the updated profile data to the API endpoint
        const response = await axios.post(
          "https://gigartz.onrender.com/switchUser",
          { userId, acceptTips, genre, acceptBookings, services }
        );

        console.log("User profile update response:", response.data);

        // Dispatch success action with the updated profile response if needed
        dispatch(
          profileSlice.actions.updateProfileSuccess(response.data.updatedProfile)
        );
        // Send profile switch notification
        notify(dispatch, {
          type: "profile_switch",
          data: { name: response.data.updatedProfile?.name, date: new Date().toLocaleDateString() },
        });
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            const data = axiosError.response.data as ErrorResponse;
            // The request was made and the server responded with an error
            console.error("Response error:", data.error || data.message);
            dispatch(
              profileSlice.actions.updateProfileFailure(
                data.error || data.message || "Failed to fetch user profile"
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
        profilePicture: customUser.profilePicture || null,
        coverPic: customUser.profilePicUrl || null,
        coverProfile: customUser.coverProfile || null,
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
          profileSlice.actions.followProfileSuccess(
            (response.data as ErrorResponse)?.message || "Followed successfully"
          )
        );
        // Send follower notification
        notify(dispatch, {
          type: "follower",
          data: { username: response.data?.message || followingId },
        });
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            const data = axiosError.response.data as ErrorResponse;
            // The request was made and the server responded with an error
            console.error("Follow response error:", data.message || data.error);
            dispatch(
              profileSlice.actions.updateProfileFailure(
                data.message || data.error ||
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
        // Send booking notification
        notify(dispatch, {
          type: "booking",
          data: { service: bookingData.eventDetails, date: bookingData.date },
        });
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            const data = axiosError.response.data as ErrorResponse;
            // The request was made and the server responded with an error
            console.error("Response error:", data.error || data.message);
            dispatch(
              profileSlice.actions.createBookingFailure(
                data.error || data.message || "Failed to book freelancer"
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
  logout,
} = profileSlice.actions;

export default profileSlice.reducer;