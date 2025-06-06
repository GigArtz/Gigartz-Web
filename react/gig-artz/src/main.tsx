import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { getMessaging, onMessage, getToken } from "firebase/messaging";

import App from "./App";
import firebaseApp from "./config/firebase";

// Dynamically inject Google Maps script for Places Autocomplete
const injectGoogleMapsScript = () => {
  if (document.getElementById("google-maps-script")) return;
  const script = document.createElement("script");
  script.id = "google-maps-script";
  script.src = `https://maps.googleapis.com/maps/api/js?key=${
    import.meta.env.VITE_MAPS_API_KEY
  }&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    window.mapsReady = true;
  };
  document.head.appendChild(script);
};

injectGoogleMapsScript();

// Register service worker and only then allow FCM logic to run
const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
      console.log("Service Worker registered:", registration);
      return registration;
    } catch (err) {
      console.error("Service Worker registration failed:", err);
      return null;
    }
  }
  return null;
};

registerServiceWorker();

// Your VAPID key from Firebase → Project Settings → Cloud Messaging
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

const initializeMessaging = async () => {
  const registration = await registerServiceWorker();
  if (!registration) return;

  const messaging = getMessaging(firebaseApp);

  // Request permission
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return;
  }

  // Get the FCM token
  try {
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    if (token) {
      const { setToken } = await import("../store/notificationSlice");
      const store = (await import("../store/store")).default;
      store.dispatch(setToken(token));
    }
  } catch (err) {
    // Optionally log error
  }

  // Listen for foreground messages
  onMessage(messaging, (payload) => {
    const notificationTitle = payload.notification?.title || "New Notification";
    const notificationOptions = {
      body: payload.notification?.body || "You have a new message",
      icon: payload.notification?.icon || "/favicon.ico",
    };

    if (!("Notification" in window)) {
      alert("This browser does not support notifications.");
      return;
    }

    if (Notification.permission === "granted") {
      try {
        new Notification(notificationTitle, notificationOptions);
      } catch (err) {
        alert("Notification API error: " + err);
        alert(notificationTitle + "\n" + notificationOptions.body);
      }
    } else {
      alert(notificationTitle + "\n" + notificationOptions.body);
    }
  });
};

initializeMessaging();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
