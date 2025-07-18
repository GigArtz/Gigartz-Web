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
 *    - Duration: 10 minutes (PROFILE_CACHE_DURATION) for regular profiles
 *    - Duration: 2 minutes (VISITED_PROFILE_CACHE_DURATION) for visited profiles
 *    - Cached when: fetchUserProfile() or fetchAUserProfile() succeeds
 *    - Timestamps: profileCacheTimestamp, userProfileCacheTimestamp, visitedProfileCacheTimestamp
 *    - Tracking: cachedProfileIds array tracks which profile IDs have been cached
 *    - Usage: All functions check cache before making API calls
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
 * 
 * 5. DUPLICATE REQUEST PREVENTION:
 *    - fetchingUserIds tracks active fetch operations by user ID
 *    - Debounce mechanism prevents rapid successive calls for the same user
 *    - Fetch operations are automatically deduped when multiple components request the same data
 */

// Cache configuration constants
const PROFILE_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for individual profiles
const VISITED_PROFILE_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for visited profiles (shorter to allow quick updates)

// Store last fetch timestamp by user ID to implement debouncing
const lastFetchTimestamps: Record<string, number> = {};
// Increase debounce interval to prevent rapid successive calls
const DEBOUNCE_INTERVAL = 5000; // 5 seconds

// Track active requests to avoid duplicate simultaneous requests
const activeRequests: Set<string> = new Set();

// Check if a fetch for this user ID should be debounced (too soon after last fetch)
const shouldDebounce = (userId: string): boolean => {
  const lastFetch = lastFetchTimestamps[userId];
  const now = Date.now();

  // If this is an active request or was fetched too recently, debounce it
  if (activeRequests.has(userId) || (lastFetch && now - lastFetch < DEBOUNCE_INTERVAL)) {
    if (process.env.NODE_ENV === 'development') {
      if (activeRequests.has(userId)) {
        console.log(`Debouncing fetch for user: ${userId} (Already has active request)`);
      } else {
        console.log(`Debouncing fetch for user: ${userId} (Last fetch was ${now - lastFetch}ms ago)`);
      }
    }
    return true;
  }

  // Mark this request as active
  activeRequests.add(userId);

  // Update the timestamp for this user
  lastFetchTimestamps[userId] = now;
  return false;
};

// Function to mark a request as completed
const markRequestComplete = (userId: string): void => {
  if (activeRequests.has(userId)) {
    activeRequests.delete(userId);
  }
};// Extend the Window interface to include 'store'
declare global {
  interface Window {
    store?: {
      dispatch?: (action: unknown) => unknown;
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
  bookingRequests: unknown[]; // Flexible type for booking requests
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
  // Nested data properties that come from API responses
  likedEvents?: unknown[];
  myBookings?: Booking[];
  userEvents?: unknown[];
  userFollowing?: unknown[];
  userFollowers?: unknown[];
  userReviews?: unknown[];
}

interface Booking {
  id: string;
  eventDetails: string;
  venue: string;
  date: string | number | Date; // Support multiple date formats
  additionalInfo: string;
  status: string;
  image?: string;
}

interface ProfileState {
  profile: UserProfile | null;
  userProfile: UserProfile | null;
  visitedProfile: {
    userProfile: UserProfile | null;
    userEvents: unknown[];
    userFollowers: unknown[];
    userFollowing: unknown[];
    userGuestList: unknown[];
    userReviews: unknown[];
    userTickets: unknown[];
    userSavedEvents: unknown[];
    userSavedReviews: unknown[];
    userBookings: Booking[];
    userBookingsRequests: Booking[];
    likedEvents: unknown[];
  } | null;
  // Other user's data (from fetchAUserProfile)
  otherUserData: {
    userEvents: unknown[];
    userFollowers: unknown[];
    userFollowing: unknown[];
    userGuestList: unknown[];
    userReviews: unknown[];
    userTickets: unknown[];
    userSavedEvents: unknown[];
    userSavedReviews: unknown[];
    userBookings: Booking[];
    userBookingsRequests: Booking[];
    likedEvents: unknown[];
  } | null;
  userList: UserProfile[];
  likedEvents: unknown[];
  userBookings: Booking[];
  userBookingsRequests: Booking[];
  userEventProfit: unknown | null;
  userEvents: unknown[];
  userSavedEvents: unknown[];
  userSavedReviews: unknown[];
  userFollowers: unknown[];
  userFollowing: unknown[];
  userGuestList: unknown[];
  userReviews: unknown[];
  userTickets: unknown[];
  userTipsProfit: unknown | null;
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
  cachedVisitedProfileIds: string[];
  // Per-user cache timestamps to track individual user profiles
  userCacheTimestamps: Record<string, number>;
  // Track fetching to prevent duplicates
  fetchingUserIds: string[];
}

const initialState: ProfileState = {
  profile: null,
  userProfile: null,
  visitedProfile: null,
  otherUserData: null,
  // Initialize arrays as empty arrays instead of null
  likedEvents: [],
  userBookings: [],
  userBookingsRequests: [],
  userEventProfit: null,
  userEvents: [],
  userFollowers: [],
  userFollowing: [],
  userGuestList: [],
  userReviews: [],
  userSavedEvents: [],
  userSavedReviews: [],
  userTickets: [],
  userTipsProfit: null,
  userList: [],
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
  cachedVisitedProfileIds: [],
  // Per-user cache timestamps
  userCacheTimestamps: {},
  // Track fetching to prevent duplicates
  fetchingUserIds: [],
};

// Cache validation helper with minimal logging
const isCacheValid = (timestamp: number | null, duration: number = PROFILE_CACHE_DURATION) => {
  // If no timestamp exists, cache is invalid
  if (timestamp === null) return false;

  const cacheAge = Date.now() - timestamp;
  const valid = cacheAge < duration;

  // Only log during development and for invalid caches (to help debugging)
  if (process.env.NODE_ENV === 'development' && !valid) {
    console.log(`Cache expired: age=${Math.round(cacheAge / 1000)}s, max=${Math.round(duration / 1000)}s`);
  }

  return valid;
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    fetchProfileStart(state, action: PayloadAction<{ userId: string; forceRefresh?: boolean } | undefined>) {
      if (!action.payload) {
        console.error('fetchProfileStart called without payload');
        return;
      }

      const { userId, forceRefresh } = action.payload;

      // Skip if already fetching or if this request should be debounced
      if (!forceRefresh && (state.fetchingUserIds.includes(userId) || shouldDebounce(userId))) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`Already fetching profile for user: ${userId}`);
        }
        return;
      }

      // Skip if we have valid cached data
      if (!forceRefresh && isCacheValid(state.userCacheTimestamps[userId])) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`Cache is valid for user: ${userId}, skipping fetch.`);
        }
        return;
      }

      // If we get here, we need to fetch
      state.fetchingUserIds.push(userId);
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
    // New actions for tracking fetching user IDs with improved logging
    startFetchingUser(state, action: PayloadAction<string>) {
      const userId = action.payload;
      if (!state.fetchingUserIds.includes(userId)) {
        state.fetchingUserIds.push(userId);
        // Only log in development and at a reduced frequency
        if (process.env.NODE_ENV === 'development' && state.fetchingUserIds.length <= 3) {
          console.log(`Started tracking fetch for user: ${userId} (Active: ${state.fetchingUserIds.length})`);
        }
      }
    },
    stopFetchingUser(state, action: PayloadAction<string>) {
      const userId = action.payload;
      const wasFetching = state.fetchingUserIds.includes(userId);
      state.fetchingUserIds = state.fetchingUserIds.filter(id => id !== userId);

      // Only log in development and at a reduced frequency
      if (process.env.NODE_ENV === 'development' && wasFetching && state.fetchingUserIds.length <= 3) {
        console.log(`Stopped tracking fetch for user: ${userId} (Remaining: ${state.fetchingUserIds.length})`);
      }
    },
    fetchAProfileSuccess(state, action: PayloadAction<Record<string, unknown>>) {
      state.loading = false;
      state.userProfile = action.payload.userProfile as UserProfile;
      // Store all the related data for the other user in separate state
      state.otherUserData = {
        userEvents: Array.isArray(action.payload.userEvents) ? action.payload.userEvents : [],
        userFollowers: Array.isArray(action.payload.userFollowers) ? action.payload.userFollowers : [],
        userFollowing: Array.isArray(action.payload.userFollowing) ? action.payload.userFollowing : [],
        userGuestList: Array.isArray(action.payload.userGuestList) ? action.payload.userGuestList : [],
        userReviews: Array.isArray(action.payload.userReviews) ? action.payload.userReviews : [],
        userTickets: Array.isArray(action.payload.userTickets) ? action.payload.userTickets : [],
        userSavedEvents: Array.isArray(action.payload.userSavedEvents) ? action.payload.userSavedEvents : [],
        userSavedReviews: Array.isArray(action.payload.userSavedReviews) ? action.payload.userSavedReviews : [],
        userBookings: Array.isArray(action.payload.userBookings) ? action.payload.userBookings : [],
        userBookingsRequests: Array.isArray(action.payload.userBookingsRequests) ? action.payload.userBookingsRequests : [],
        likedEvents: Array.isArray(action.payload.likedEvents) ? action.payload.likedEvents : [],
      };
      state.error = null;
      // Update cache timestamp for individual user profile
      state.userProfileCacheTimestamp = Date.now();

      // Add the userId to cached list
      const userId = action.payload.userId as string; // Pass userId from thunk

      // Update global user cache timestamp
      if (userId) {
        state.userCacheTimestamps[userId] = Date.now();
      }

      // Use userId from thunk parameter instead of profile.id
      if (userId && !state.cachedProfileIds.includes(userId)) {
        state.cachedProfileIds.push(userId);
      }
    },
    fetchVisitedProfileSuccess(state, action: PayloadAction<Record<string, unknown>>) {
      state.loading = false;
      // Initialize visitedProfile if it's null
      if (!state.visitedProfile) {
        state.visitedProfile = {
          userProfile: null,
          userEvents: [],
          userFollowers: [],
          userFollowing: [],
          userGuestList: [],
          userReviews: [],
          userTickets: [],
          userSavedEvents: [],
          userSavedReviews: [],
          userBookings: [],
          userBookingsRequests: [],
          likedEvents: [],
        };
      }

      const userId = action.payload.userId as string;

      if (process.env.NODE_ENV === 'development') {
        console.log(`Visited profile fetched for user: ${userId.substring(0, 6)}...`);
      }

      // Store the user profile
      state.visitedProfile.userProfile = action.payload.userProfile as UserProfile;

      // Debug log of available data
      if (process.env.NODE_ENV === 'development') {
        console.log('VisitedProfile payload keys:', Object.keys(action.payload));

        // Check what's in the response
        Object.keys(action.payload).forEach(key => {
          const value = action.payload[key];
          if (Array.isArray(value)) {
            console.log(`${key}: Array with ${value.length} items`);
          } else if (value === null) {
            console.log(`${key}: null`);
          } else if (value === undefined) {
            console.log(`${key}: undefined`);
          } else if (typeof value === 'object') {
            console.log(`${key}: Object`);
          } else {
            console.log(`${key}: ${typeof value}`);
          }
        });
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('REDUCER: Processing visitedProfile payload:', action.payload);
      }

      // Handle nested arrays with proper defaults to avoid empty values
      const arrayProperties = [
        'likedEvents', 'userBookings', 'userBookingsRequests', 'userEvents',
        'userFollowers', 'userFollowing', 'userGuestList', 'userReviews',
        'userTickets', 'userSavedEvents', 'userSavedReviews'
      ];

      // Enhanced array updating with more detailed debugging
      if (process.env.NODE_ENV === 'development') {
        console.log(`%c🔄 REDUCER ARRAY PROCESSING [${userId}]:`, 'background:#27ae60; color: white; font-weight: bold; padding: 3px; border-radius: 3px;');
      }

      arrayProperties.forEach(prop => {
        const value = action.payload[prop];
        const originalType = typeof value;
        const isValueArray = Array.isArray(value);

        // Save current state value for comparison
        const previousValue = state.visitedProfile[prop];
        const previousLength = Array.isArray(previousValue) ? previousValue.length : 0;

        if (isValueArray) {
          // Normal case - value is already an array
          state.visitedProfile[prop] = value;

          // Enhanced logging
          if (process.env.NODE_ENV === 'development') {
            console.log(`%c✅ ${prop}:`, 'color: #27ae60; font-weight: bold;',
              `Updated with ${value.length} items (was ${previousLength})`);

            if (value.length > 0 && value.length <= 3) {
              // For small arrays, log the whole thing
              console.log(`  Full array:`, value);
            } else if (value.length > 0) {
              // For larger arrays, just show the first item
              console.log(`  First item:`, value[0]);
            }
          }
        } else {
          // Value is not an array - log details about what it actually is
          state.visitedProfile[prop] = [];

          if (process.env.NODE_ENV === 'development') {
            if (value === undefined) {
              console.log(`%c❌ ${prop}:`, 'color: #e74c3c; font-weight: bold;',
                `Missing (undefined) in payload - initialized as empty array`);
            } else if (value === null) {
              console.log(`%c❌ ${prop}:`, 'color: #e74c3c; font-weight: bold;',
                `NULL in payload - initialized as empty array`);
            } else if (originalType === 'object') {
              console.log(`%c⚠️ ${prop}:`, 'color: #f39c12; font-weight: bold;',
                `Is an object but not an array - initialized as empty array`);
              console.log(`  Object keys:`, Object.keys(value as object));
              console.log(`  Value:`, value);
            } else {
              console.log(`%c⚠️ ${prop}:`, 'color: #f39c12; font-weight: bold;',
                `Unexpected type (${originalType}) - initialized as empty array`);
              console.log(`  Value:`, value);
            }
          }
        }
      });

      // Log the final state after updating
      if (process.env.NODE_ENV === 'development') {
        console.log('%c✅ REDUCER: FINAL STATE INSPECTION', 'background: #9b59b6; color: white; font-weight: bold; padding: 3px; border-radius: 3px;');

        const profileData = state.visitedProfile.userProfile;
        const profileSummary = profileData ? {
          id: profileData.id,
          name: profileData.name,
          followers: profileData.followers,
          following: profileData.following,
        } : 'null';

        console.log('User profile summary:', profileSummary);

        // Check for inconsistencies between counts and arrays
        const inconsistencies = [];
        if (profileData) {
          if (profileData.followers > 0 && (!state.visitedProfile.userFollowers || state.visitedProfile.userFollowers.length === 0)) {
            inconsistencies.push('User has followers count > 0 but userFollowers array is empty');
          }
          if (profileData.following > 0 && (!state.visitedProfile.userFollowing || state.visitedProfile.userFollowing.length === 0)) {
            inconsistencies.push('User has following count > 0 but userFollowing array is empty');
          }
        }

        if (inconsistencies.length > 0) {
          console.log('%c⚠️ DATA INCONSISTENCIES DETECTED:', 'color: #e74c3c; font-weight: bold;');
          console.log(inconsistencies);
        }

        // Array state summary
        console.log('%c📊 ARRAY STATE IN REDUX STORE:', 'font-weight: bold; color: #2980b9;');
        const arrayState = arrayProperties.reduce((acc, prop) => {
          acc[prop] = {
            length: state.visitedProfile[prop].length,
            type: Array.isArray(state.visitedProfile[prop]) ? 'array' : typeof state.visitedProfile[prop]
          };
          return acc;
        }, {} as Record<string, { length: number, type: string }>);

        console.table(arrayState);

        // Clear and concise summary of visited profile array counts
        const arraySummary = {};
        arrayProperties.forEach(prop => {
          arraySummary[prop] = state.visitedProfile[prop]?.length || 0;
        });
        console.log(`%c[ARRAY SUMMARY] Final visited profile arrays for ${action.payload.userId}:`, 'color: #16a085; font-weight: bold;', arraySummary);

        // FINAL ANALYSIS - Direct check for the issue the user reported
        const visitedUserProfileData = state.visitedProfile.userProfile;
        const emptyArraysButShouldHaveData = [];

        if (visitedUserProfileData) {
          if (visitedUserProfileData.followers > 0 && state.visitedProfile.userFollowers.length === 0) {
            emptyArraysButShouldHaveData.push('userFollowers');
          }

          if (visitedUserProfileData.following > 0 && state.visitedProfile.userFollowing.length === 0) {
            emptyArraysButShouldHaveData.push('userFollowing');
          }

          // Check other arrays that should have data
          if ('eventCount' in visitedUserProfileData &&
            typeof visitedUserProfileData.eventCount === 'number' &&
            visitedUserProfileData.eventCount > 0 &&
            state.visitedProfile.userEvents.length === 0) {
            emptyArraysButShouldHaveData.push('userEvents');
          }
        }

        if (emptyArraysButShouldHaveData.length > 0) {
          console.log(`%c🔴 CRITICAL ISSUE DETECTED: Empty arrays that should have data`,
            'background: #e74c3c; color: white; font-weight: bold; padding: 5px; border-radius: 3px; font-size: 14px;');
          console.log(`These arrays are empty but the profile counts indicate they should have data:`, emptyArraysButShouldHaveData);
          console.log(`This matches the user-reported issue: "These arrays are empty??! or not being correctly updated"`);
          console.log(`DIAGNOSIS: The API might not be returning these arrays, or they might be located elsewhere in the response structure.`);
        } else {
          console.log(`%c✅ NO CRITICAL ISSUES DETECTED`, 'background: #27ae60; color: white; font-weight: bold; padding: 5px; border-radius: 3px;');
          console.log(`All arrays with expected data are present. Any empty arrays likely represent actual empty collections.`);
        }
      }

      state.error = null;      // Update cache timestamp for visited profile
      state.visitedProfileCacheTimestamp = Date.now();

      // Store per-user cache timestamp
      state.userCacheTimestamps[userId] = Date.now();

      // Add the userId to cached visited profile list
      if (userId && !state.cachedVisitedProfileIds.includes(userId)) {
        state.cachedVisitedProfileIds.push(userId);
      }
    },

    fetchProfileSuccess(state, action: PayloadAction<Record<string, unknown>>) {
      state.loading = false;
      state.profile = action.payload.userProfile as UserProfile;
      // Store all related data, ensuring arrays are initialized
      state.likedEvents = Array.isArray(action.payload.likedEvents) ? action.payload.likedEvents : [];
      state.userBookings = Array.isArray(action.payload.userBookings) ? action.payload.userBookings : [];
      state.userBookingsRequests = Array.isArray(action.payload.userBookingsRequests) ? action.payload.userBookingsRequests : [];
      state.userEventProfit = action.payload.userEventProfit as unknown | null;
      state.userEvents = Array.isArray(action.payload.userEvents) ? action.payload.userEvents : [];
      state.userFollowers = Array.isArray(action.payload.userFollowers) ? action.payload.userFollowers : [];
      state.userFollowing = Array.isArray(action.payload.userFollowing) ? action.payload.userFollowing : [];
      state.userGuestList = Array.isArray(action.payload.userGuestList) ? action.payload.userGuestList : [];
      state.userReviews = Array.isArray(action.payload.userReviews) ? action.payload.userReviews : [];
      state.userTickets = Array.isArray(action.payload.userTickets) ? action.payload.userTickets : [];
      state.userTipsProfit = action.payload.userTipsProfit as unknown | null;
      state.userSavedEvents = Array.isArray(action.payload.userSavedEvents) ? action.payload.userSavedEvents : [];
      state.userSavedReviews = Array.isArray(action.payload.userSavedReviews) ? action.payload.userSavedReviews : [];
      state.error = null;

      // Update cache timestamp
      state.profileCacheTimestamp = Date.now();

      // Add the userId passed to the thunk to cached list
      const userId = action.payload.userId as string; // Pass userId from thunk

      // Update global user cache timestamp
      if (userId) {
        state.userCacheTimestamps[userId] = Date.now();
      }

      // Debug logging with reduced verbosity
      if (process.env.NODE_ENV === 'development' && userId) {
        console.log(`Profile fetched and cached for user ${userId.substring(0, 6)}...`);
      }

      // Use userId from thunk parameter instead of profile.id
      if (userId && !state.cachedProfileIds.includes(userId)) {
        state.cachedProfileIds.push(userId);
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

      // Update per-user cache timestamps for all fetched users
      const now = Date.now();
      action.payload.forEach(profile => {
        if (profile.id) {
          state.userCacheTimestamps[profile.id] = now;
        }
      });
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
const isProfileCached = (profileId: string, cachedIds: string[], timestamp: number | null, isVisitedProfile: boolean = false): boolean => {
  // Use appropriate cache duration based on profile type
  const cacheDuration = isVisitedProfile ? VISITED_PROFILE_CACHE_DURATION : PROFILE_CACHE_DURATION;
  return cachedIds.includes(profileId) && isCacheValid(timestamp, cacheDuration);
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
    dispatch(profileSlice.actions.fetchProfileStart({ userId: uid }));

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
      // Send success notification
      notify(dispatch, {
        type: "profile_fetch",
        data: {
          message: "Profile loaded successfully!",
          type: "success"
        },
      });
    } catch (error: unknown) {
      handleAxiosError(error, dispatch, profileSlice.actions.fetchProfileFailure);
    }
  };


// Fetch user profile
export const fetchUserProfile = (uid?: string, forceRefresh: boolean = false) => async (dispatch: AppDispatch, getState: () => { profile: ProfileState }) => {
  const userId = uid || localStorage.getItem("uid");
  if (!userId) throw new Error("User ID is undefined");

  // Get current state
  const state = getState().profile;

  // Check if already fetching this user to prevent duplicate requests
  if (state.fetchingUserIds.includes(userId) || shouldDebounce(userId)) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Already fetching main profile for user: ${userId} - skipping duplicate request`);
    }
    return;
  }

  // Check if we have valid cached data
  const isCached = isProfileCached(userId, state.cachedProfileIds, state.profileCacheTimestamp);

  // Use cached data if available and not forcing refresh
  if (!forceRefresh && isCached && state.profile?.id === userId) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Using cached profile data for user: ${userId}. Cache age: ${Date.now() - (state.profileCacheTimestamp || 0)}ms`);
    }
    return;
  }

  // Start tracking this fetch
  dispatch(profileSlice.actions.startFetchingUser(userId));
  dispatch(profileSlice.actions.fetchProfileStart({ userId }));

  try {
    const response = await axios.get(`https://gigartz.onrender.com/user/${userId}`, {
      timeout: 15000
    });

    dispatch(profileSlice.actions.fetchProfileSuccess({
      ...response.data,
      userId: userId
    }));

    // Only show notification if we actually fetched new data and it's a forced refresh
    // This reduces the notification spam
    if (forceRefresh) {
      notify(dispatch, {
        type: "profile_fetch",
        data: {
          message: "Profile data loaded successfully!",
          type: "success"
        },
      });
    }
  } catch (error: unknown) {
    handleAxiosError(error, dispatch, profileSlice.actions.fetchProfileFailure);
  } finally {
    // Mark this request as complete in our tracking system
    markRequestComplete(userId);
    // And remove from Redux tracking
    dispatch(profileSlice.actions.stopFetchingUser(userId));
  }
};

// Fetch user profile
export const fetchAUserProfile = (uid?: string, forceRefresh: boolean = false) => async (dispatch: AppDispatch, getState: () => { profile: ProfileState }) => {
  // Get UID from localStorage if not provided
  const userId = uid || localStorage.getItem("uid");

  if (!userId) throw new Error("User ID is undefined");

  // Get current state
  const state = getState().profile;

  // Check if already fetching this user or if we should debounce this request
  if (state.fetchingUserIds.includes(userId) || shouldDebounce(userId)) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Already fetching profile for user: ${userId} - skipping duplicate request`);
    }
    return;
  }

  // Check if we have cached data for this specific user profile
  const isCached = isProfileCached(userId, state.cachedProfileIds, state.userProfileCacheTimestamp);
  const isCurrentUser = state.userProfile?.id === userId;

  // If we have fresh cached data and it's the current user profile, use it
  if (!forceRefresh && isCached && isCurrentUser) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Using cached user profile data for user: ${userId}. Cache age: ${Date.now() - (state.userProfileCacheTimestamp || 0)}ms`);
    }
    return;
  }

  // If we have this user in userList and it's not the current userProfile, use that data
  if (!forceRefresh && state.userList) {
    const cachedUserData = state.userList.find(user => user.id === userId);
    if (cachedUserData && state.userProfile?.id !== userId) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Using cached data from userList for user: ${userId}`);
      }

      // Use the cached data from userList without making an API call
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

  // If we already have this user's full profile data, don't fetch again
  if (!forceRefresh && state.userProfile?.id === userId && isCached) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Already have full profile data for user: ${userId}, skipping fetch`);
    }
    return;
  }

  // Start tracking this fetch
  dispatch(profileSlice.actions.startFetchingUser(userId));
  dispatch(profileSlice.actions.fetchAProfileStart());

  try {
    const response = await axios.get(`https://gigartz.onrender.com/user/${userId}`, {
      timeout: 15000 // 15 second timeout
    });

    dispatch(profileSlice.actions.fetchAProfileSuccess({
      ...response.data,
      userId: userId // Pass the userId to the action
    }));

    // Only send notification for forced refreshes
    // This greatly reduces notification spam
    if (forceRefresh) {
      notify(dispatch, {
        type: "profile_fetch",
        data: {
          message: "User profile loaded successfully!",
          type: "success"
        },
      });
    }
  } catch (error: unknown) {
    handleAxiosError(error, dispatch, profileSlice.actions.fetchAProfileFailure);
  } finally {
    // Mark this request as complete in our tracking system
    markRequestComplete(userId);
    // And remove from Redux tracking
    dispatch(profileSlice.actions.stopFetchingUser(userId));
  }
};

// Fetch visited user profile (for profiles viewed on people/userId route)
export const fetchVisitedUserProfile = (uid: string, forceRefresh: boolean = false) => async (dispatch: AppDispatch, getState: () => { profile: ProfileState }) => {
  if (!uid) throw new Error("User ID is required for visited profile");

  const state = getState().profile;

  // Check if already fetching this user or if we should debounce this request
  if (!forceRefresh && (state.fetchingUserIds.includes(uid) || shouldDebounce(uid))) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Already fetching visited profile for user: ${uid} - skipping duplicate request`);
    }
    return;
  }

  // Check if we have cached data for this visited profile that's still valid
  // Use shorter cache duration for visited profiles to ensure fresh data when navigating between profiles
  const isCached = isProfileCached(uid, state.cachedVisitedProfileIds, state.visitedProfileCacheTimestamp, true);

  // Use cached data if available and not forcing refresh
  if (!forceRefresh && isCached && state.visitedProfile?.userProfile?.id === uid) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Using cached visited profile data for user: ${uid}. Cache age: ${Date.now() - (state.visitedProfileCacheTimestamp || 0)}ms, max age: ${VISITED_PROFILE_CACHE_DURATION}ms`);
    }
    return;
  }

  // Start tracking this fetch
  dispatch(profileSlice.actions.startFetchingUser(uid));
  dispatch(profileSlice.actions.fetchAProfileStart());

  try {
    // Debug log before fetch
    if (process.env.NODE_ENV === 'development') {
      console.log(`Fetching visited profile for user: ${uid}`);
    }

    // Enhanced debug before API call
    if (process.env.NODE_ENV === 'development') {
      console.log(`%c📡 API REQUEST [${uid}]: Calling API endpoint https://gigartz.onrender.com/user/${uid}`,
        'background:#34495e; color: white; font-weight: bold; padding: 3px; border-radius: 3px;');
    }

    const response = await axios.get(`https://gigartz.onrender.com/user/${uid}`, {
      timeout: 15000, // 15 second timeout
      params: {
        _t: Date.now() // Add timestamp to prevent caching by browser
      }
    });

    // Direct raw response capture before any processing
    if (process.env.NODE_ENV === 'development') {
      // Save raw JSON for inspection
      console.log(`%c📥 RAW API RESPONSE [${uid}]:`, 'background:#e74c3c; color: white; font-weight: bold; padding: 3px; border-radius: 3px;');
      console.log(JSON.stringify(response.data, null, 2));

      // Check for specific array fields
      const arrayFields = ['userEvents', 'userFollowers', 'userFollowing', 'userGuestList',
        'userReviews', 'userTickets', 'userSavedEvents', 'userSavedReviews',
        'likedEvents', 'userBookings', 'userBookingsRequests'];

      console.log(`%c🔍 API RESPONSE ARRAY INSPECTION [${uid}]:`, 'background:#f39c12; color: white; font-weight: bold; padding: 3px; border-radius: 3px;');

      // Helper to find arrays anywhere in the object structure
      const findArraysDeep = (obj, path = '') => {
        const results = {};

        if (!obj || typeof obj !== 'object') return results;

        Object.keys(obj).forEach(key => {
          const currentPath = path ? `${path}.${key}` : key;
          const value = obj[key];

          if (Array.isArray(value)) {
            results[currentPath] = {
              length: value.length,
              sample: value.length > 0 ? value[0] : undefined
            };
          }

          if (value && typeof value === 'object' && !Array.isArray(value)) {
            Object.assign(results, findArraysDeep(value, currentPath));
          }
        });

        return results;
      };

      // Standard root-level array check
      arrayFields.forEach(field => {
        const fieldValue = response.data[field];
        if (fieldValue === undefined) {
          console.log(`${field}: MISSING (undefined)`);
        } else if (fieldValue === null) {
          console.log(`${field}: NULL`);
        } else if (Array.isArray(fieldValue)) {
          console.log(`${field}: Array with ${fieldValue.length} items`);
          if (fieldValue.length > 0) {
            console.log(` - Sample item:`, fieldValue[0]);
          }
        } else {
          console.log(`${field}: NOT AN ARRAY (type: ${typeof fieldValue})`);
          console.log(` - Value:`, fieldValue);
        }
      });

      // Deep search for arrays anywhere in the response
      console.log(`%c🔬 DEEP ARRAY SEARCH IN API RESPONSE [${uid}]:`, 'background:#8e44ad; color: white; font-weight: bold; padding: 3px; border-radius: 3px;');
      const deepArraysFound = findArraysDeep(response.data);

      // Check if expected arrays are found elsewhere in the structure
      const missingRootArrayFields = arrayFields.filter(field =>
        !response.data[field] || !Array.isArray(response.data[field])
      );

      if (missingRootArrayFields.length > 0) {
        console.log('Looking for these missing root arrays elsewhere in the response:', missingRootArrayFields);

        // Check if any of these arrays are found elsewhere
        const potentialArrayMatches = Object.keys(deepArraysFound).filter(path => {
          return missingRootArrayFields.some(field =>
            // Check if the path ends with or contains the field name
            path.endsWith(field) || path.includes(`.${field}`)
          );
        });

        if (potentialArrayMatches.length > 0) {
          console.log(`%c🔍 POTENTIAL MATCHES FOUND ELSEWHERE IN STRUCTURE:`, 'background:#27ae60; color: white; font-weight: bold;');
          potentialArrayMatches.forEach(path => {
            console.log(`- ${path}: Array with ${deepArraysFound[path].length} items`);
            if (deepArraysFound[path].sample) {
              console.log(`  Sample:`, deepArraysFound[path].sample);
            }
          });
        } else {
          console.log('No potential matches found elsewhere in the structure.');
        }
      }

      // Log all arrays found in the structure for reference
      console.log('All arrays found in response (including nested):', deepArraysFound);
    }

    // Standard debug log response
    if (process.env.NODE_ENV === 'development') {
      console.log('Received visited profile data with keys:', Object.keys(response.data));
      console.log('VISITED PROFILE RAW RESPONSE:', response.data);

      // Log array sizes for debugging
      Object.keys(response.data).forEach(key => {
        if (Array.isArray(response.data[key])) {
          console.log(`API Response - ${key}: ${response.data[key].length} items`);
          if (response.data[key].length > 0) {
            console.log(`  - First item sample:`, response.data[key][0]);
          }
        } else if (typeof response.data[key] === 'object' && response.data[key] !== null) {
          console.log(`API Response - ${key}: Object with keys:`, Object.keys(response.data[key]));
        } else {
          console.log(`API Response - ${key}: ${typeof response.data[key]} value`);
        }
      });
    }

    // Make sure we have a valid response
    if (!response.data || !response.data.userProfile) {
      throw new Error('Invalid response format: missing userProfile');
    }

    // Validate and transform arrays properly
    const ensureArray = (data: unknown, key: string): unknown[] => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[ensureArray] Processing ${key}: type=${typeof data}, isArray=${Array.isArray(data)}`);
        if (data === null) console.log(`[ensureArray] ${key} is null`);
        if (data === undefined) console.log(`[ensureArray] ${key} is undefined`);
      }

      if (Array.isArray(data)) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[ensureArray] ${key} is already an array with ${data.length} items`);
        }
        return data;
      } else if (data === null || data === undefined) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[ensureArray] ${key} is null/undefined, returning empty array`);
        }
        return [];
      } else if (typeof data === 'object') {
        // Some APIs return empty objects instead of arrays
        if (process.env.NODE_ENV === 'development') {
          console.log(`[ensureArray] ${key} is an object, keys:`, Object.keys(data as object));
        }
        return Object.keys(data as object).length === 0 ? [] : [data];
      } else {
        // If it's a primitive value, wrap in array
        if (process.env.NODE_ENV === 'development') {
          console.log(`[ensureArray] ${key} is a primitive value: ${data}, wrapping in array`);
        }
        return [data];
      }
    };

    if (process.env.NODE_ENV === 'development') {
      console.log(`%c🔍 [VISITED PROFILE] API RESPONSE INSPECTION FOR USER ${uid}`, 'background: #3498db; color: white; font-weight: bold; padding: 3px; border-radius: 3px;');
      console.log(`Visited profile response for user ${uid}:`, response.data.userProfile);

      // Detailed response analysis
      console.log('%c📊 RESPONSE DATA STRUCTURE:', 'font-weight: bold; color: #2980b9;');
      console.log(`Full response keys:`, Object.keys(response.data));
      console.log(`Raw response data:`, response.data);

      // Summary of arrays in the response
      const arraySizes = {};
      let foundArrays = false;
      Object.keys(response.data).forEach(key => {
        if (Array.isArray(response.data[key])) {
          arraySizes[key] = response.data[key].length;
          foundArrays = true;
          if (response.data[key].length > 0) {
            console.log(`%c📋 Sample of ${key}:`, 'color: #27ae60; font-weight: bold;');
            console.log(response.data[key][0]);
          }
        } else if (typeof response.data[key] === 'object' && response.data[key] !== null && key !== 'userProfile') {
          console.log(`%c⚠️ ${key} is an object but not an array:`, 'color: #e67e22; font-weight: bold;');
          console.log(response.data[key]);
        }
      });

      if (!foundArrays) {
        console.log('%c❌ NO ARRAYS FOUND IN RESPONSE DATA!', 'color: #e74c3c; font-weight: bold; font-size: 14px;');
        console.log('Expected arrays like userEvents, userFollowers, etc. but none were found in the response.');
      } else {
        console.log(`%c[ARRAY COUNTS] API response arrays for ${uid}:`, 'color: #16a085; font-weight: bold;', arraySizes);
      }

      // Log cache status with enhanced TTL information
      const state = getState().profile;
      const globalCacheTime = state.userCacheTimestamps[uid];
      const visitedCacheTime = state.visitedProfileCacheTimestamp;
      const now = Date.now();

      console.log(`%c[CACHE STATUS] User ${uid}:`, 'color: #8e44ad; font-weight: bold;');
      console.log(`  - Global cache: ${globalCacheTime ?
        `Cached ${Math.round((now - globalCacheTime) / 1000)}s ago (TTL: ${Math.round(PROFILE_CACHE_DURATION / 1000)}s)` :
        'Not cached'}`);
      console.log(`  - Visited cache: ${visitedCacheTime ?
        `Cached ${Math.round((now - visitedCacheTime) / 1000)}s ago (TTL: ${Math.round(VISITED_PROFILE_CACHE_DURATION / 1000)}s)` :
        'Not cached'}`);
    }

    // Before preparing data, log possible API data structure issues
    if (process.env.NODE_ENV === 'development') {
      console.log(`%c📋 API STRUCTURE ANALYSIS [${uid}]:`, 'background:#9b59b6; color: white; font-weight: bold; padding: 3px; border-radius: 3px;');

      // Look for potential nested data structure issues
      if (response.data.userProfile) {
        console.log(`UserProfile exists with id: ${response.data.userProfile.id}`);

        // Check if arrays might be nested inside userProfile by mistake
        const userProfileKeys = Object.keys(response.data.userProfile);
        const potentiallyMisplacedArrays = [
          'userEvents', 'userFollowers', 'userFollowing', 'userGuestList',
          'userReviews', 'userTickets', 'userSavedEvents', 'userSavedReviews',
          'likedEvents', 'userBookings', 'userBookingsRequests'
        ].filter(key => userProfileKeys.includes(key));

        if (potentiallyMisplacedArrays.length > 0) {
          console.log(`%c⚠️ POTENTIAL API STRUCTURE ISSUE:`, 'background:#e74c3c; color: white; font-weight: bold;');
          console.log(`These arrays might be nested inside userProfile instead of at the root level:`, potentiallyMisplacedArrays);

          // Log the potentially misplaced arrays
          potentiallyMisplacedArrays.forEach(key => {
            const value = response.data.userProfile[key];
            if (Array.isArray(value)) {
              console.log(`${key} (in userProfile): Array with ${value.length} items`);

              // AUTOMATIC FIX: If array is found in userProfile but missing at root level, move it to root
              if (!response.data[key] || !Array.isArray(response.data[key])) {
                console.log(`%c🔧 FIXING: Moving ${key} from userProfile to root level`, 'background:#27ae60; color: white; font-weight: bold;');
                response.data[key] = value;
              }
            } else {
              console.log(`${key} (in userProfile): Not an array (type: ${typeof value})`);
            }
          });
        }

        // Check for numerical properties that should match array lengths
        if (typeof response.data.userProfile.followers === 'number' && response.data.userProfile.followers > 0) {
          const followersArray = response.data.userFollowers;
          if (!followersArray || (Array.isArray(followersArray) && followersArray.length === 0)) {
            console.log(`%c⚠️ DATA MISMATCH:`, 'background:#e74c3c; color: white; font-weight: bold;');
            console.log(`Profile shows ${response.data.userProfile.followers} followers but userFollowers array is empty or missing`);
          }
        }

        if (typeof response.data.userProfile.following === 'number' && response.data.userProfile.following > 0) {
          const followingArray = response.data.userFollowing;
          if (!followingArray || (Array.isArray(followingArray) && followingArray.length === 0)) {
            console.log(`%c⚠️ DATA MISMATCH:`, 'background:#e74c3c; color: white; font-weight: bold;');
            console.log(`Profile shows ${response.data.userProfile.following} following but userFollowing array is empty or missing`);
          }
        }
      }
    }

    // Prepare the data before dispatching - ensure we have proper defaults for arrays
    const preparedData = {
      ...response.data,
      userId: uid, // Pass the userId to the action
      // Make sure these are arrays even if missing or malformed in response
      userEvents: ensureArray(response.data.userEvents, 'userEvents'),
      userFollowers: ensureArray(response.data.userFollowers, 'userFollowers'),
      userFollowing: ensureArray(response.data.userFollowing, 'userFollowing'),
      userGuestList: ensureArray(response.data.userGuestList, 'userGuestList'),
      userReviews: ensureArray(response.data.userReviews, 'userReviews'),
      userTickets: ensureArray(response.data.userTickets, 'userTickets'),
      userSavedEvents: ensureArray(response.data.userSavedEvents, 'userSavedEvents'),
      userSavedReviews: ensureArray(response.data.userSavedReviews, 'userSavedReviews'),
      likedEvents: ensureArray(response.data.likedEvents, 'likedEvents'),
      userBookings: ensureArray(response.data.userBookings, 'userBookings'),
      userBookingsRequests: ensureArray(response.data.userBookingsRequests, 'userBookingsRequests')
    };

    // Log the transformed data for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('%c🔄 TRANSFORMED DATA READY FOR DISPATCH:', 'background: #2ecc71; color: white; font-weight: bold; padding: 3px; border-radius: 3px;');

      // Summary table of array transformations
      const arrayTransformations = {};
      const arrayProps = [
        'userEvents', 'userFollowers', 'userFollowing', 'userGuestList',
        'userReviews', 'userTickets', 'userSavedEvents', 'userSavedReviews',
        'likedEvents', 'userBookings', 'userBookingsRequests'
      ];

      arrayProps.forEach(key => {
        const rawValue = response.data[key];
        const rawType = rawValue === undefined ? 'undefined' :
          rawValue === null ? 'null' :
            Array.isArray(rawValue) ? `array[${rawValue.length}]` : typeof rawValue;

        const preparedValue = preparedData[key];
        const preparedLength = Array.isArray(preparedValue) ? preparedValue.length : 0;

        arrayTransformations[key] = {
          before: rawType,
          after: `array[${preparedLength}]`,
          changed: rawType !== `array[${preparedLength}]`
        };
      });

      console.log('%c📊 ARRAY TRANSFORMATIONS:', 'font-weight: bold; color: #2980b9;');
      console.table(arrayTransformations);

      // Check if any arrays are still empty that shouldn't be
      const emptyArrays = arrayProps.filter(key =>
        Array.isArray(preparedData[key]) &&
        preparedData[key].length === 0 &&
        (response.data.userProfile?.followers > 0 && key === 'userFollowers' ||
          response.data.userProfile?.following > 0 && key === 'userFollowing')
      );

      if (emptyArrays.length > 0) {
        console.log('%c⚠️ POTENTIAL EMPTY ARRAY ISSUES:', 'color: #e67e22; font-weight: bold;');
        console.log(`These arrays are empty but might be expected to have data:`, emptyArrays);
      }
    }

    dispatch(profileSlice.actions.fetchVisitedProfileSuccess(preparedData));

    // Only send a notification if this is a new visited profile
    // If we're viewing the same profile multiple times, don't notify each time
    if (!state.visitedProfile?.userProfile || state.visitedProfile.userProfile.id !== uid) {
      notify(dispatch, {
        type: "profile_fetch",
        data: {
          message: "Profile loaded successfully!",
          type: "success"
        },
      });
    }
  } catch (error: unknown) {
    // Provide more detailed error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching visited profile:', error);

      // Log the exact request URL for debugging API issues
      console.error(`API URL attempted: https://gigartz.onrender.com/user/${uid}`);

      if (axios.isAxiosError(error) && error.response) {
        console.error('API error response status:', error.response.status);
        console.error('API error response data:', error.response.data);
      }
    }
    handleAxiosError(error, dispatch, profileSlice.actions.fetchAProfileFailure);
  } finally {
    // Mark this request as complete in our tracking system
    markRequestComplete(uid);
    // And remove from Redux tracking
    dispatch(profileSlice.actions.stopFetchingUser(uid));
  }
};


// Fetch all user profiles
export const fetchAllProfiles = (forceRefresh: boolean = false) => async (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();
  const { userListCacheTimestamp, userList, loading } = state.profile;
  const userId = "all_users"; // Special ID for user list

  // Prevent multiple simultaneous calls using our request tracking
  if ((loading && !forceRefresh) || (!forceRefresh && shouldDebounce(userId))) {
    if (process.env.NODE_ENV === 'development') {
      console.log("Already fetching user profiles, skipping duplicate call");
    }
    return;
  }

  // Check if cache is still valid and we have data
  if (!forceRefresh && userList && userList.length > 0 && isCacheValid(userListCacheTimestamp)) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Using cached user list (${userList.length} users)`);
    }
    return;
  }

  dispatch(profileSlice.actions.fetchProfileStart({ userId }));

  try {
    const response = await axios.get(`https://gigartz.onrender.com/users/`, {
      timeout: 15000
    });

    dispatch(profileSlice.actions.getProfileSuccess(response.data));

    // Only notify on forced refresh
    if (forceRefresh) {
      notify(dispatch, {
        type: "profile_fetch",
        data: {
          message: "All profiles loaded successfully!",
          type: "success"
        },
      });
    }
  } catch (error: unknown) {
    handleAxiosError(error, dispatch, profileSlice.actions.fetchProfileFailure);
  } finally {
    // Mark the request as complete
    markRequestComplete(userId);
  }
};

// Force refresh a visited profile
export const refreshVisitedProfile = (uid: string) => async (dispatch: AppDispatch) => {
  if (!uid) return;

  if (process.env.NODE_ENV === 'development') {
    console.log(`Forcing refresh of visited profile for user: ${uid}`);
  }

  // Force a refresh by passing forceRefresh=true
  await dispatch(fetchVisitedUserProfile(uid, true));
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
  resetError,
  updateProfile,
  fetchDrawerProfileSuccess,
  fetchVisitedProfileSuccess,
  logout,
  updateBookingStatusStart,
  updateBookingStatusSuccess,
  updateBookingStatusFailure,
  startFetchingUser,
  stopFetchingUser,
} = profileSlice.actions;

// Helper function to check if visited profile arrays are inconsistent
export const hasInconsistentArrays = (profile: ProfileState['visitedProfile']): boolean => {
  if (!profile || !profile.userProfile) return true;

  // Check for common inconsistencies
  const inconsistencies = [];

  // Example: If userProfile has followers > 0 but userFollowers array is empty
  if (profile.userProfile.followers > 0 && profile.userFollowers.length === 0) {
    inconsistencies.push('Followers count > 0 but followers array is empty');
  }

  // Example: If userProfile has following > 0 but userFollowing array is empty
  if (profile.userProfile.following > 0 && profile.userFollowing.length === 0) {
    inconsistencies.push('Following count > 0 but following array is empty');
  }

  // Return true if any inconsistencies found
  return inconsistencies.length > 0;
};

// Helper function to check and refresh visited profile data if needed
export const checkAndRefreshVisitedProfile = (uid: string) => (dispatch: AppDispatch, getState: () => { profile: ProfileState }) => {
  const state = getState().profile;
  let needsRefresh = false;

  // Check if profile exists
  if (!state.visitedProfile || !state.visitedProfile.userProfile) {
    console.log('[checkAndRefreshVisitedProfile] No visited profile found, forcing refresh');
    needsRefresh = true;
  }
  // Check if it's the right profile
  else if (state.visitedProfile.userProfile.id !== uid) {
    console.log('[checkAndRefreshVisitedProfile] Wrong profile loaded, forcing refresh');
    needsRefresh = true;
  }
  // Check if arrays are properly populated
  else {
    const arrayProperties = [
      'userEvents', 'userFollowers', 'userFollowing', 'userTickets',
      'userReviews', 'userGuestList', 'userBookingsRequests'
    ];

    console.log('[checkAndRefreshVisitedProfile] Current arrays state:');
    arrayProperties.forEach(prop => {
      const arr = state.visitedProfile[prop];
      if (!Array.isArray(arr)) {
        console.log(`- ${prop}: NOT AN ARRAY (${typeof arr})`);
        needsRefresh = true;
      } else {
        console.log(`- ${prop}: Array with ${arr.length} items`);
      }
    });

    // Check for data inconsistencies
    if (hasInconsistentArrays(state.visitedProfile)) {
      console.log('[checkAndRefreshVisitedProfile] Detected inconsistencies in profile data');
      needsRefresh = true;
    }
  }

  if (needsRefresh) {
    console.log('[checkAndRefreshVisitedProfile] Refreshing profile data');
    return dispatch(refreshVisitedProfile(uid));
  }

  console.log('[checkAndRefreshVisitedProfile] Profile data looks good, no refresh needed');
  return Promise.resolve();
};

// Helper to invalidate a user's cache globally
export const invalidateUserCache = (uid: string) => (dispatch: AppDispatch) => {
  if (!uid) return;

  // Force refresh by passing forceRefresh=true to appropriate fetch function
  dispatch(fetchVisitedUserProfile(uid, true));

  if (process.env.NODE_ENV === 'development') {
    console.log(`Invalidated global cache for user: ${uid}`);
  }
};

export default profileSlice.reducer;