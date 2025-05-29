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
    // Ticket resale actions
    resaleTicketStart(state) {
      state.loading = true;
      state.error = null;
    },
    resaleTicketSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.success = action.payload;
      state.error = null;
    },
    resaleTicketFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    // Refund actions
    refundTicketStart(state) {
      state.loading = true;
      state.error = null;
    },
    refundTicketSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.success = action.payload;
      state.error = null;
    },
    refundTicketFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchGuestListsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchGuestListsSuccess(state) {
      state.loading = false;
      state.success = null;
      state.error = null;
      // Optionally add guestLists to state if you want to store them
      // state.guestLists = action.payload;
    },
    fetchGuestListsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchGuestsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchGuestsSuccess(state) {
      state.loading = false;
      state.success = null;
      state.error = null;
      // Optionally add guests to state if you want to store them
      // state.guests = action.payload;
    },
    fetchGuestsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
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
    console.log(eventData);
    const response = await axios.post(
      `https://gigartz.onrender.com/addevent`,
      eventData
    );
    console.log("Event added successfully:", response?.data?.error);

    dispatch(
      eventsSlice.actions.createEventsSuccess("Event added successfully!")
    );
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        console.error("Response error:", axiosError.response);
        dispatch(
          eventsSlice.actions.createEventsFailure(
            axiosError.response?.data || "Failed to add event"
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

// Adding guest list name
export const createGuestList =
  (guestListData: { userId: string; guestListName: string }) =>
    async (dispatch: AppDispatch) => {
      dispatch(eventsSlice.actions.createGuestListStart());

      try {
        console.log("Creating guest list...");
        const response = await axios.post(
          `https://gigartz.onrender.com/guest-list/create`,
          guestListData
        );
        console.log("Guest list:", response);
        console.log("Guest list created successfully:", response.data);

        dispatch(
          eventsSlice.actions.createGuestListSuccess(
            "Guest list created successfully!"
          )
        );

        // Optionally return the new guestListId for the next step
        return response.data.guestListId;
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            console.error("Response error:", axiosError.response?.data);
            dispatch(
              eventsSlice.actions.createGuestListFailure(
                axiosError.response?.data?.error || "Failed to create guest list"
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



// Adding guests to the guest list
export const addGuestsToGuestList =
  (userId: string, guestListId: string, username: string) =>
    async (dispatch: AppDispatch) => {
      dispatch(eventsSlice.actions.createGuestListStart());

      console.log({ userId, username, guestListId })

      try {
        console.log("Adding guests to guest list...");
        const response = await axios.post(
          `https://gigartz.onrender.com/guest-list/add-profile`,
          { userId, username, guestListId }
        );
        console.log("Guests added successfully:", response.data);

        dispatch(
          eventsSlice.actions.createGuestListSuccess(
            "Guests added successfully!"
          )
        );
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            console.error("Response error:", axiosError.response?.data);
            dispatch(
              eventsSlice.actions.createGuestListFailure(
                axiosError.response?.data?.error || "Failed to add guests"
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
    console.log("Adding like...", eventId, userId);
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

type EventBooking = {
  eventId: string;
  customerUid: string;
  customerName: string;
  customerEmail: string;
  ticketTypes: TicketType[];
  location: string;
  eventName: string;
  eventDate: string;
  image: string;
};

// Buy a ticket for an event
export const buyTicket = (
  ticketData: EventBooking
) => async (dispatch: AppDispatch) => {
  dispatch(eventsSlice.actions.buyTicketStart());
  try {
    await axios.post(
      `https://gigartz.onrender.com/buyTicket`,
      ticketData
    );
    dispatch(eventsSlice.actions.buyTicketSuccess("Ticket purchased successfully!"));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        // Try to extract error message from response data
        const errorData = axiosError.response.data as Record<string, unknown>;
        const errorMsg = typeof errorData?.error === 'string' ? errorData.error : "Failed to buy ticket";
        dispatch(
          eventsSlice.actions.buyTicketFailure(errorMsg)
        );
      } else if (axiosError.request) {
        dispatch(
          eventsSlice.actions.buyTicketFailure(
            "No response received from server"
          )
        );
      } else {
        dispatch(
          eventsSlice.actions.buyTicketFailure(
            axiosError.message || "Unexpected error occurred"
          )
        );
      }
    } else {
      dispatch(
        eventsSlice.actions.buyTicketFailure("Unexpected error occurred")
      );
    }
  }
};

export const scanTicket = (
  qrCodeData: string,
  customerUid: string
) => async (dispatch: AppDispatch) => {
  dispatch(eventsSlice.actions.scanTicketStart());
  try {
    await axios.post(
      `https://gigartz.onrender.com/scanTicket`,
      { qrCodeData, customerUid }
    );
    dispatch(eventsSlice.actions.scanTicketSuccess("Ticket scanned successfully!"));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const errorData = axiosError.response.data as Record<string, unknown>;
        const errorMsg = typeof errorData?.error === 'string' ? errorData.error : "Failed to scan ticket";
        dispatch(
          eventsSlice.actions.scanTicketFailure(errorMsg)
        );
      } else if (axiosError.request) {
        dispatch(
          eventsSlice.actions.scanTicketFailure(
            "No response received from server"
          )
        );
      } else {
        dispatch(
          eventsSlice.actions.scanTicketFailure(
            axiosError.message || "Unexpected error occurred"
          )
        );
      }
    } else {
      dispatch(
        eventsSlice.actions.scanTicketFailure("Unexpected error occurred")
      );
    }
  }
};

export const reassignTicket = (
  currentUserId: string,
  newUserId: string,
  ticketId: string
) => async () => {
  try {
    await axios.post(
      `https://gigartz.onrender.com/reassignTicket`,
      { currentUserId, newUserId, ticketId }
    );
    // Optionally dispatch a success action if you want to track this
  } catch {
    // Optionally dispatch a failure action if you want to track this
  }
};

export const updateEvent = (
  eventId: string,
  userId: string,
  eventData: Partial<Event>
) => async () => {
  try {
    await axios.put(
      `https://gigartz.onrender.com/events/${eventId}`,
      { userId, ...eventData }
    );
    // Optionally dispatch a success action if you want to track this
  } catch {
    // Optionally dispatch a failure action if you want to track this
  }
};

export const fetchGuestLists = (userId: string) => async (dispatch: AppDispatch) => {
  dispatch(eventsSlice.actions.fetchGuestListsStart());
  try {
    await axios.get(
      `https://gigartz.onrender.com/guest-list/${userId}`
    );
    dispatch(eventsSlice.actions.fetchGuestListsSuccess());
    // Optionally handle response.data if you want to store guest lists
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const errorData = axiosError.response.data as Record<string, unknown>;
        const errorMsg = typeof errorData?.error === 'string' ? errorData.error : "Failed to fetch guest lists";
        dispatch(
          eventsSlice.actions.fetchGuestListsFailure(errorMsg)
        );
      } else if (axiosError.request) {
        dispatch(
          eventsSlice.actions.fetchGuestListsFailure(
            "No response received from server"
          )
        );
      } else {
        dispatch(
          eventsSlice.actions.fetchGuestListsFailure(
            axiosError.message || "Unexpected error occurred"
          )
        );
      }
    } else {
      dispatch(
        eventsSlice.actions.fetchGuestListsFailure("Unexpected error occurred")
      );
    }
  }
};

export const fetchGuests = (guestListId: string) => async (dispatch: AppDispatch) => {
  dispatch(eventsSlice.actions.fetchGuestsStart());
  try {
    await axios.get(
      `https://gigartz.onrender.com/guest-list/guests/${guestListId}`
    );
    dispatch(eventsSlice.actions.fetchGuestsSuccess());
    // Optionally handle response.data if you want to store guests
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const errorData = axiosError.response.data as Record<string, unknown>;
        const errorMsg = typeof errorData?.error === 'string' ? errorData.error : "Failed to fetch guests";
        dispatch(
          eventsSlice.actions.fetchGuestsFailure(errorMsg)
        );
      } else if (axiosError.request) {
        dispatch(
          eventsSlice.actions.fetchGuestsFailure(
            "No response received from server"
          )
        );
      } else {
        dispatch(
          eventsSlice.actions.fetchGuestsFailure(
            axiosError.message || "Unexpected error occurred"
          )
        );
      }
    } else {
      dispatch(
        eventsSlice.actions.fetchGuestsFailure("Unexpected error occurred")
      );
    }
  }
};

// Ticket resale
export const resaleTicket = (
  userId: string,
  ticketId: string,
  resalePrice: number,
  sellToPublic: boolean
) => async (dispatch: AppDispatch) => {
  dispatch(eventsSlice.actions.resaleTicketStart());
  try {
    await axios.post(
      `https://gigartz.onrender.com/resale-ticket`,
      { userId, ticketId, resalePrice, sellToPublic }
    );
    dispatch(eventsSlice.actions.resaleTicketSuccess("Ticket listed for resale successfully!"));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const errorData = axiosError.response.data as Record<string, unknown>;
        const errorMsg = typeof errorData?.error === 'string' ? errorData.error : "Failed to list ticket for resale";
        dispatch(
          eventsSlice.actions.resaleTicketFailure(errorMsg)
        );
      } else if (axiosError.request) {
        dispatch(
          eventsSlice.actions.resaleTicketFailure(
            "No response received from server"
          )
        );
      } else {
        dispatch(
          eventsSlice.actions.resaleTicketFailure(
            axiosError.message || "Unexpected error occurred"
          )
        );
      }
    } else {
      dispatch(
        eventsSlice.actions.resaleTicketFailure("Unexpected error occurred")
      );
    }
  }
};

// Ticket refund
export const refundTicket = (
  userId: string,
  ticketId: string,
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    routingNumber: string;
  }
) => async (dispatch: AppDispatch) => {
  dispatch(eventsSlice.actions.refundTicketStart());
  try {
    await axios.post(
      `https://gigartz.onrender.com/refundTicket`,
      { userId, ticketId, bankDetails }
    );
    dispatch(eventsSlice.actions.refundTicketSuccess("Refund processed successfully!"));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const errorData = axiosError.response.data as Record<string, unknown>;
        const errorMsg = typeof errorData?.error === 'string' ? errorData.error : "Failed to process refund";
        dispatch(
          eventsSlice.actions.refundTicketFailure(errorMsg)
        );
      } else if (axiosError.request) {
        dispatch(
          eventsSlice.actions.refundTicketFailure(
            "No response received from server"
          )
        );
      } else {
        dispatch(
          eventsSlice.actions.refundTicketFailure(
            axiosError.message || "Unexpected error occurred"
          )
        );
      }
    } else {
      dispatch(
        eventsSlice.actions.refundTicketFailure("Unexpected error occurred")
      );
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
  resaleTicketStart,
  resaleTicketSuccess,
  resaleTicketFailure,
  refundTicketStart,
  refundTicketSuccess,
  refundTicketFailure,
  fetchGuestListsStart,
  fetchGuestListsSuccess,
  fetchGuestListsFailure,
  fetchGuestsStart,
  fetchGuestsSuccess,
  fetchGuestsFailure,
} = eventsSlice.actions;

export default eventsSlice.reducer;