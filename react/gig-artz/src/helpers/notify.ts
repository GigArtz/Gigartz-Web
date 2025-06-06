import { send } from "vite";
import { addNotification } from "../../store/notificationSlice";
import { AppDispatch } from "../../store/store";

export interface NotificationPayload {
    type: string;
    data: Record<string, unknown>;
    read?: boolean;
}

export const notify = (dispatch: AppDispatch, payload: NotificationPayload) => {
    console.log('[notify] Dispatching notification', payload);
    dispatch(
        addNotification({
            ...payload,
            read: false,
        })
    );

};
