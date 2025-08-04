import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

// Async thunk to fetch notifications from backend
export const fetchNotifications = createAsyncThunk(
    "notification/fetchNotifications",
    async (token: string, thunkAPI) => {
        try {
            // Replace with your backend endpoint
            const response = await fetch("/api/notifications", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error("Failed to fetch notifications");
            }
            return await response.json();
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);


// Send notification to a single device
export const sendNotificationToDevice = createAsyncThunk(
    "notification/sendNotificationToDevice",
    async (
        { token, body, title, authToken }: { token: string; body: string; title: string; authToken?: string },
        thunkAPI
    ) => {
        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
            const response = await fetch("https://gigartz.onrender.com/device", {
                method: "POST",
                headers,
                body: JSON.stringify({ token, body, title }),
            });
            if (!response.ok) {
                throw new Error("Failed to send notification to device");
            }
            return await response.json();
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);

// Send notification to multiple devices
export const sendNotificationToDevices = createAsyncThunk(
    "notification/sendNotificationToDevices",
    async (
        { tokens, body, title, authToken }: { tokens: string[]; body: string; title: string; authToken?: string },
        thunkAPI
    ) => {
        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
            const response = await fetch("https://gigartz.onrender.com/devices", {
                method: "POST",
                headers,
                body: JSON.stringify({ tokens, body, title }),
            });
            if (!response.ok) {
                throw new Error("Failed to send notification to devices");
            }
            return await response.json();
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);

// Subscribe a device to a topic
export const subscribeToTopic = createAsyncThunk(
    "notification/subscribeToTopic",
    async (
        { token, topic, authToken }: { token: string; topic: string; authToken?: string },
        thunkAPI
    ) => {
        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
            const response = await fetch("https://gigartz.onrender.com/subscribe", {
                method: "POST",
                headers,
                body: JSON.stringify({ token, topic }),
            });
            if (!response.ok) {
                throw new Error("Failed to subscribe to topic");
            }
            return await response.json();
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);

// Unsubscribe a device from a topic
export const unsubscribeFromTopic = createAsyncThunk(
    "notification/unsubscribeFromTopic",
    async (
        { token, topic, authToken }: { token: string; topic: string; authToken?: string },
        thunkAPI
    ) => {
        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
            const response = await fetch("https://gigartz.onrender.com/unsubscribe", {
                method: "POST",
                headers,
                body: JSON.stringify({ token, topic }),
            });
            if (!response.ok) {
                throw new Error("Failed to unsubscribe from topic");
            }
            return await response.json();
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);

// Send notification to a topic
export const sendNotificationToTopic = createAsyncThunk(
    "notification/sendNotificationToTopic",
    async (
        { topic, body, title, authToken }: { topic: string; body: string; title: string; authToken?: string },
        thunkAPI
    ) => {
        try {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
            const response = await fetch("https://gigartz.onrender.com/topic", {
                method: "POST",
                headers,
                body: JSON.stringify({ topic, body, title }),
            });
            if (!response.ok) {
                throw new Error("Failed to send notification to topic");
            }
            return await response.json();
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);


export interface Notification {
    id: string;
    type: string;
    data: Record<string, unknown>;
    read: boolean;
    createdAt: string;
}

export interface NotificationState {
    toast: {
        message: string;
        type?: "success" | "error" | "info" | "warning";
        action?: { label: string; onClick: string } | null;
        id: number;
    } | null;
    token?: string | null;
    notifications: Notification[];
    error?: string | null;
}

const NOTIFICATIONS_KEY = "gigartz_notifications";

function saveNotificationsToStorage(notifications: Notification[]) {
    try {
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch {
        // Ignore storage errors
    }
}

function loadNotificationsFromStorage(): Notification[] {
    try {
        const data = localStorage.getItem(NOTIFICATIONS_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

const initialState: NotificationState = {
    toast: null,
    token: null,
    notifications: loadNotificationsFromStorage(),
};

const createNotification = (
    payload: Omit<Notification, "id" | "createdAt">,
): Notification => ({
    ...payload,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    read: false,
});

const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        setToken: (state, action: PayloadAction<string | null>) => {
            state.token = action.payload;
        },
        showToast: (
            state,
            action: PayloadAction<{
                message: string;
                type?: "success" | "error" | "info" | "warning";
                action?: { label: string; onClick: string } | null;
            }>
        ) => {
            // Clear previous error when showing a new toast
            state.toast = {
                ...action.payload,
                id: Date.now(),
            };
            state.error = null;
        },
        clearToast: (state) => {
            state.toast = null;
            state.error = null;
        },
        addNotification: (
            state,
            action: PayloadAction<Omit<Notification, "id" | "createdAt">>
        ) => {
            // Clear previous error when adding a new notification
            const newNotification = createNotification(action.payload);
            state.notifications.unshift(newNotification);
            state.error = null;
            saveNotificationsToStorage(state.notifications);
            // Note: Auto-removal is handled in the GlobalNotification component, not here
        },
        markAsRead: (state, action: PayloadAction<string>) => {
            const notification = state.notifications.find(
                (n) => n.id === action.payload
            );
            if (notification) notification.read = true;
            saveNotificationsToStorage(state.notifications);
        },
        clearNotifications: (state) => {
            state.notifications = [];
            saveNotificationsToStorage(state.notifications);
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter(
                (n) => n.id !== action.payload
            );
            saveNotificationsToStorage(state.notifications);
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload;
        },
        resetError: (state) => {
            state.error = null;
        },
        loadNotificationsFromLocalStorage: (state) => {
            state.notifications = loadNotificationsFromStorage();
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchNotifications.fulfilled, (state, action) => {
            state.notifications = action.payload;
            saveNotificationsToStorage(state.notifications);
        });
    },
});

export const {
    setToken,
    showToast,
    clearToast,
    loadNotificationsFromLocalStorage,
    addNotification,
    markAsRead,
    clearNotifications,
    removeNotification,
    resetError
} = notificationSlice.actions;
export default notificationSlice.reducer;
