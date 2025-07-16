
import { showToast } from "../../store/notificationSlice";
import { AppDispatch } from "../../store/store";

export interface NotificationPayload {
    type: string;
    data: Record<string, unknown>;
    read?: boolean;
}

export const notify = (dispatch: AppDispatch, payload: NotificationPayload) => {
    console.log('[notify] Dispatching notification', payload);
    // Only show global Toast

    // Show global Toast (single, unified)
    let toastType: 'success' | 'error' | 'info' = 'info';
    let message = '';
    if (payload.type === 'event' || payload.type === 'review' || payload.type === 'guestlist') {
        // Try to extract a message and type from payload.data
        if (typeof payload.data?.message === 'string') message = payload.data.message;
        if (typeof payload.data?.type === 'string' && ['success', 'error', 'info'].includes(payload.data.type)) {
            toastType = payload.data.type as 'success' | 'error' | 'info';
        }
        // Fallbacks
        if (!message) message = payload.type.charAt(0).toUpperCase() + payload.type.slice(1) + ' notification';
    } else {
        message = typeof payload.data?.message === 'string' ? payload.data.message : 'Notification';
    }
    dispatch(
        showToast({
            message,
            type: toastType,
        })
    );
};
