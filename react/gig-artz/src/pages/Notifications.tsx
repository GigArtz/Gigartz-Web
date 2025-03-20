import React from "react";
import Notification from "../components/Notification";
import { FaArrowLeft } from "react-icons/fa";

function Notifications() {
  return (
    <div className="main-content">
      <div>
        <div className="flex items-center p-4 gap-5 mb-2 bg-gray-800 text-white rounded-3xl shadow-md">
          <FaArrowLeft />
          <h1 className="text-lg font-semibold text-teal-500">Notifications</h1>
        </div>

        {/* Notifications List */}
        <div className="max-h-[75vh] overflow-y-auto space-y-3">
          <Notification type="follower" data={{ username: "JohnDoe" }} />
          <Notification type="ticket" data={{ event: "Rock Concert 2025" }} />
          <Notification
            type="booking"
            data={{ service: "Hotel Room", date: "March 25, 2025" }}
          />
          <Notification type="tip" data={{ username: "Alice", amount: "20" }} />
        </div>
      </div>
    </div>
  );
}

export default Notifications;
