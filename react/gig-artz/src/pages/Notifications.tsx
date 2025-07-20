import React, { useEffect } from "react";
import Notification from "../components/Notification";
import Header from "../components/Header";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import {
  loadNotificationsFromLocalStorage,
  markAsRead,
  clearNotifications,
} from "../../store/notificationSlice";
import "../styles/bookings-animations.css";

function Notifications() {
  const dispatch = useDispatch<AppDispatch>();

  // Get notifications from Redux
  const notifications = useSelector(
    (state: RootState) => state.notification.notifications
  );

  // Load notifications from localStorage on component mount
  useEffect(() => {
    dispatch(loadNotificationsFromLocalStorage());
  }, [dispatch]);

  const handleMarkAsRead = (notificationId: string) => {
    dispatch(markAsRead(notificationId));
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      dispatch(clearNotifications());
    }
  };

  // Count unread notifications
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="main-content animate-fade-in">
      <div className="p-2">
        <Header
          title={`Notifications${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
        />

        {/* Action Bar with Enhanced Animations */}
        <div className="flex justify-between items-center mb-6 p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-2xl backdrop-blur-sm border border-gray-600/30 animate-fade-in-up">
          <div className="flex items-center gap-3 animate-slide-in-left">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-200 animate-fade-in animation-delay-200">
                {notifications.length} notification
                {notifications.length !== 1 ? "s" : ""}
              </span>
            </div>
            {unreadCount > 0 && (
              <div className="flex items-center gap-1 bg-teal-500/20 px-2 py-1 rounded-full border border-teal-400/30 animate-bounce-in animation-delay-300">
                <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-teal-300 font-semibold">
                  {unreadCount} unread
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2 animate-slide-in-right">
            <button
              onClick={handleClearAll}
              className="group flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-xs font-medium px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25 transform hover:-translate-y-0.5"
            >
              <svg
                className="w-3 h-3 group-hover:scale-110 transition-transform duration-200"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Clear All
            </button>
          </div>
        </div>

        {/* Notifications List with Enhanced Animations */}
        <div className="max-h-[75vh] overflow-y-auto space-y-3 custom-scrollbar animate-fade-in">
          {(notifications?.length ?? 0) === 0 ? (
            <div className="text-center py-12 animate-fade-in-up">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-teal-500/20 to-teal-600/20 rounded-full flex items-center justify-center border border-teal-400/30 mb-4 animate-bounce-in">
                <svg
                  className="w-8 h-8 text-teal-400 animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 animate-fade-in animation-delay-200">
                No notifications yet
              </h3>
              <p className="text-gray-400 text-sm animate-fade-in animation-delay-400">
                When you have notifications, they'll appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3 animate-fade-in">
              {notifications?.map((n, index) => (
              <div
                key={n.id}
                onClick={() => !n.read && handleMarkAsRead(n.id)}
                className={`group relative cursor-pointer animate-slide-in-up ${
                n.read ? "opacity-75 hover:opacity-90" : "opacity-100"
                }`}
                style={{
                animationDelay: `${index * 100}ms`,
                }}
              >
                {!n.read && (
                <div className="absolute -left-2 top-1/2 transform animate-fade-in-left animation-delay-200">
                  <div className="w-1 h-8 bg-gradient-to-b from-teal-400 to-teal-500 rounded-full shadow-lg shadow-teal-400/50 animate-pulse"></div>
                </div>
                )}
                <div>
                <Notification
                  type={n.type}
                  data={n.data}
                  isRead={n.read}
                  createdAt={n.createdAt}
                />
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications;
