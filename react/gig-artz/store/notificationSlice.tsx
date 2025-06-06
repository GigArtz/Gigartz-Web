import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { AppDispatch } from "./store";

// --- Types ---
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

// --- Local Storage Helpers ---
const NOTIFICATIONS_KEY = "gigartz_notifications";

function saveNotificationsToStorage(notifications: Notification[]) {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch {}
}

function loadNotificationsFromStorage(): Notification[] {
  try {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// --- Initial State ---
const initialState: NotificationState = {
  notifications: loadNotificationsFromStorage(),
  token: null,
  loading: false,
  error: null,
};

// --- Helper Function ---
const createNotification = (
  payload: Omit<Notification, "id" | "createdAt">
): Notification => ({
  ...payload,
  id: uuidv4(),
  createdAt: new Date().toISOString(),
  read: false,
});

// --- Slice ---
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
      const newNotification = createNotification(action.payload);
      state.notifications.unshift(newNotification);
      saveNotificationsToStorage(state.notifications);
      console.log("[NotificationSlice] Added notification", newNotification);
    },
    markAsRead(state, action: PayloadAction<string>) {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification) notification.read = true;
      saveNotificationsToStorage(state.notifications);
    },
    clearNotifications(state) {
      state.notifications = [];
      saveNotificationsToStorage(state.notifications);
    },
    removeNotification(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
      saveNotificationsToStorage(state.notifications);
    },
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    resetError(state) {
      state.error = null;
    },
    loadNotificationsFromLocalStorage(state) {
      state.notifications = loadNotificationsFromStorage();
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
  loadNotificationsFromLocalStorage,
} = notificationSlice.actions;

// --- Thunk ---
export const sendNotificationToBackend =
  ({ token, title, body }: { token: string; title: string; body: string }) =>
  async (dispatch: AppDispatch) => {
    try {
      const response = await axios.post("https://gigartz.onrender.com/device", {
        token,
        title,
        body,
      });
      console.log("[Thunk] Push notification sent:", response.data);
    } catch (error: any) {
      console.error("[Thunk] Failed to send notification:", error);
      dispatch(
        setError(error.message || "Failed to send notification to backend")
      );
    }
  };

export default notificationSlice.reducer;
