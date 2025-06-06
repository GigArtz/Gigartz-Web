import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { AppDispatch } from "./store";

export interface Notification {
  id: string;
  type: string;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  token: null,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    addNotification(
      state,
      action: PayloadAction<Omit<Notification, "id" | "createdAt">>
    ) {
      const newNotification: Notification = {
        ...action.payload,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        read: false,
      };
      state.notifications.unshift(newNotification);
      console.log("[NotificationSlice] addNotification", newNotification);
      // Send push notification if token exists
      if (state.token) {
        const notificationToSend = {
          token: state.token,
          body: "You have a new notification",
          title: "New Notification",
        };
        axios
          .post("https://gigartz.onrender.com/device", notificationToSend)
          .then((res) => {
            console.log(
              "[NotificationSlice] Push notification sent:",
              res.data
            );
          })
          .catch((error) => {
            console.error("Failed to send notification to backend:", error);
            state.error = "Failed to send notification to backend";
          });
      } else {
        console.warn(
          "[NotificationSlice] No device token set, push notification not sent."
        );
      }
      console.log(
        "[NotificationSlice] addNotification to backend",
        action.payload
      );
    },
    markAsRead(state, action: PayloadAction<string>) {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification) notification.read = true;
      console.log(
        "[NotificationSlice] markAsRead",
        action.payload,
        notification
      );
    },
    clearNotifications(state) {
      state.notifications = [];
      console.log("[NotificationSlice] clearNotifications");
    },
    removeNotification(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
      console.log("[NotificationSlice] removeNotification", action.payload);
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      console.log("[NotificationSlice] setError", action.payload);
    },
    resetError(state) {
      state.error = null;
      console.log("[NotificationSlice] resetError");
    },
  },
});

export const {
  setToken,
  addNotification,
  markAsRead,
  clearNotifications,
  removeNotification,
  setError,
  resetError,
} = notificationSlice.actions;

// Async thunk to send notification to backend
export const sendNotificationToBackend =
  (notification: { token: string; body: string; title: string }) =>
  async (dispatch: AppDispatch) => {
    try {
      await axios.post("https://gigartz.onrender.com/device", notification);
    } catch {
      dispatch(setError("Failed to send notification to backend"));
    }
  };

export default notificationSlice.reducer;
