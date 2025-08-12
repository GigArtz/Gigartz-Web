import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { AppDispatch } from "./store";
import { notify } from "../src/helpers/notify";

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

// Message interface
export interface Message {
  senderId: string;
  receiverId: string;
  message: string;
  timestamp?: string; // Optional timestamp to track when the message was sent
}

// Contacts interface
export interface Contact {
  user: UserProfile[];
}

// Conversation interface
export interface Conversation {
  contact: string;
  messages: Message[];
}

// Messages interface (adjusted)
export interface Messages {
  contacts: Contact[];
  conversations: Conversation[];
}

// State interface for messages
export interface MessageState {
  messages: Messages[];
  contacts: Contact[] | null;
  conversations: Conversation[] | null;
  loading: boolean;
  error: string | null;
}

// Initial state for the slice
const initialState: MessageState = {
  messages: [],
  contacts: [],
  conversations: [],
  loading: false,
  error: null,
};

// Utility function for handling Axios errors
const handleAxiosError = (
  error: unknown,
  dispatch: AppDispatch,
  failureAction: (message: string) => PayloadAction<string>
) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      // Handle response errors
      console.error("Response error:", axiosError.response?.data);
      dispatch(failureAction(axiosError.response?.data?.error || "Failed to fetch messages"));
    } else if (axiosError.request) {
      // Handle request errors
      console.error("Request error:", axiosError.request);
      dispatch(failureAction("No response received from server"));
    } else {
      // Handle other Axios-related errors
      console.error("Error setting up request:", axiosError.message);
      dispatch(failureAction(axiosError.message));
    }
  } else {
    // Handle non-Axios errors
    console.error("Unexpected error:", error);
    dispatch(failureAction("Unexpected error occurred"));
  }
};

// Redux slice for messages
const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    fetchMessageStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchMessageSuccess(state, action: PayloadAction<Messages>) {
      state.loading = false;
      state.contacts = action.payload.contacts;
      state.conversations = action.payload.conversations;
      state.error = null;
    },
    fetchMessageFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    resetError(state) {
      state.error = null;
    },
    sendMessageStart(state) {
      state.loading = true;
      state.error = null;
    },
    sendMessageSuccess(state, action: PayloadAction<Message>) {
      state.loading = false;
      const newMessage = action.payload;

      // Log the current conversations for debugging
      console.log("Current conversations:", state.conversations);

      // Find the conversation to update using receiverId or senderId
      let conversation = state.conversations?.find(
        (conv) =>
          conv.contact === newMessage.receiverId || // Match receiverId
          conv.contact === newMessage.senderId      // Match senderId (for two-way conversations)
      );

      if (conversation) {
        // Add the new message to the existing conversation
        conversation.messages.push(newMessage);
      } else {
        console.warn("No matching conversation found for the new message:", newMessage);

        // Create a new conversation if none exists
        const newConversation = {
          contact: newMessage.receiverId,
          messages: [newMessage],
        };
        state.conversations.push(newConversation);
        console.log("Created a new conversation:", newConversation);
      }

      state.error = null;
    },
    sendMessageFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    addConversation: (state, action) => {
      state.conversations.push(action.payload);
    },
    addMessageToConversation: (state, action) => {
      const { contact, message } = action.payload;

      // Match conversation using receiverId
      const conversation = state.conversations?.find(
        (conv) => conv.contact === contact
      );

      if (conversation) {
        conversation.messages.push(message);
      }
    },
  },
});

// Thunk to fetch messages
export const getMessages =
  (userId: string) => async (dispatch: AppDispatch) => {
    dispatch(messageSlice.actions.fetchMessageStart());

    if (!userId) {
      // Handle the case where userId is not available (e.g., user not logged in)
      dispatch(messageSlice.actions.fetchMessageFailure("User not logged in or UID missing"));
      return;
    }

    try {
      const response = await axios.get(`https://gigartz.onrender.com/get-messages/${userId}`);
      console.log("Fetched conversation messages:", response.data);
      console.log("Fetched conversation contacts:", response.data.contacts);
      console.log("Fetched conversation conversation:", response.data.conversations);
      dispatch(messageSlice.actions.fetchMessageSuccess(response.data));
    } catch (error: unknown) {
      handleAxiosError(error, dispatch, messageSlice.actions.fetchMessageFailure);
    }
  };

// Thunk to send a message
export const sendMessage =
  (messageData: Message) => async (dispatch: AppDispatch) => {
    dispatch(messageSlice.actions.sendMessageStart());

    console.log("sending message:", messageData);

    try {
      const response = await axios.post("https://gigartz.onrender.com/send-message", messageData);
      console.log("Message sent successfully:", response.data);

      // Validate the server response
      const newMessage = response.data?.message && response.data.receiverId && response.data.senderId && response.data.timestamp
        ? response.data // Use the message object from the server if valid
        : {
          ...messageData, // Use the original message data
          timestamp: new Date().toISOString(), // Add a timestamp if missing
        };

      // Dispatch success action and add the sent message to the state
      dispatch(messageSlice.actions.sendMessageSuccess(newMessage));

      // Add notification for successful message send
      notify(dispatch, {
        type: "general",
        data: {
          message: "Message sent successfully!",
          type: "success"
        }
      });

    } catch (error: unknown) {
      handleAxiosError(error, dispatch, messageSlice.actions.sendMessageFailure);

      // Add notification for message send failure
      notify(dispatch, {
        type: "general",
        data: {
          message: "Failed to send message. Please try again.",
          type: "error"
        }
      });
    }
  };

// Export actions and reducer
export const {
  fetchMessageStart,
  fetchMessageSuccess,
  fetchMessageFailure,
  sendMessageStart,
  sendMessageSuccess,
  sendMessageFailure,
  resetError,
  addConversation,
  addMessageToConversation,
} = messageSlice.actions;

// Thunk to send a broadcast message to a guest list
export const sendBroadcastMessage =
  (broadcastData: {
    userId: string;
    guestListId: string;
    title: string;
    body: string;
  }) => async (dispatch: AppDispatch) => {
    dispatch(messageSlice.actions.sendMessageStart());

    try {
      const response = await axios.post(
        "http://gigartz.onrender.com/guest-list/broadcast-message",
        broadcastData
      );
      console.log("Broadcast message sent successfully:", response.data);

      // Optionally, you can dispatch a success action or notification
      notify(dispatch, {
        type: "general",
        data: {
          message: response.data.message || "Broadcast sent successfully!",
          type: "success",
        },
      });
    } catch (error: unknown) {
      handleAxiosError(error, dispatch, messageSlice.actions.sendMessageFailure);
      notify(dispatch, {
        type: "general",
        data: {
          message: "Failed to send broadcast message. Please try again.",
          type: "error",
        },
      });
    }
  };
export default messageSlice.reducer;