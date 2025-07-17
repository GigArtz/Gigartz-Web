importScripts(
  "https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js"
);

// Use environment variables or fallback to dummy config to prevent errors
const firebaseConfig = {
  apiKey: self.VITE_FIREBASE_API_KEY || "dummy-api-key",
  authDomain: self.VITE_FIREBASE_AUTH_DOMAIN || "dummy-auth-domain",
  projectId: self.VITE_FIREBASE_PROJECT_ID || "dummy-project-id",
  messagingSenderId: self.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: self.VITE_FIREBASE_APP_ID || "dummy-app-id",
};

// Only initialize if proper config is available
if (firebaseConfig.apiKey !== "dummy-api-key") {
  try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Optionally, handle background messages
    messaging.onBackgroundMessage(function (payload) {
      console.log(
        "[firebase-messaging-sw.js] Received background message ",
        payload
      );
      // Customize notification here
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: "/firebase-logo.png",
      };

      self.registration.showNotification(
        notificationTitle,
        notificationOptions
      );
    });
  } catch (error) {
    console.warn(
      "[firebase-messaging-sw.js] Firebase initialization failed:",
      error
    );
  }
} else {
  console.warn(
    "[firebase-messaging-sw.js] Firebase config not available, service worker disabled"
  );
}
