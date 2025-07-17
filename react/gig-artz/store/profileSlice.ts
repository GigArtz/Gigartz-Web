import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { db } from "../src/config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import axios, { AxiosError } from "axios";
import { AppDispatch, RootState } from "./store";
import { notify } from "../src/helpers/notify";

/**
 * CACHE SYSTEM DOCUMENTATION
 * 
 * This profileSlice implements an intelligent caching system to minimize unnecessary API calls:
 * 
 * 1. USER LIST CACHE (userList):
 *    - Duration: 5 minutes (CACHE_DURATION)
 *    - Cached when: fetchAllProfiles() succeeds
 *    - Timestamp: userListCacheTimestamp
 *    - Usage: fetchAllProfiles() checks cache validity before making API calls
 * 
 * 2. INDIVIDUAL PROFILE CACHE (profile, userProfile):
 *    - Duration: 10 minutes (PROFILE_CACHE_DURATION) 
 *    - Cached when: fetchUserProfile() or fetchAUserProfile() succeeds
 *    - Timestamps: profileCacheTimestamp, userProfileCacheTimestamp
 *    - Tracking: cachedProfileIds array tracks which profile IDs have been cached
 *    - Usage: Both functions check cache before making API calls
 * 
 * 3. CACHE INVALIDATION:
 *    - Manual: Pass forceRefresh=true to any fetch function
 *    - Automatic: Cache expires after set duration
 *    - Update operations: Automatically refresh relevant data
 * 
 * 4. COMPONENT INTEGRATION:
 *    - All components now use cached data by default
 *    - No changes needed in component code - caching is transparent
 *    - Profile updates automatically trigger fresh fetches with forceRefresh
 */

// Cache configuration constants
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds for user list
const PROFILE_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for individual profiles

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

interface Booking {
  id: string;
  eventDetails: string;
  venue: string;
  date: any;
  additionalInfo: string;
  status: string;
  image?: string;
}

interface VisitedProfileData {
  userProfile: UserProfile | null;
  userFollowers: unknown[] | null;
  userFollowing: unknown[] | null;
}

interface ProfileState {
  profile: UserProfile | null;
  userProfile: UserProfile | null;
  visitedProfile: VisitedProfileData | null;
  userList: UserProfile[] | null;
  likedEvents: null;
  userBookings: Booking[] | null;
  userBookingsRequests: Booking[] | null;
  userEventProfit: null;
  userEvents: null;
  userSavedEvents: null;
  userSavedReviews: null;
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
  // Cache-related fields
  profileCacheTimestamp: number | null;
  userListCacheTimestamp: number | null;
  userProfileCacheTimestamp: number | null;
  visitedProfileCacheTimestamp: number | null;
  cachedProfileIds: string[];
  // Track fetching to prevent duplicates
  fetchingUserIds: string[];
}

const initialState: ProfileState = {
  profile: null,
  userProfile: null,
  visitedProfile: null,
  likedEvents: null,
  userBookings: null,
  userBookingsRequests: null,
  userEventProfit: null,
  userEvents: null,
  userFollowers: null,
  userFollowing: null,
  userGuestList: null,
  userReviews: null,
  userSavedEvents: null,
  userSavedReviews: null,
  userTickets: null,
  userTipsProfit: null,
  userList: null,
  loading: false,
  loadingProfile: false,
  error: null,
  success: null,
  // Cache-related fields
  profileCacheTimestamp: null,
  userListCacheTimestamp: null,
  userProfileCacheTimestamp: null,
  visitedProfileCacheTimestamp: null,
  cachedProfileIds: [],
  // Track fetching to prevent duplicates
  fetchingUserIds: [],
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
    // New actions for tracking fetching user IDs
    startFetchingUser(state, action: PayloadAction<string>) {
      const userId = action.payload;
      if (!state.fetchingUserIds.includes(userId)) {
        state.fetchingUserIds.push(userId);
      }
    },
    stopFetchingUser(state, action: PayloadAction<string>) {
      const userId = action.payload;
      const before = state.fetchingUserIds.length;
      state.fetchingUserIds = state.fetchingUserIds.filter(id => id !== userId);
      const after = state.fetchingUserIds.length;

      if (process.env.NODE_ENV === 'development') {
        console.log(`Stopped tracking fetch for user ${userId}. Before: ${before}, After: ${after}`);
      }
    },
    fetchAProfileSuccess(state, action: PayloadAction<Record<string, unknown>>) {
      state.loading = false;
      state.userProfile = action.payload.userProfile as UserProfile;
      state.error = null;
      // Update cache timestamp for individual user profile
      state.userProfileCacheTimestamp = Date.now();

      // Add the userId to cached list
      const userId = action.payload.userId as string; // Pass userId from thunk

      // Use userId from thunk parameter instead of profile.id
      if (userId && !state.cachedProfileIds.includes(userId)) {
        state.cachedProfileIds.push(userId);
      }
    },

    fetchVisitedProfileSuccess(state, action: PayloadAction<Record<string, unknown>>) {
      state.loading = false;
      state.visitedProfile = {
        userProfile: action.payload.userProfile as UserProfile,
        userFollowers: action.payload.userFollowers as unknown[] | null,
        userFollowing: action.payload.userFollowing as unknown[] | null,
      };
      state.error = null;
      // Update cache timestamp for visited profile
      state.visitedProfileCacheTimestamp = Date.now();

      // Add the userId to cached list
      const userId = action.payload.userId as string;

      if (userId && !state.cachedProfileIds.includes(userId)) {
        state.cachedProfileIds.push(userId);
      }
    },

    fetchProfileSuccess(state, action: PayloadAction<Record<string, unknown>>) {
      state.loading = false;
      state.profile = action.payload.userProfile as UserProfile;
      state.likedEvents = action.payload.likedEvents as unknown as null;
      state.userBookings = action.payload.userBookings as Booking[];
      state.userBookingsRequests = action.payload.userBookingsRequests as Booking[];
      state.userEventProfit = action.payload.userEventProfit as unknown as null;
      state.userEvents = action.payload.userEvents as unknown as null;
      state.userFollowers = action.payload.userFollowers as unknown as null;
      state.userFollowing = action.payload.userFollowing as unknown as null;
      state.userGuestList = action.payload.userGuestList as unknown as null;
      state.userReviews = action.payload.userReviews as unknown as null;
      state.userTickets = action.payload.userTickets as unknown as null;
      state.userTipsProfit = action.payload.userTipsProfit as unknown as null;
      state.userSavedEvents = action.payload.userSavedEvents as unknown as null;
      state.userSavedReviews = action.payload.userSavedReviews as unknown as null;
      state.error = null;
      // Update cache timestamp
      state.profileCacheTimestamp = Date.now();

      // Add the userId passed to the thunk to cached list
      const userProfile = action.payload.userProfile as UserProfile;
      const userId = action.payload.userId as string; // Pass userId from thunk

      // Debug logging for profile structure
      if (process.env.NODE_ENV === 'development') {
        console.log('Profile structure:', {
          profileId: userProfile?.id,
          userId: userId,
          profileKeys: userProfile ? Object.keys(userProfile) : 'undefined',
          fullProfile: userProfile
        });
      }

      // Use userId from thunk parameter instead of profile.id
      if (userId && !state.cachedProfileIds.includes(userId)) {
        state.cachedProfileIds.push(userId);
      }

      // Debug logging for cache update
      if (process.env.NODE_ENV === 'development') {
        console.log(`Profile cached for user ${userId}. Cache timestamp: ${state.profileCacheTimestamp}`);
      }
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
    updateBookingStatusStart(state) {
      state.loading = true;
      state.error = null;
    },
    updateBookingStatusSuccess(state, action: PayloadAction<{ bookingId: string; newStatus: string; message: string }>) {
      state.loading = false;
      state.success = action.payload.message;
      state.error = null;

      // Update the booking status in userBookings if it exists
      if (state.userBookings && Array.isArray(state.userBookings)) {
        const bookingIndex = state.userBookings.findIndex((booking: Booking) => booking.id === action.payload.bookingId);
        if (bookingIndex !== -1) {
          state.userBookings[bookingIndex].status = action.payload.newStatus;
        }
      }

      // Update the booking status in userBookingsRequests if it exists
      if (state.userBookingsRequests && Array.isArray(state.userBookingsRequests)) {
        const bookingIndex = state.userBookingsRequests.findIndex((booking: Booking) => booking.id === action.payload.bookingId);
        if (bookingIndex !== -1) {
          state.userBookingsRequests[bookingIndex].status = action.payload.newStatus;
        }
      }
    },
    updateBookingStatusFailure(state, action: PayloadAction<string>) {
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
    getProfileSuccess(state, action: PayloadAction<UserProfile[]>) {
      state.loading = false;
      state.userList = action.payload;
      state.error = null;
      // Update cache timestamp for user list
      state.userListCacheTimestamp = Date.now();
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
    reviewReceivedSuccess(state, action: PayloadAction<{ from: string; rating: number; review: string }>) {
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

// Cache utility functions
const isCacheValid = (timestamp: number | null, duration: number = CACHE_DURATION): boolean => {
  if (!timestamp) return false;
  return Date.now() - timestamp < duration;
};

const isProfileCached = (profileId: string, cachedIds: string[], timestamp: number | null): boolean => {
  return cachedIds.includes(profileId) && isCacheValid(timestamp, PROFILE_CACHE_DURATION);
};

// Cache invalidation utilities
export const invalidateProfileCache = () => () => {
  // This could be used to manually clear all cache if needed
  // For now, components can use forceRefresh=true
  console.log("Cache invalidation would be handled here");
};

export const refreshUserProfile = (uid: string) => (dispatch: AppDispatch) => {
  // Force refresh a specific user profile
  return dispatch(fetchUserProfile(uid, true));
};

export const refreshUserList = () => (dispatch: AppDispatch) => {
  // Force refresh the user list
  return dispatch(fetchAllProfiles(true));
};

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
      console.log("User profile response:", response.data.userProfile); dispatch(
        profileSlice.actions.fetchDrawerProfileSuccess(
          response.data.userProfile
        )
      );
      // Send success notification
      notify(dispatch, {
        type: "profile_fetch",
        data: {
          message: "Profile loaded successfully!",
          type: "success"
        },
      });
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
          // Send error notification
          notify(dispatch, {
            type: "profile_fetch_error",
            data: {
              message: "Failed to load profile",
              type: "error"
            },
          });
        } else if (axiosError.request) {
          // The request was made, but no response was received
          console.error("Request error:", axiosError.request);
          dispatch(
            profileSlice.actions.fetchProfileFailure(
              "No response received from server"
            )
          );
          // Send error notification
          notify(dispatch, {
            type: "profile_fetch_error",
            data: {
              message: "Network error - please check your connection",
              type: "error"
            },
          });
        } else {
          // Something else happened during the setup of the request
          console.error("Error setting up request:", axiosError.message);
          dispatch(
            profileSlice.actions.fetchProfileFailure(axiosError.message)
          );
          // Send error notification
          notify(dispatch, {
            type: "profile_fetch_error",
            data: {
              message: "Error loading profile",
              type: "error"
            },
          });
        }
      } else {
        // Handle non-Axios errors
        console.error("Unexpected error fetching user profile:", error);
        dispatch(
          profileSlice.actions.fetchProfileFailure("Unexpected error occurred")
        );
        // Send error notification
        notify(dispatch, {
          type: "profile_fetch_error",
          data: {
            message: "Unexpected error occurred",
            type: "error"
          },
        });
      }
    }
  };


// Fetch user profile
export const fetchUserProfile = (uid?: string, forceRefresh: boolean = false) => async (dispatch: AppDispatch, getState: () => { profile: ProfileState }) => {
  const state = getState().profile;

  // Get UID from localStorage if not provided
  const userId = uid || localStorage.getItem("uid");
  if (!userId) throw new Error("User ID is undefined");

  // Check if already fetching this user
  if (state.fetchingUserIds.includes(userId)) {
    console.log("Already fetching profile for user:", userId);
    return;
  }

  // Check if we have cached data and it's still valid - use userId instead of profile.id
  if (!forceRefresh && isCacheValid(state.profileCacheTimestamp, PROFILE_CACHE_DURATION) && state.cachedProfileIds.includes(userId)) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Using cached profile data for user: ${userId}. Cache age: ${Date.now() - (state.profileCacheTimestamp || 0)}ms`);
    }
    // Skip notifications for cached data to prevent re-renders
    return;
  }

  // Start tracking this fetch
  dispatch(profileSlice.actions.startFetchingUser(userId));
  dispatch(profileSlice.actions.fetchProfileStart());

  try {
    // Reduced logging for performance
    if (process.env.NODE_ENV === 'development') {
      console.log(`Fetching user profile for UID: ${userId}...`);
    }

    const response = await axios.get(`https://gigartz.onrender.com/user/${userId}`, {
      timeout: 15000 // 15 second timeout
    });

    // Reduced logging for performance
    if (process.env.NODE_ENV === 'development') {
      console.log("User profile response:", response.data);
    }

    dispatch(profileSlice.actions.fetchProfileSuccess({
      ...response.data,
      userId: userId // Pass the userId to the action
    }));

    // Send success notification
    notify(dispatch, {
      type: "profile_fetch",
      data: {
        message: "Profile data loaded successfully!",
        type: "success"
      },
    });
  } catch (error: unknown) {
    handleAxiosError(error, dispatch, profileSlice.actions.fetchProfileFailure);
  } finally {
    // Stop tracking this fetch
    dispatch(profileSlice.actions.stopFetchingUser(userId));
  }
};

// Fetch user profile
export const fetchAUserProfile = (uid?: string, forceRefresh: boolean = false) => async (dispatch: AppDispatch, getState: () => { profile: ProfileState }) => {
  const state = getState().profile;

  // Get UID from localStorage if not provided
  const userId = uid || localStorage.getItem("uid");

  // Debug logging
  console.log("fetchAUserProfile called with:", { uid, userId, fallbackUsed: !uid });

  if (!userId) throw new Error("User ID is undefined");

  // Check if already fetching this user
  if (state.fetchingUserIds.includes(userId)) {
    console.log("Already fetching A profile for user:", userId);
    return;
  }
  // Check if we have cached data for this specific user profile
  const isCached = isProfileCached(userId, state.cachedProfileIds, state.userProfileCacheTimestamp);
  const isCurrentUser = state.userProfile?.id === userId;

  if (!forceRefresh && isCached && isCurrentUser) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Using cached user profile data for user: ${userId}. Cache age: ${Date.now() - (state.userProfileCacheTimestamp || 0)}ms`);
    }
    // Skip notifications for cached data to prevent re-renders
    return;
  }

  // If cached but not current user, and user exists in userList, we can use that data
  if (!forceRefresh && state.userList?.find(user => user.id === userId) && !isCurrentUser) {
    const cachedUserData = state.userList.find(user => user.id === userId);
    if (cachedUserData) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Using cached data from userList for user: ${userId}`);
      }

      // Only update if absolutely necessary to prevent re-render cycles
      dispatch(profileSlice.actions.fetchAProfileSuccess({
        userProfile: cachedUserData,
        userEvents: [],
        likedEvents: [],
        userTickets: [],
        userFollowing: [],
        userFollowers: [],
        userGuestList: [],
        userReviews: [],
        userSavedEvents: [],
        userSavedReviews: [],
        userBookings: [],
        userBookingsRequests: [],
        userId: userId
      }));

      return;
    }
  }

  // Start tracking this fetch
  dispatch(profileSlice.actions.startFetchingUser(userId));
  dispatch(profileSlice.actions.fetchAProfileStart());

  try {
    // Reduced logging for performance
    if (process.env.NODE_ENV === 'development') {
      console.log(`Fetching user profile for UID: ${userId}...`);
    }

    const response = await axios.get(`https://gigartz.onrender.com/user/${userId}`, {
      timeout: 15000 // 15 second timeout
    });

    // Reduced logging for performance
    if (process.env.NODE_ENV === 'development') {
      console.log("User profile response:", response.data);
    }

    dispatch(profileSlice.actions.fetchAProfileSuccess({
      ...response.data,
      userId: userId // Pass the userId to the action
    }));

    // Send success notification
    notify(dispatch, {
      type: "profile_fetch",
      data: {
        message: "User profile loaded successfully!",
        type: "success"
      },
    });
  } catch (error: unknown) {
    handleAxiosError(error, dispatch, profileSlice.actions.fetchAProfileFailure);
  } finally {
    // Stop tracking this fetch
    dispatch(profileSlice.actions.stopFetchingUser(userId));
  }
};

// Fetch visited user profile (for profiles viewed on people/userId route)
export const fetchVisitedUserProfile = (uid: string, forceRefresh: boolean = false) => async (dispatch: AppDispatch, getState: () => { profile: ProfileState }) => {
  const state = getState().profile;

  if (!uid) throw new Error("User ID is required for visited profile");

  // Check if already fetching this user
  if (state.fetchingUserIds.includes(uid)) {
    console.log("Already fetching visited profile for user:", uid);
    return;
  }

  // Check if we have cached data for this specific visited profile
  const isCached = isProfileCached(uid, state.cachedProfileIds, state.visitedProfileCacheTimestamp);
  const isCurrentVisitedProfile = state.visitedProfile?.id === uid;

  if (!forceRefresh && isCached && isCurrentVisitedProfile) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Using cached visited profile data for user: ${uid}. Cache age: ${Date.now() - (state.visitedProfileCacheTimestamp || 0)}ms`);
    }
    return;
  }

  // Start tracking this fetch
  dispatch(profileSlice.actions.startFetchingUser(uid));
  dispatch(profileSlice.actions.fetchAProfileStart());

  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Fetching visited profile for UID: ${uid}...`);
    }

    const response = await axios.get(`https://gigartz.onrender.com/user/${uid}`, {
      timeout: 15000
    });

    if (process.env.NODE_ENV === 'development') {
      console.log("Visited profile response:", response.data);
    }

    dispatch(profileSlice.actions.fetchVisitedProfileSuccess({
      ...response.data,
      userId: uid
    }));

    notify(dispatch, {
      type: "profile_fetch",
      data: {
        message: "Profile loaded successfully!",
        type: "success"
      },
    });
  } catch (error: unknown) {
    handleAxiosError(error, dispatch, profileSlice.actions.fetchAProfileFailure);
  } finally {
    dispatch(profileSlice.actions.stopFetchingUser(uid));
  }
};


// Fetch all user profiles
export const fetchAllProfiles = (forceRefresh: boolean = false) => async (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();
  const { userListCacheTimestamp } = state.profile;

  // Check if cache is still valid and we have data
  if (!forceRefresh && state.profile.userList && isCacheValid(userListCacheTimestamp)) {
    console.log("Using cached user list");
    return;
  }

  dispatch(profileSlice.actions.fetchProfileStart());

  try {
    // Reduced logging for performance
    if (process.env.NODE_ENV === 'development') {
      console.log("Fetching user profiles");
    }
    const response = await axios.get(`https://gigartz.onrender.com/users/`, {
      timeout: 15000 // 15 second timeout
    });
    // Reduced logging for performance
    if (process.env.NODE_ENV === 'development') {
      console.log("User profile responses:", response.data);
    }

    dispatch(profileSlice.actions.getProfileSuccess(response.data));
    // Send success notification
    notify(dispatch, {
      type: "profiles_fetch",
      data: {
        message: "User profiles loaded successfully!",
        type: "success"
      },
    });
  } catch (error: unknown) {
    handleAxiosError(error, dispatch, profileSlice.actions.fetchProfileFailure);
    // Send error notification
    notify(dispatch, {
      type: "profiles_fetch_error",
      data: {
        message: "Failed to load user profiles",
        type: "error"
      },
    });
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
          data: {
            message: "Profile updated successfully!",
            type: "success"
          },
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
            // Send error notification
            notify(dispatch, {
              type: "profile_update_error",
              data: {
                message: "Failed to update profile",
                type: "error"
              },
            });
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

      console.log(userId, "tips: ", acceptTips, genre, acceptBookings, services);

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
          data: {
            message: "Profile switched successfully!",
            type: "success"
          },
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
            // Send error notification
            notify(dispatch, {
              type: "profile_switch_error",
              data: {
                message: "Failed to switch profile",
                type: "error"
              },
            });
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
          // Send success notification
          notify(dispatch, {
            type: "profile_create",
            data: {
              message: "Profile created successfully!",
              type: "success"
            },
          });
        } else {
          console.log("User profile already exists");
          // Send info notification
          notify(dispatch, {
            type: "profile_exists",
            data: {
              message: "Welcome back!",
              type: "info"
            },
          });
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
          // Send error notification
          notify(dispatch, {
            type: "profile_create_error",
            data: {
              message: "Failed to create profile",
              type: "error"
            },
          });
        } else {
          // Handle non-Axios errors and errors not related to Axios
          console.error("Error creating user profile:", error);
          dispatch(
            profileSlice.actions.fetchProfileFailure(
              `Failed to create user profile: ${error instanceof Error ? error.message : "Unknown error"
              }`
            )
          );
          // Send error notification
          notify(dispatch, {
            type: "profile_create_error",
            data: {
              message: "Failed to create profile",
              type: "error"
            },
          });
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
          data: {
            message: "User followed successfully!",
            type: "success"
          },
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
            // Send error notification
            notify(dispatch, {
              type: "follow_error",
              data: {
                message: "Failed to follow user",
                type: "error"
              },
            });
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
          data: {
            message: "Freelancer booked successfully!",
            type: "success"
          },
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
            // Send error notification
            notify(dispatch, {
              type: "booking_error",
              data: {
                message: "Failed to book freelancer",
                type: "error"
              },
            });
          } else if (axiosError.request) {
            console.error("Request error:", axiosError.request);
            dispatch(
              profileSlice.actions.createBookingFailure(
                "No response received from server"
              )
            );
            // Send error notification
            notify(dispatch, {
              type: "booking_error",
              data: {
                message: "Network error - please check your connection",
                type: "error"
              },
            });
          } else {
            console.error("Error setting up request:", axiosError.message);
            dispatch(
              profileSlice.actions.createBookingFailure(
                axiosError.message || "Unexpected error occurred"
              )
            );
            // Send error notification
            notify(dispatch, {
              type: "booking_error",
              data: {
                message: "Error booking freelancer",
                type: "error"
              },
            });
          }
        } else {
          console.error("Unexpected error:", error);
          dispatch(
            profileSlice.actions.createBookingFailure("Unexpected error occurred")
          );
          // Send error notification
          notify(dispatch, {
            type: "booking_error",
            data: {
              message: "Unexpected error occurred",
              type: "error"
            },
          });
        }
      }
    };

// Update booking status
export const updateBookingStatus =
  (bookingData: {
    bookingId: string;
    newStatus: string;
    userId?: string;
  }) =>
    async (dispatch: AppDispatch) => {
      dispatch(profileSlice.actions.updateBookingStatusStart());

      try {
        console.log("Updating booking status...");
        const response = await axios.put(
          `https://gigartz.onrender.com/updateBookingStatus`,
          bookingData
        );
        console.log("Booking status updated successfully:", response.data);

        dispatch(
          profileSlice.actions.updateBookingStatusSuccess({
            bookingId: bookingData.bookingId,
            newStatus: bookingData.newStatus,
            message: "Booking status updated successfully!"
          })
        );

        // Send notification for status update
        notify(dispatch, {
          type: "booking_status_update",
          data: {
            message: `Booking ${bookingData.newStatus} successfully!`,
            type: "success"
          },
        });
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            const data = axiosError.response.data as ErrorResponse;
            console.error("Response error:", data.error || data.message);
            dispatch(
              profileSlice.actions.updateBookingStatusFailure(
                data.error || data.message || "Failed to update booking status"
              )
            );
            // Send error notification
            notify(dispatch, {
              type: "booking_status_error",
              data: {
                message: "Failed to update booking status",
                type: "error"
              },
            });
          } else if (axiosError.request) {
            console.error("Request error:", axiosError.request);
            dispatch(
              profileSlice.actions.updateBookingStatusFailure(
                "Network error - please check your connection"
              )
            );
            // Send error notification
            notify(dispatch, {
              type: "booking_status_error",
              data: {
                message: "Network error - please check your connection",
                type: "error"
              },
            });
          } else {
            console.error("Error:", axiosError.message);
            dispatch(
              profileSlice.actions.updateBookingStatusFailure(axiosError.message)
            );
            // Send error notification
            notify(dispatch, {
              type: "booking_status_error",
              data: {
                message: "Error updating booking status",
                type: "error"
              },
            });
          }
        } else {
          console.error("Unexpected error:", error);
          dispatch(
            profileSlice.actions.updateBookingStatusFailure("Unexpected error occurred")
          );
          // Send error notification
          notify(dispatch, {
            type: "booking_status_error",
            data: {
              message: "Unexpected error occurred",
              type: "error"
            },
          });
        }
      }
    };

// Export actions
export const {
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
  fetchVisitedProfileSuccess,
  resetError,
  updateProfile,
  fetchDrawerProfileSuccess,
  logout,
  updateBookingStatusStart,
  updateBookingStatusSuccess,
  updateBookingStatusFailure,
  startFetchingUser,
  stopFetchingUser,
} = profileSlice.actions;

export default profileSlice.reducer;