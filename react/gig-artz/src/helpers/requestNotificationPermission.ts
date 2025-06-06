import firebaseApp from "../config/firebase";
import { getToken, getMessaging } from "firebase/messaging";

// Utility to request notification permission and get FCM token
export const requestNotificationPermission = async (): Promise<string | null> => {
    try {
        // Wait for service worker registration before requesting token
        let registration: ServiceWorkerRegistration | null = null;
        if ("serviceWorker" in navigator) {
            registration = await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js");
            if (!registration) {
                registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
            }
        }
        if (!registration) {
            return null;
        }
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        if (!vapidKey) {
            return null;
        }
        const messaging = getMessaging(firebaseApp);
        const currentToken = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
        if (currentToken) {
            return currentToken;
        } else {
            return null;
        }
    } catch {
        return null;
    }
};
