// src/store/eventsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "./store";
import axios, { AxiosError } from "axios";

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
  replies: Comment[];
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
  time: string;
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
  success: string | null;
}

const initialState: EventsState = {
  events: [],
  loading: false,
  error: null,
  success: null,
};

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    fetchEventsStart(state) {
      state.loading = true;
      state.error = null;
    },
    createEventsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchEventsSuccess(state, action: PayloadAction<Event[]>) {
      state.loading = false;
      state.events = action.payload;
      state.error = null;
    },
    createEventsSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.success = action.payload;
      state.error = null;
    },
    fetchEventsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    createEventsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    resetError(state) {
      state.error = null;
    },
  },
});

// Fetch all events
export const fetchAllEvents = () => async (dispatch: AppDispatch) => {
  dispatch(eventsSlice.actions.fetchEventsStart());

  try {
    console.log("Fetching all events...");
    const response = await axios.get(`https://gigartz.onrender.com/events`);
    console.log("Events responses:", response.data);

    dispatch(eventsSlice.actions.fetchEventsSuccess(response.data));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        // The request was made and the server responded with an error
        console.error("Response error:", axiosError.response?.data);
        dispatch(
          eventsSlice.actions.fetchEventsFailure(
            axiosError.response?.data?.error || "Failed to fetch user profile"
          )
        );
      } else if (axiosError.request) {
        // The request was made, but no response was received
        console.error("Request error:", axiosError.request);
        dispatch(
          eventsSlice.actions.fetchEventsFailure(
            "No response received from server"
          )
        );
      } else {
        // Something else happened during the setup of the request
        console.error("Error setting up request:", axiosError.message);
        dispatch(eventsSlice.actions.fetchEventsFailure(axiosError.message));
      }
    } else {
      // Handle non-Axios errors
      console.error("Unexpected error fetching user profile:", error);
      dispatch(
        eventsSlice.actions.fetchEventsFailure("Unexpected error occurred")
      );
    }
  }
};

export const addEvent = (eventData: Event) => async (dispatch: AppDispatch) => {
  dispatch(eventsSlice.actions.createEventsStart());

  try {
    console.log("Adding event...");
    const response = await axios.post(
      `https://gigartz.onrender.com/addevent`,
      eventData
    );
    console.log("Event added successfully:", response.data);

    dispatch(
      eventsSlice.actions.createEventsSuccess("Event added successfully!")
    );
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        console.error("Response error:", axiosError.response?.data);
        dispatch(
          eventsSlice.actions.createEventsFailure(
            axiosError.response?.data?.error || "Failed to add event"
          )
        );
      } else if (axiosError.request) {
        console.error("Request error:", axiosError.request);
        dispatch(
          eventsSlice.actions.createEventsFailure(
            "No response received from server"
          )
        );
      } else {
        console.error("Error setting up request:", axiosError.message);
        dispatch(
          eventsSlice.actions.createEventsFailure(
            axiosError.message || "Unexpected error occurred"
          )
        );
      }
    } else {
      console.error("Unexpected error:", error);
      dispatch(
        eventsSlice.actions.createEventsFailure("Unexpected error occurred")
      );
    }
  }
};

export const {
  fetchEventsStart,
  createEventsStart,
  createEventsSuccess,
  createEventsFailure,
  fetchEventsSuccess,
  fetchEventsFailure,
  resetError,
} = eventsSlice.actions;

export default eventsSlice.reducer;
