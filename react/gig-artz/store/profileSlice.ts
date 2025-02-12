// src/store/profileSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserProfile {
    reviews: {
        reviewGiven: number;
        reviewReceived: number;
    };
    phoneNumber: string;
    bio: string;
    emailAddress: string;
    fcmToken: string;
    createdAt: {
        seconds: number;
        nanoseconds: number;
    };
    userName: string;
    following: number;
    roles: {
        generalUser: boolean;
        freelancer: boolean;
    };
    city: string;
    profilePicUrl: string | null;
    rating: number;
    followers: number;
    genre: string;
    country: string;
    bookingRequests: any[]; // Adjust type as needed
}

interface User {
    profile: UserProfile;
    events: any[]; // Adjust type based on event structure
    userLikedEvents: any[]; // Adjust type based on liked event structure
    userTickets: any[]; // Adjust type as needed
    userFollowers: any[]; // Adjust type as needed
    userFollowing: any[]; // Adjust type as needed
}

interface ProfileState {
    profile: UserProfile | null;
    loading: boolean;
    error: string | null;
}

const initialState: ProfileState = {
    profile: null,
    loading: false,
    error: null,
};

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        fetchProfileStart(state) {
            state.loading = true;
            state.error = null;
        },
        fetchProfileSuccess(state, action: PayloadAction<UserProfile>) {
            state.loading = false;
            state.profile = action.payload;
            state.error = null;
        },
        fetchProfileFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
        resetError(state) {
            state.error = null;
        },
    },
});

export const {
    fetchProfileStart,
    fetchProfileSuccess,
    fetchProfileFailure,
    resetError,
} = profileSlice.actions;

export default profileSlice.reducer;
