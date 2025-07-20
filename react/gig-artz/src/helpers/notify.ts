
import { showToast, addNotification } from "../../store/notificationSlice";
import store from "../../store/store";

/**
 * Simple notification API
 * @param message - The notification message to display
 * @param type - The type of notification (success, error, info, warning)
 */
export function notify(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    const dispatch = store.dispatch;

    // Dispatch toast notification (temporary popup)
    dispatch(
        showToast({
            message,
            type: type,
        })
    );

    // Also add persistent notification to the notifications page
    dispatch(
        addNotification({
            type: 'general',
            data: { message, type },
            read: false
        })
    );
}
