import React from "react";
import {
  FaUserPlus,
  FaTicketAlt,
  FaCalendarCheck,
  FaGift,
  FaInfoCircle,
} from "react-icons/fa";

const notificationTypes = {
  follower: {
    icon: <FaUserPlus className="text-blue-500" />,
    message: (data) => `${data.username} started following you!`,
  },
  ticket: {
    icon: <FaTicketAlt className="text-green-500" />,
    message: (data) => `Your ticket for ${data.event} has been confirmed!`,
  },
  booking: {
    icon: <FaCalendarCheck className="text-purple-500" />,
    message: (data) =>
      `Your booking for ${data.service} on ${data.date} is confirmed!`,
  },
  tip: {
    icon: <FaGift className="text-yellow-500" />,
    message: (data) => `${data.username} sent you a tip of $${data.amount}!`,
  },
  login: {
    icon: <FaInfoCircle className="text-teal-400" />,
    message: (data) =>
      `Login successful! Welcome back, ${data.username || "user"}. (${new Date(
        data.date
      ).toLocaleString()})`,
  },
  general: {
    icon: <FaInfoCircle className="text-gray-500" />,
    message: (data) => data.message,
  },
};

const Notification = ({ type, data }) => {
  const notification = notificationTypes[type] || notificationTypes.general;
  return (
    <div className="flex items-center p-4 rounded-3xl border-2 border-teal-500 mb-3 bg-[#060512] shadow-sm">
      <div className="mr-3 text-lg">{notification.icon}</div>
      <div className="text-sm text-white-700">{notification.message(data)}</div>
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
