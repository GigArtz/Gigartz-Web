import React from "react";
import Notification from "../components/Notification";
import { FaArrowLeft } from "react-icons/fa";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

function Notifications() {
  // Get notifications from Redux
  const notifications = useSelector(
    (state: RootState) => state.notification.notifications
  );
  return (
    <div className="main-content">
      <div className="p-2">
        <div className="md:flex hidden items-center mb-6 p-4 gap-5 bg-gray-800 text-white rounded-3xl shadow-md">
          <FaArrowLeft />
          <h1 className="text-lg font-semibold text-teal-500">Notifications</h1>
        </div>

        {/* Notifications List */}
        <div className="max-h-[75vh] overflow-y-auto space-y-3">
          {(notifications?.length ?? 0) === 0 ? (
            <div className="text-white text-center">No notifications yet.</div>
          ) : (
            notifications?.map((n) => (
              <Notification key={n.id} type={n.type} data={n.data} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications;
