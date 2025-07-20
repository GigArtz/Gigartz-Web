import React from "react";
import {
  FaUserPlus,
  FaTicketAlt,
  FaCalendarCheck,
  FaGift,
  FaInfoCircle,
} from "react-icons/fa";

interface NotificationData {
  username?: string;
  event?: string;
  service?: string;
  date?: string;
  amount?: string;
  message?: string;
  [key: string]: unknown;
}

interface NotificationProps {
  type: string;
  data: NotificationData;
  isRead?: boolean;
  createdAt?: string;
}

const notificationTypes = {
  follower: {
    icon: <FaUserPlus className="text-blue-400" />,
    message: (data: NotificationData) =>
      `${data.username || "Someone"} started following you!`,
    bgColor: "from-blue-500/10 to-blue-600/10",
    borderColor: "border-blue-400/30",
    iconBg: "bg-blue-500/20",
  },
  ticket: {
    icon: <FaTicketAlt className="text-green-400" />,
    message: (data: NotificationData) =>
      `Your ticket for ${data.event || "an event"} has been confirmed!`,
    bgColor: "from-green-500/10 to-green-600/10",
    borderColor: "border-green-400/30",
    iconBg: "bg-green-500/20",
  },
  booking: {
    icon: <FaCalendarCheck className="text-purple-400" />,
    message: (data: NotificationData) =>
      `Your booking for ${data.service || "a service"} on ${
        data.date || "the selected date"
      } is confirmed!`,
    bgColor: "from-purple-500/10 to-purple-600/10",
    borderColor: "border-purple-400/30",
    iconBg: "bg-purple-500/20",
  },
  tip: {
    icon: <FaGift className="text-yellow-400" />,
    message: (data: NotificationData) =>
      `${data.username || "Someone"} sent you a tip of $${data.amount || "0"}!`,
    bgColor: "from-yellow-500/10 to-yellow-600/10",
    borderColor: "border-yellow-400/30",
    iconBg: "bg-yellow-500/20",
  },
  login: {
    icon: <FaInfoCircle className="text-teal-400" />,
    message: (data: NotificationData) =>
      `Login successful! Welcome back, ${data.username || "user"}. (${
        data.date
          ? new Date(data.date).toLocaleString()
          : new Date().toLocaleString()
      })`,
    bgColor: "from-teal-500/10 to-teal-600/10",
    borderColor: "border-teal-400/30",
    iconBg: "bg-teal-500/20",
  },
  event: {
    icon: <FaCalendarCheck className="text-teal-400" />,
    message: (data: NotificationData) => data.message || "Event notification",
    bgColor: "from-teal-500/10 to-teal-600/10",
    borderColor: "border-teal-400/30",
    iconBg: "bg-teal-500/20",
  },
  review: {
    icon: <FaInfoCircle className="text-yellow-400" />,
    message: (data: NotificationData) => data.message || "Review notification",
    bgColor: "from-yellow-500/10 to-orange-500/10",
    borderColor: "border-yellow-400/30",
    iconBg: "bg-yellow-500/20",
  },
  guestlist: {
    icon: <FaUserPlus className="text-green-400" />,
    message: (data: NotificationData) =>
      data.message || "Guest list notification",
    bgColor: "from-green-500/10 to-emerald-500/10",
    borderColor: "border-green-400/30",
    iconBg: "bg-green-500/20",
  },
  general: {
    icon: <FaInfoCircle className="text-gray-400" />,
    message: (data: NotificationData) => data.message || "Notification",
    bgColor: "from-gray-500/10 to-gray-600/10",
    borderColor: "border-gray-400/30",
    iconBg: "bg-gray-500/20",
  },
};

const Notification: React.FC<NotificationProps> = ({
  type,
  data,
  isRead = false,
  createdAt,
}) => {
  const notification =
    notificationTypes[type as keyof typeof notificationTypes] ||
    notificationTypes.general;

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div
      className={`group relative overflow-hidden backdrop-blur-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-xl cursor-pointer rounded-2xl border ${
        isRead
          ? `bg-gradient-to-r from-gray-800/40 to-gray-700/40 border-gray-600/50 ${notification.borderColor} hover:border-gray-500/60`
          : `bg-gradient-to-r ${notification.bgColor} border ${notification.borderColor} hover:shadow-2xl`
      }`}
    >
      {/* Subtle glow effect for unread notifications */}
      {!isRead && (
        <div
          className={`absolute inset-0 bg-gradient-to-r ${notification.bgColor} opacity-50 blur-xl`}
        ></div>
      )}

      <div className="relative flex items-start p-4 gap-4">
        {/* Icon container with enhanced styling */}
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-xl ${notification.iconBg} flex items-center justify-center border ${notification.borderColor} group-hover:scale-110 transition-transform duration-300`}
        >
          <div className="text-lg">{notification.icon}</div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div
            className={`text-sm font-medium leading-relaxed ${
              isRead ? "text-gray-300" : "text-white"
            } group-hover:text-white transition-colors duration-200`}
          >
            {notification.message(data || {})}
          </div>

          {/* Timestamp with enhanced styling */}
          {createdAt && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
              <span
                className={`text-xs ${
                  isRead ? "text-gray-500" : "text-gray-400"
                } group-hover:text-gray-300 transition-colors duration-200`}
              >
                {formatTime(createdAt)}
              </span>
            </div>
          )}
        </div>

        {/* Unread indicator with pulse animation */}
        {!isRead && (
          <div className="flex-shrink-0 flex items-center">
            <div className="relative">
              <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
              <div className="absolute inset-0 w-3 h-3 bg-teal-400 rounded-full animate-ping opacity-75"></div>
            </div>
          </div>
        )}
      </div>

      {/* Subtle gradient overlay on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${notification.bgColor} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl`}
      ></div>
    </div>
  );
};

export default Notification;

// Example usage:
// <Notification type="follower" data={{ username: "JohnDoe" }} />
// <Notification type="ticket" data={{ event: "Rock Concert 2025" }} />
// <Notification type="booking" data={{ service: "Hotel Room", date: "March 25, 2025" }} />
// <Notification type="tip" data={{ username: "Alice", amount: "20" }} />
// <Notification type="login" data={{ username: "JaneDoe", date: "2023-10-10T14:48:00.000Z" }} />
