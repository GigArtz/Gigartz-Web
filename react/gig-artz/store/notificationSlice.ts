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

// Async thunk to send notification to backend
export const sendNotificationToBackend = createAsyncThunk(
    "notification/sendNotificationToBackend",
    async (
        {
            token,
            body,
            title,
        }: { token: string; body: string; title: string },
        thunkAPI
    ) => {
        try {
            // Replace with your backend endpoint
            const response = await fetch("/api/notifications/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ body, title }),
            });
            if (!response.ok) {
                throw new Error("Failed to send notification");
            }
            return await response.json();
        } catch (error) {
            return thunkAPI.rejectWithValue((error as Error).message);
        }
    }
);
// ...existing code...

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
}

const NOTIFICATIONS_KEY = "gigartz_notifications";

function saveNotificationsToStorage(notifications: Notification[]) {
    try {
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch { }
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
            state.toast = {
                ...action.payload,
                id: Date.now(),
            };
        },
        clearToast: (state) => {
            state.toast = null;
        },
        addNotification: (
            state,
            action: PayloadAction<Omit<Notification, "id" | "createdAt">>
        ) => {
            const newNotification = createNotification(action.payload);
            state.notifications.unshift(newNotification);
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
            // You can add error handling logic here
        },
        resetError: (state) => {
            // You can add error reset logic here
            
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
    removeNotification
} = notificationSlice.actions;
export default notificationSlice.reducer;
