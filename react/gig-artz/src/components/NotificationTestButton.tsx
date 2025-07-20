import React from "react";
import { notify } from "../helpers/notify";

/**
 * Test component to verify global notifications are working
 * Add this component to any page to test notifications
 */
const NotificationTestButton: React.FC = () => {
  const testNotifications = () => {
    console.log("🧪 Testing all notification types...");

    // Test each notification type with a delay
    setTimeout(() => {
      notify("Profile updated successfully! ✅", "success");
    }, 100);

    setTimeout(() => {
      notify("This is an informational message 📋", "info");
    }, 600);

    setTimeout(() => {
      notify("Warning: Please review your settings ⚠️", "warning");
    }, 1100);

    setTimeout(() => {
      notify("Error: Something went wrong ❌", "error");
    }, 1600);
  };

  const testSingleSuccess = () => {
    notify("Single success notification! 🎉", "success");
  };

  const testSingleError = () => {
    notify("Single error notification! 💥", "error");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-900/90 backdrop-blur-sm p-4 rounded-xl border border-gray-700 space-y-2">
      <h3 className="text-white text-sm font-semibold mb-2">
        🔔 Test Notifications
      </h3>
      <div className="space-y-1">
        <button
          onClick={testNotifications}
          className="block w-full text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition"
        >
          Test All Types
        </button>
        <button
          onClick={testSingleSuccess}
          className="block w-full text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition"
        >
          Test Success
        </button>
        <button
          onClick={testSingleError}
          className="block w-full text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition"
        >
          Test Error
        </button>
      </div>
    </div>
  );
};

export default NotificationTestButton;
