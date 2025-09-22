// src/store/eventsSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "./store";
import axios, { AxiosError } from "axios";
import { notify } from "../src/helpers/notify";

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

interface Review {
  userId: string;
  timestamp: Timestamp;
  review: string;
  replies: Review[];
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
  comments: Review[];
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

interface Review {
  userId: string;
  reviewText: string;
  image: string;
  rating: number;
  reviewTitle: string;
}

// Define the state structure for events
interface EventsState {
  events: Event[];
  reviews: Review[];
  loading: boolean;
  error: string | null;
  success: string | null;
  eventsCacheTimestamp: number | null;
  reviewsCacheTimestamp: number | null;
  loadingByEventId: { [eventId: string]: boolean };
  errorByEventId: { [eventId: string]: string | null };
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const initialState: EventsState = {
  events: [],
  reviews: [],
  loading: false,
  error: null,
  success: null,
  eventsCacheTimestamp: null,
  reviewsCacheTimestamp: null,
  loadingByEventId: {},
  errorByEventId: {},
};

const eventsSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    fetchEventsStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchReviewsStart(state) {
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
      // Notification now handled in thunk
    },
    createLikeFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    createReviewSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.success = action.payload;
      state.error = null;
      // Notification now handled in thunk
    },
    createReviewFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    createGuestListSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.success = action.payload;
      state.error = null;
      // Notification now handled in thunk
    },
    createGuestListFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchEventsSuccess(state, action: PayloadAction<Event[]>) {
      state.loading = false;
      state.events = action.payload;
      state.error = null;
      state.eventsCacheTimestamp = Date.now();
    },
    fetchReviewsSuccess(state, action: PayloadAction<Review[]>) {
      state.loading = false;
      // Accepts either array or { reviews: Review[] }
      if (Array.isArray(action.payload)) {
        state.reviews = action.payload;
      } else if (action.payload && typeof action.payload === 'object' && 'reviews' in action.payload) {
        state.reviews = (action.payload as { reviews: Review[] }).reviews;
      } else {
        state.reviews = [];
      }
      state.error = null;
      state.reviewsCacheTimestamp = Date.now();
    },
    createEventsSuccess(state, action: PayloadAction<string>) {
      state.loading = false;
      state.success = action.payload;
      state.error = null;
      // Notification now handled in thunk
    },
    fetchEventsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    fetchReviewsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    createEventsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    buyTicketStart(state, action: PayloadAction<string>) {
      const eventId = action.payload;
      state.loadingByEventId[eventId] = true;
      state.errorByEventId[eventId] = null;
    },
    buyTicketSuccess(state, action: PayloadAction<{ eventId: string; message: string }>) {
      const { eventId, message } = action.payload;
      state.loadingByEventId[eventId] = false;
      state.errorByEventId[eventId] = null;
      state.success = message;
    },
    buyTicketFailure(state, action: PayloadAction<{ eventId: string; error: string }>) {
      const { eventId, error } = action.payload;
      state.loadingByEventId[eventId] = false;
      state.errorByEventId[eventId] = error;
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
      // Notification now handled in thunk
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
      // Notification now handled in thunk
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

// Fetch all events with cache
export const fetchAllEvents = () => async (dispatch: AppDispatch, getState: () => { events: EventsState }) => {
  const { events, eventsCacheTimestamp } = getState().events;
  const now = Date.now();
  if (events.length > 0 && eventsCacheTimestamp && now - eventsCacheTimestamp < CACHE_TTL) {
    // Use cached events
    dispatch(eventsSlice.actions.fetchEventsSuccess(events));
    return;
  }
  dispatch(eventsSlice.actions.fetchEventsStart());
  try {
    const response = await axios.get(`https://gigartz.onrender.com/events`);
    dispatch(eventsSlice.actions.fetchEventsSuccess(response.data));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const errorData = axiosError.response.data as Record<string, unknown>;
        const errorMsg =
          typeof errorData?.message === 'string' ? errorData.message :
            typeof errorData?.error === 'string' ? errorData.error :
              "Failed to fetch events";
        dispatch(
          eventsSlice.actions.fetchEventsFailure(errorMsg)
        );
      } else if (axiosError.request) {
        dispatch(
          eventsSlice.actions.fetchEventsFailure(
            "No response received from server"
          )
        );
      } else {
        dispatch(eventsSlice.actions.fetchEventsFailure(axiosError.message));
      }
    } else {
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
    // Send event notification
    notify(dispatch, {
      type: "event",
      data: { message: "Event added successfully!" },
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const errorData = axiosError.response.data as Record<string, unknown>;
        const errorMsg =
          typeof errorData?.message === 'string' ? errorData.message :
            typeof errorData?.error === 'string' ? errorData.error :
              "Failed to add event";
        dispatch(
          eventsSlice.actions.createEventsFailure(errorMsg)
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
  (guestListData: { userId: string; guestListName: string; isPaid?: boolean; price?: number; billingCycle?: string }) =>
    async (dispatch: AppDispatch) => {
      dispatch(eventsSlice.actions.createGuestListStart());

      try {
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
        // Send guest list notification
        notify(dispatch, {
          type: "guestlist",
          data: { message: "Guest list created successfully!" },
        });
        // Optionally return the new guestListId for the next step
        return response.data.guestListId;
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            console.error("Response error:", axiosError.response?.data);
            dispatch(
              eventsSlice.actions.createGuestListFailure(
                (typeof axiosError.response?.data === 'object' && axiosError.response?.data && 'error' in axiosError.response.data ? (axiosError.response.data as { error: string }).error : "Failed to create guest list")
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
        // Send guest list notification
        notify(dispatch, {
          type: "guestlist",
          data: { message: "Guests added successfully!" },
        });
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            const errorData = axiosError.response.data as Record<string, unknown>;
            const errorMsg =
              typeof errorData?.message === 'string' ? errorData.message :
                typeof errorData?.error === 'string' ? errorData.error :
                  "Failed to add guests";
            dispatch(
              eventsSlice.actions.createGuestListFailure(errorMsg)
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
      console.log(reviewData);

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
        // Send review notification
        notify(dispatch, {
          type: "review",
          data: {
            message: "Review added successfully!",
            type: "success"
          },
        });
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.response) {
            const errorData = axiosError.response.data as Record<string, unknown>;
            const errorMsg =
              typeof errorData?.message === 'string' ? errorData.message :
                typeof errorData?.error === 'string' ? errorData.error :
                  "Failed to add review";
            dispatch(
              eventsSlice.actions.createReviewFailure(errorMsg)
            );
            // Send error notification
            notify(dispatch, {
              type: "review_error",
              data: {
                message: "Failed to add review",
                type: "error"
              },
            });
          } else if (axiosError.request) {
            // The request was made, but no response was received
            console.error("Request error:", axiosError.request);
            dispatch(
              eventsSlice.actions.createReviewFailure(
                "No response received from server"
              )
            );
            // Send error notification
            notify(dispatch, {
              type: "review_error",
              data: {
                message: "Network error - please check your connection",
                type: "error"
              },
            });
          } else {
            // Something else happened during the setup of the request
            console.error("Error setting up request:", axiosError.message);
            dispatch(
              eventsSlice.actions.createReviewFailure(axiosError.message)
            );
            // Send error notification
            notify(dispatch, {
              type: "review_error",
              data: {
                message: "Error adding review",
                type: "error"
              },
            });
          }
        } else {
          // Handle non-Axios errors
          console.error("Unexpected error:", error);
          dispatch(
            eventsSlice.actions.createReviewFailure("Unexpected error occurred")
          );
          // Send error notification
          notify(dispatch, {
            type: "review_error",
            data: {
              message: "Unexpected error occurred",
              type: "error"
            },
          });
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
    // Send like notification
    notify(dispatch, {
      type: "like",
      data: { message: "Like added successfully!" },
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const errorData = axiosError.response.data as Record<string, unknown>;
        const errorMsg =
          typeof errorData?.message === 'string' ? errorData.message :
            typeof errorData?.error === 'string' ? errorData.error :
              "Failed to add like";
        dispatch(
          eventsSlice.actions.createLikeFailure(errorMsg)
        );
      } else if (axiosError.request) {
        // The request was made, but no response was received
        console.error("Request error:", axiosError.request);
        dispatch(
          eventsSlice.actions.createLikeFailure(
            "No response received from server"
          )
        );
      } else {
        // Something else happened during the setup of the request
        console.error("Error setting up request:", axiosError.message);
        dispatch(
          eventsSlice.actions.createLikeFailure(axiosError.message)
        );
      }
    } else {
      // Handle non-Axios errors
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
  ticketTypes: unknown[]; // TODO: Replace 'unknown' with TicketType definition if available
  location: string;
  eventName: string;
  eventDate: string;
  image: string;
};

// Buy a ticket for an event
export const buyTicket = (
  ticketData: EventBooking
) => async (dispatch: AppDispatch) => {
  const eventId = ticketData.eventId;
  dispatch(eventsSlice.actions.buyTicketStart(eventId));
  try {
    await axios.post(
      `https://gigartz.onrender.com/buyTicket`,
      ticketData
    );
    dispatch(eventsSlice.actions.buyTicketSuccess({ eventId, message: "Ticket purchased successfully!" }));
    // Send ticket notification
    notify(dispatch, {
      type: "ticket",
      data: { event: ticketData.eventName },
    });
  } catch (error: unknown) {
    let errorMsg = "Unexpected error occurred";
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const errorData = axiosError.response.data as Record<string, unknown>;
        errorMsg =
          typeof errorData?.message === 'string' ? errorData.message :
            typeof errorData?.error === 'string' ? errorData.error :
              "Failed to buy ticket";
      } else if (axiosError.request) {
        errorMsg = "No response received from server";
      } else {
        errorMsg = axiosError.message || "Unexpected error occurred";
      }
    }
    dispatch(eventsSlice.actions.buyTicketFailure({ eventId, error: errorMsg }));
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
        const errorMsg =
          typeof errorData?.message === 'string' ? errorData.message :
            typeof errorData?.error === 'string' ? errorData.error :
              "Failed to scan ticket";
        dispatch(
          eventsSlice.actions.scanTicketFailure(errorMsg)
        );
      } else if (axiosError.request) {
        // The request was made, but no response was received
        console.error("Request error:", axiosError.request);
        dispatch(
          eventsSlice.actions.scanTicketFailure(
            "No response received from server"
          )
        );
      } else {
        // Something else happened during the setup of the request
        console.error("Error setting up request:", axiosError.message);
        dispatch(
          eventsSlice.actions.scanTicketFailure(axiosError.message)
        );
      }
    } else {
      dispatch(
        eventsSlice.actions.scanTicketFailure("Unexpected error occurred")
      );
    }
  }
};

// Reassign a ticket to a new user
export const reassignTicket = (
  currentUserId: string,
  newUserId: string,
  ticketId: string
) => async (dispatch: AppDispatch) => {
  dispatch(eventsSlice.actions.scanTicketStart()); // Reusing scanTicketStart for loading state

  console.log(currentUserId, newUserId, ticketId)
  try {
    console.log("Reassigning ticket...");
    const response = await axios.post(
      `https://gigartz.onrender.com/reassign-ticket`,
      { currentUserId, newUserId, ticketId }
    );
    console.log("Ticket reassigned successfully:", response.data);

    dispatch(eventsSlice.actions.scanTicketSuccess("Ticket reassigned successfully!"));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const errorData = axiosError.response.data as Record<string, unknown>;
        const errorMsg =
          typeof errorData?.message === 'string' ? errorData.message :
            typeof errorData?.error === 'string' ? errorData.error :
              "Failed to reassign ticket";
        dispatch(
          eventsSlice.actions.scanTicketFailure(errorMsg)
        );
      } else if (axiosError.request) {
        // The request was made, but no response was received
        console.error("Request error:", axiosError.request);
        dispatch(
          eventsSlice.actions.scanTicketFailure(
            "No response received from server"
          )
        );
      } else {
        // Something else happened during the setup of the request
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


// Update an event
export const updateEvent = (
  eventId: string,
  userId: string,
  eventData: Partial<Event>
) => async (dispatch: AppDispatch) => {
  dispatch(eventsSlice.actions.createEventsStart());

  try {
    console.log("Updating event...");
    const response = await axios.put(
      `https://gigartz.onrender.com/users/${userId}/userEvents`,
      { eventId, ...eventData }, // Spread the eventData to include all fields
      { headers: { "Content-Type": "application/json" } } // Ensure JSON format

    );
    console.log("Event updated successfully:", response.data);

    dispatch(
      eventsSlice.actions.createEventsSuccess("Event updated successfully!")
    );
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const errorData = axiosError.response.data as Record<string, unknown>;
        const errorMsg =
          typeof errorData?.message === 'string' ? errorData.message :
            typeof errorData?.error === 'string' ? errorData.error :
              "Failed to update event";
        dispatch(
          eventsSlice.actions.createEventsFailure(errorMsg)
        );
      } else if (axiosError.request) {
        // The request was made, but no response was received
        console.error("Request error:", axiosError.request);
        dispatch(
          eventsSlice.actions.createEventsFailure(
            "No response received from server"
          )
        );
      } else {
        // Something else happened during the setup of the request
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
        const errorMsg =
          typeof errorData?.message === 'string' ? errorData.message :
            typeof errorData?.error === 'string' ? errorData.error :
              "Failed to fetch guest lists";
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
        const errorMsg =
          typeof errorData?.message === 'string' ? errorData.message :
            typeof errorData?.error === 'string' ? errorData.error :
              "Failed to fetch guests";
        dispatch(
          eventsSlice.actions.fetchGuestsFailure(errorMsg)
        );
      } else if (axiosError.request) {
        // The request was made, but no response was received
        console.error("Request error:", axiosError.request);
        dispatch(
          eventsSlice.actions.fetchGuestsFailure(
            "No response received from server"
          )
        );
      } else {
        // Something else happened during the setup of the request
        console.error("Error setting up request:", axiosError.message);
        dispatch(
          eventsSlice.actions.fetchGuestsFailure(axiosError.message)
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
    // Send resale notification
    notify(dispatch, {
      type: "resale",
      data: { message: "Ticket listed for resale successfully!" },
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const errorData = axiosError.response.data as Record<string, unknown>;
        const errorMsg =
          typeof errorData?.message === 'string' ? errorData.message :
            typeof errorData?.error === 'string' ? errorData.error :
              "Failed to list ticket for resale";
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
    console.log({ userId, ticketId, bankDetails });
    await axios.post(
      `https://gigartz.onrender.com/refundTicket`,
      { userId, ticketId, bankDetails }
    );
    dispatch(eventsSlice.actions.refundTicketSuccess("Refund processed successfully!"));
    // Send refund notification
    notify(dispatch, {
      type: "refund",
      data: { message: "Refund processed successfully!" },
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        // Extract error message from response.data.message or response.data.error
        const errorData = axiosError.response.data as Record<string, unknown>;
        const errorMsg =
          typeof errorData?.message === 'string' ? errorData.message :
            typeof errorData?.error === 'string' ? errorData.error :
              "Failed to process refund";
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

// Update guest list (name, paid config)
export const updateGuestList = (userId: string, guestListId: string, guestListName: string, options?: { isPaid?: boolean; price?: number; billingCycle?: string }) => async (dispatch: AppDispatch) => {
  dispatch(eventsSlice.actions.createGuestListStart());
  try {
    await axios.put(
      `https://gigartz.onrender.com/guest-list/edit`,
      { userId, guestListId, guestListName, ...options }
    );
    dispatch(eventsSlice.actions.createGuestListSuccess("Guest list updated successfully!"));
    notify(dispatch, {
      type: "guestlist",
      data: { message: "Guest list updated successfully!" },
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const errorData = axiosError.response.data as Record<string, unknown>;
        const errorMsg =
          typeof errorData?.message === 'string' ? errorData.message :
            typeof errorData?.error === 'string' ? errorData.error :
              "Failed to update guest list";
        dispatch(eventsSlice.actions.createGuestListFailure(errorMsg));
      } else if (axiosError.request) {
        dispatch(eventsSlice.actions.createGuestListFailure("No response received from server"));
      } else {
        dispatch(eventsSlice.actions.createGuestListFailure(axiosError.message || "Unexpected error occurred"));
      }
    } else {
      dispatch(eventsSlice.actions.createGuestListFailure("Unexpected error occurred"));
    }
  }
};

// Delete guest from guest list
export const deleteGuestFromGuestList = (userId: string, guestListId: string, guestId: string) => async (dispatch: AppDispatch) => {
  dispatch(eventsSlice.actions.createGuestListStart());
  try {
    await axios.delete(`https://gigartz.onrender.com/guest-list/delete`, {
      data: { userId, guestListId, guestId }
    });
    dispatch(eventsSlice.actions.createGuestListSuccess("Guest deleted successfully!"));
    notify(dispatch, {
      type: "guestlist",
      data: { message: "Guest deleted successfully!" },
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const errorData = axiosError.response.data as Record<string, unknown>;
        const errorMsg =
          typeof errorData?.message === 'string' ? errorData.message :
            typeof errorData?.error === 'string' ? errorData.error :
              "Failed to delete guest";
        dispatch(eventsSlice.actions.createGuestListFailure(errorMsg));
      } else if (axiosError.request) {
        dispatch(eventsSlice.actions.createGuestListFailure("No response received from server"));
      } else {
        dispatch(eventsSlice.actions.createGuestListFailure(axiosError.message || "Unexpected error occurred"));
      }
    } else {
      dispatch(eventsSlice.actions.createGuestListFailure("Unexpected error occurred"));
    }
  }
};

// Fetch all reviews with cache
export const fetchAllReviews = (userId: string) => async (dispatch: AppDispatch, getState: () => { events: EventsState }) => {
  const { reviews, reviewsCacheTimestamp } = getState().events;
  const now = Date.now();
  if (reviews.length > 0 && reviewsCacheTimestamp && now - reviewsCacheTimestamp < CACHE_TTL) {
    // Use cached reviews
    dispatch(eventsSlice.actions.fetchReviewsSuccess(reviews));
    return;
  }
  dispatch(eventsSlice.actions.fetchReviewsStart());
  try {
    const response = await axios.get(`https://gigartz.onrender.com/events/reviews/${userId}`);
    dispatch(eventsSlice.actions.fetchReviewsSuccess(response.data));
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        const errorData = axiosError.response.data as Record<string, unknown>;
        const errorMsg =
          typeof errorData?.message === 'string' ? errorData.message :
            typeof errorData?.error === 'string' ? errorData.error :
              "Failed to fetch reviews";
        dispatch(eventsSlice.actions.fetchReviewsFailure(errorMsg));
        // Send error notification
        notify(dispatch, {
          type: "review_fetch_error",
          data: {
            message: "Failed to fetch reviews",
            type: "error"
          },
        });
      } else if (axiosError.request) {
        dispatch(eventsSlice.actions.fetchReviewsFailure("No response received from server"));
        // Send error notification
        notify(dispatch, {
          type: "review_fetch_error",
          data: {
            message: "Network error - please check your connection",
            type: "error"
          },
        });
      } else {
        dispatch(eventsSlice.actions.fetchReviewsFailure(axiosError.message || "Unexpected error occurred"));
        // Send error notification
        notify(dispatch, {
          type: "review_fetch_error",
          data: {
            message: "Error fetching reviews",
            type: "error"
          },
        });
      }
    } else {
      dispatch(eventsSlice.actions.fetchReviewsFailure("Unexpected error occurred"));
      // Send error notification
      notify(dispatch, {
        type: "review_fetch_error",
        data: {
          message: "Unexpected error occurred",
          type: "error"
        },
      });
    }
  }
};

// Like review
export const likeReview = (reviewId: string, userId: string) => async (dispatch: AppDispatch) => {
  dispatch(eventsSlice.actions.createLikeStart());
  try {
    await axios.post(`https://gigartz.onrender.com/reviews/${reviewId}/like`, { userId });
    dispatch(eventsSlice.actions.createLikeSuccess("Review liked successfully!"));
    notify(dispatch, {
      type: "like",
      data: {
        message: "Review liked successfully!",
        type: "success"
      },
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data as Record<string, unknown>;
      const errorMsg =
        typeof errorData?.message === 'string' ? errorData.message :
          typeof errorData?.error === 'string' ? errorData.error :
            "Failed to like review";
      dispatch(eventsSlice.actions.createLikeFailure(errorMsg));
      // Send error notification
      notify(dispatch, {
        type: "like_error",
        data: {
          message: "Failed to like review",
          type: "error"
        },
      });
    } else {
      dispatch(eventsSlice.actions.createLikeFailure("Unexpected error occurred"));
      // Send error notification
      notify(dispatch, {
        type: "like_error",
        data: {
          message: "Unexpected error occurred",
          type: "error"
        },
      });
    }
  }
};


// Report event
interface ReportPayload {
  userId: string;
  reason: string;
  additionalDetails?: string;
}

export const reportEvent = (eventId: string, payload: ReportPayload) => async (dispatch: AppDispatch) => {
  try {
    const response = await axios.post(`https://gigartz.onrender.com/event/${eventId}/report`, payload);
    // Optionally dispatch a notification or update state
    notify(dispatch, {
      type: "report",
      data: {
        message: "Event reported successfully!",
        type: "success"
      },
    });
    console.log("Event reported:", response.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Report event error:", error.response?.data || error.message);
      notify(dispatch, {
        type: "report_error",
        data: {
          message: "Failed to report event",
          type: "error"
        },
      });
    } else {
      console.error("Unexpected report event error:", error);
      notify(dispatch, {
        type: "report_error",
        data: {
          message: "Unexpected error occurred while reporting event",
          type: "error"
        },
      });
    }
  }
};

// Report review
export const reportReview = (reviewId: string, payload: ReportPayload) => async (dispatch: AppDispatch) => {
  try {
    const response = await axios.post(`https://gigartz.onrender.com/reviews/${reviewId}/report`, payload);
    notify(dispatch, {
      type: "report",
      data: {
        message: "Review reported successfully!",
        type: "success"
      },
    });
    console.log("Review reported:", response.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error("Report review error:", error.response?.data || error.message);
      notify(dispatch, {
        type: "report_error",
        data: {
          message: "Failed to report review",
          type: "error"
        },
      });
    } else {
      console.error("Unexpected report review error:", error);
      notify(dispatch, {
        type: "report_error",
        data: {
          message: "Unexpected error occurred while reporting review",
          type: "error"
        },
      });
    }
  }
};

// Repost a review
export const repostReview = (reviewId: string, userId: string) => async (dispatch: AppDispatch) => {
  dispatch(eventsSlice.actions.createReviewStart());
  try {
    await axios.post(`https://gigartz.onrender.com/reviews/${reviewId}/repost`, { userId });
    dispatch(eventsSlice.actions.createReviewSuccess("Review reposted successfully!"));
    notify(dispatch, {
      type: "review",
      data: {
        message: "Review reposted successfully!",
        type: "success"
      },
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data as Record<string, unknown>;
      const errorMsg =
        typeof errorData?.message === 'string' ? errorData.message :
          typeof errorData?.error === 'string' ? errorData.error :
            "Failed to repost review";
      dispatch(eventsSlice.actions.createReviewFailure(errorMsg));
      // Send error notification
      notify(dispatch, {
        type: "review_error",
        data: {
          message: "Failed to repost review",
          type: "error"
        },
      });
    } else {
      dispatch(eventsSlice.actions.createReviewFailure("Unexpected error occurred"));
      // Send error notification
      notify(dispatch, {
        type: "review_error",
        data: {
          message: "Unexpected error occurred",
          type: "error"
        },
      });
    }
  }
};

// Repost event
export const repostEvent = (eventId: string, userId: string) => async (dispatch: AppDispatch) => {
  dispatch(eventsSlice.actions.createEventsStart());
  try {
    await axios.post(`https://gigartz.onrender.com/event/${eventId}/repost`, { userId });
    dispatch(eventsSlice.actions.createEventsSuccess("Event reposted successfully!"));
    notify(dispatch, {
      type: "event",
      data: { message: "Event reposted successfully!" },
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data as Record<string, unknown>;
      const errorMsg =
        typeof errorData?.message === 'string' ? errorData.message :
          typeof errorData?.error === 'string' ? errorData.error :
            "Failed to repost event";
      dispatch(eventsSlice.actions.createEventsFailure(errorMsg));
    } else {
      dispatch(eventsSlice.actions.createEventsFailure("Unexpected error occurred"));
    }
  }
};

// Save event
export const saveEvent = (eventId: string, userId: string) => async (dispatch: AppDispatch) => {
  dispatch(eventsSlice.actions.createEventsStart());
  try {
    await axios.post(`https://gigartz.onrender.com/event/${eventId}/save`, { userId });
    dispatch(eventsSlice.actions.createEventsSuccess("Event saved successfully!"));
    notify(dispatch, {
      type: "event",
      data: { message: "Event saved successfully!" },
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data as Record<string, unknown>;
      const errorMsg =
        typeof errorData?.message === 'string' ? errorData.message :
          typeof errorData?.error === 'string' ? errorData.error :
            "Failed to save event";
      dispatch(eventsSlice.actions.createEventsFailure(errorMsg));
    } else {
      dispatch(eventsSlice.actions.createEventsFailure("Unexpected error occurred"));
    }
  }
};

// Comment on review
interface CommentPayload {
  userId: string;
  comment: string;
}

export const commentOnReview = (reviewId: string, payload: CommentPayload) => async (dispatch: AppDispatch) => {
  dispatch(eventsSlice.actions.createReviewStart());
  try {
    await axios.post(`https://gigartz.onrender.com/reviews/${reviewId}/comment`, payload);
    dispatch(eventsSlice.actions.createReviewSuccess("Comment added successfully!"));
    notify(dispatch, {
      type: "review",
      data: {
        message: "Comment added successfully!",
        type: "success"
      },
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data as Record<string, unknown>;
      const errorMsg =
        typeof errorData?.message === 'string' ? errorData.message :
          typeof errorData?.error === 'string' ? errorData.error :
            "Failed to comment on review";
      dispatch(eventsSlice.actions.createReviewFailure(errorMsg));
      // Send error notification
      notify(dispatch, {
        type: "review_error",
        data: {
          message: "Failed to comment on review",
          type: "error"
        },
      });
    } else {
      dispatch(eventsSlice.actions.createReviewFailure("Unexpected error occurred"));
      // Send error notification
      notify(dispatch, {
        type: "review_error",
        data: {
          message: "Unexpected error occurred",
          type: "error"
        },
      });
    }
  }
};

// Save review
export const saveReview = (reviewId: string, userId: string) => async (dispatch: AppDispatch) => {
  dispatch(eventsSlice.actions.createReviewStart());
  try {
    await axios.post(`https://gigartz.onrender.com/reviews/${reviewId}/save`, { userId });
    dispatch(eventsSlice.actions.createReviewSuccess("Review saved successfully!"));
    notify(dispatch, {
      type: "review",
      data: {
        message: "Review saved successfully!",
        type: "success"
      },
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data as Record<string, unknown>;
      const errorMsg =
        typeof errorData?.message === 'string' ? errorData.message :
          typeof errorData?.error === 'string' ? errorData.error :
            "Failed to save review";
      dispatch(eventsSlice.actions.createReviewFailure(errorMsg));
      // Send error notification
      notify(dispatch, {
        type: "review_error",
        data: {
          message: "Failed to save review",
          type: "error"
        },
      });
    } else {
      dispatch(eventsSlice.actions.createReviewFailure("Unexpected error occurred"));
      // Send error notification
      notify(dispatch, {
        type: "review_error",
        data: {
          message: "Unexpected error occurred",
          type: "error"
        },
      });
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
  fetchReviewsSuccess,
  fetchReviewsFailure,
} = eventsSlice.actions;

export default eventsSlice.reducer;