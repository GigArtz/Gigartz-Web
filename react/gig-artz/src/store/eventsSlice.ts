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
    createGuestListStart(state) {
      state.loading = true;
      state.error = null;
    },
    createReviewStart(state) {
      state.loading = true;
      state.error = null;
    },
    createLikeStart(state) {
      state.loading = true;
      state.error = null;
    },
    createLikeSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.success = action.payload;
      state.error = null;
    },
    createLikeFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    createReviewSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.success = action.payload;
      state.error = null;
    },
    createReviewFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    createGuestListSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.success = action.payload;
      state.error = null;
    },
    createGuestListFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
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
    buyTicketStart(state) {
      state.loading = true;
      state.error = null;
    },
    buyTicketSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.success = action.payload;
      state.error = null;
    },
    buyTicketFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    scanTicketStart(state) {
      state.loading = true;
      state.error = null;
    },
    scanTicketSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.success = action.payload;
      state.error = null;
    },
    scanTicketFailure(state, action: PayloadAction<string>) {
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

// Add reviews
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

// Adding guest list
export const addGuestList =
  (guestListData: {
    userId: string;
    guestListName: string;
    guests: { name: string; email: string; phoneNumber: string }[];
  }) =>
    async (dispatch: AppDispatch) => {
      dispatch(eventsSlice.actions.createGuestListStart());

      try {
        console.log("Adding guest list...");
        const response = await axios.post(
          `https://gigartz.onrender.com/addGuestList`,
          guestListData
        );
        console.log("Guest list added successfully:", response.data);

        dispatch(
          eventsSlice.actions.createGuestListSuccess(
            "Guest list added successfully!"
          )
        );
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            console.error("Response error:", axiosError.response?.data);
            dispatch(
              eventsSlice.actions.createGuestListFailure(
                axiosError.response?.data?.error || "Failed to add guest list"
              )
            );
          } else if (axiosError.request) {
            console.error("Request error:", axiosError.request);
            dispatch(
              eventsSlice.actions.createGuestListFailure(
                "No response received from server"
              )
            );
          } else {
            console.error("Error setting up request:", axiosError.message);
            dispatch(
              eventsSlice.actions.createGuestListFailure(
                axiosError.message || "Unexpected error occurred"
              )
            );
          }
        } else {
          console.error("Unexpected error:", error);
          dispatch(
            eventsSlice.actions.createGuestListFailure(
              "Unexpected error occurred"
            )
          );
        }
      }
    };

// Adding a review
export const addReview =
  (eventId: string, reviewData: {
    userId: string;
    title: string;
    reviewText: string;
    rating: number;
    image?: string; // Optional image
  }) =>
    async (dispatch: AppDispatch) => {
      dispatch(eventsSlice.actions.createReviewStart());

      try {
        console.log("Adding review...");
        const response = await axios.post(
          `https://gigartz.onrender.com/events/${eventId}/reviews`,
          reviewData
        );
        console.log("Review added successfully:", response.data);

        dispatch(
          eventsSlice.actions.createReviewSuccess(
            "Review added successfully!"
          )
        );
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            console.error("Response error:", axiosError.response?.data);
            dispatch(
              eventsSlice.actions.createReviewFailure(
                axiosError.response?.data?.error || "Failed to add review"
              )
            );
          } else if (axiosError.request) {
            console.error("Request error:", axiosError.request);
            dispatch(
              eventsSlice.actions.createReviewFailure(
                "No response received from server"
              )
            );
          } else {
            console.error("Error setting up request:", axiosError.message);
            dispatch(
              eventsSlice.actions.createReviewFailure(
                axiosError.message || "Unexpected error occurred"
              )
            );
          }
        } else {
          console.error("Unexpected error:", error);
          dispatch(
            eventsSlice.actions.createReviewFailure(
              "Unexpected error occurred"
            )
          );
        }
      }
    };

// Like an event
export const addLike = (eventId: string, userId: string) => async (dispatch: AppDispatch) => {
  dispatch(eventsSlice.actions.createLikeStart());

  try {
    console.log("Adding like...");
    const response = await axios.post(
      `https://gigartz.onrender.com/addLike`,
      { eventId, userId }
    );
    console.log("Like added successfully:", response.data);

    dispatch(
      eventsSlice.actions.createLikeSuccess("Like added successfully!")
    );
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        console.error("Response error:", axiosError.response?.data);
        dispatch(
          eventsSlice.actions.createLikeFailure(
            axiosError.response?.data?.error || "Failed to add like"
          )
        );
      } else if (axiosError.request) {
        console.error("Request error:", axiosError.request);
        dispatch(
          eventsSlice.actions.createLikeFailure(
            "No response received from server"
          )
        );
      } else {
        console.error("Error setting up request:", axiosError.message);
        dispatch(
          eventsSlice.actions.createLikeFailure(
            axiosError.message || "Unexpected error occurred"
          )
        );
      }
    } else {
      console.error("Unexpected error:", error);
      dispatch(
        eventsSlice.actions.createLikeFailure("Unexpected error occurred")
      );
    }
  }
};

// Buy a ticket for an event
export const buyTicket = (
  eventId: string,
  ticketData: {
    customerUid: string;
    customerName: string;
    customerEmail: string;
    amount: number;
    ticketType: string;
    location: string;
    eventName: string;
    eventDate: string;
    description: string;
    image: string;
  }
) => async (dispatch: AppDispatch) => {
  dispatch(eventsSlice.actions.buyTicketStart());

  try {
    console.log("Purchasing ticket...");
    const response = await axios.post(
      `https://gigartz.onrender.com/buy-ticket`,
      { eventId, ...ticketData }
    );
    console.log("Ticket purchased successfully:", response.data);

    dispatch(eventsSlice.actions.buyTicketSuccess("Ticket purchased successfully!"));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        console.error("Response error:", axiosError.response?.data);
        dispatch(
          eventsSlice.actions.buyTicketFailure(
            axiosError.response?.data?.error || "Failed to purchase ticket"
          )
        );
      } else if (axiosError.request) {
        console.error("Request error:", axiosError.request);
        dispatch(
          eventsSlice.actions.buyTicketFailure(
            "No response received from server"
          )
        );
      } else {
        console.error("Error setting up request:", axiosError.message);
        dispatch(
          eventsSlice.actions.buyTicketFailure(
            axiosError.message || "Unexpected error occurred"
          )
        );
      }
    } else {
      console.error("Unexpected error:", error);
      dispatch(eventsSlice.actions.buyTicketFailure("Unexpected error occurred"));
    }
  }
};

// Scan a ticket using QR code data
export const scanTicket = (
  qrCodeData: string,
  customerUid: string
) => async (dispatch: AppDispatch) => {
  dispatch(eventsSlice.actions.scanTicketStart());

  try {
    console.log("Scanning ticket...");
    const response = await axios.post(
      `https://gigartz.onrender.com/scan-ticket`,
      { qrCodeData, customerUid }
    );
    console.log("Ticket scanned successfully:", response.data);

    dispatch(eventsSlice.actions.scanTicketSuccess("Ticket scanned successfully!"));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        console.error("Response error:", axiosError.response?.data);
        dispatch(
          eventsSlice.actions.scanTicketFailure(
            axiosError.response?.data?.error || "Failed to scan ticket"
          )
        );
      } else if (axiosError.request) {
        console.error("Request error:", axiosError.request);
        dispatch(
          eventsSlice.actions.scanTicketFailure(
            "No response received from server"
          )
        );
      } else {
        console.error("Error setting up request:", axiosError.message);
        dispatch(
          eventsSlice.actions.scanTicketFailure(
            axiosError.message || "Unexpected error occurred"
          )
        );
      }
    } else {
      console.error("Unexpected error:", error);
      dispatch(eventsSlice.actions.scanTicketFailure("Unexpected error occurred"));
    }
  }
};


export const {
  fetchEventsStart,
  createEventsStart,
  createEventsSuccess,
  createEventsFailure,
  createGuestListStart,
  createGuestListSuccess,
  createGuestListFailure,
  createLikeStart,
  createLikeSuccess,
  createLikeFailure,
  buyTicketStart,
  buyTicketSuccess,
  buyTicketFailure,
  scanTicketStart,
  scanTicketSuccess,
  scanTicketFailure,
  createReviewStart,
  createReviewSuccess,
  fetchEventsSuccess,
  fetchEventsFailure,
  resetError,
} = eventsSlice.actions;

export default eventsSlice.reducer;
