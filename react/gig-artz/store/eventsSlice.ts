// src/store/eventsSlice.ts

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface TicketPrice {
    platinum: number;
    students: number;
    goldenCircle: number;
    general: number;
}

interface Timestamp {
    seconds: number;
    nanoseconds: number;
}

interface Comment {
    userId: string;
    timestamp: Timestamp;
    comment: string;
    replies: Comment[]; // Adjusted type for replies to use Comment interface
}

interface TicketAvailability {
    ticketsAvailable: number;
    ticketInfo: string;
}

interface TicketsAvailable {
    platinum: TicketAvailability[];
    students: TicketAvailability[];
    goldenCircle: TicketAvailability[];
    general: TicketAvailability[];
}

interface Event {
    id: string;
    ticketsPrices: TicketPrice;
    time: string; // Consider changing to Date type
    mapLink: string;
    title: string;
    gallery: string[];
    comments: Comment[];
    eventType: string;
    eventVideo: string;
    city: string;
    description: string;
    likes: number;
    venue: string;
    artistLineUp: string[];
    category: string;
    promoterId: string;
    eventPic: string;
    eventEndTime: string; // Consider changing to Date type
    date: string; // Consider changing to Date type
    eventStartTime: string; // Consider changing to Date type
}

// Define the state structure for events
interface EventsState {
    events: Event[];
    loading: boolean;
    error: string | null;
}

const initialState: EventsState = {
    events: [],
    loading: false,
    error: null,
};

const eventsSlice = createSlice({
    name: "events",
    initialState,
    reducers: {
        fetchEventsStart(state) {
            state.loading = true;
            state.error = null;
        },
        fetchEventsSuccess(state, action: PayloadAction<Event[]>) {
            state.loading = false;
            state.events = action.payload;
            state.error = null;
        },
        fetchEventsFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
        resetError(state) {
            state.error = null;
        },
    },
});

// Async thunk to fetch events
export const fetchEvents = createAsyncThunk(
    "events/fetchEvents",  // Renamed action type
    async () => {
        try {
            console.log("Fetching events...");
            const response = await axios.get(
                `https://gigartz.onrender.com/addevent`
            );
            console.log("Events response:", response.data);
            return response.data; // Return the data to be used in fetchEventsSuccess
        } catch (error: any) {
            console.error("Error fetching events:", error.message);
            throw new Error(error.message); // Throw the error to be caught in fetchEventsFailure
        }
    }
);

export const {
    fetchEventsStart,
    fetchEventsSuccess,
    fetchEventsFailure,
    resetError,
} = eventsSlice.actions;

export default eventsSlice.reducer;
