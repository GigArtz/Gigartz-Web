import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { markAsRead } from "../../store/notificationSlice";
import { FaTimesCircle } from "react-icons/fa";

interface NotificationToastProps {
  open: boolean;
  onClose: () => void;
  duration?: number;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  open,
  onClose,
  duration = 3000,
}) => {
  const notifications = useSelector(
    (state: RootState) => state.notification.notifications
  );
  const dispatch = useDispatch();
  const latest = notifications[0];

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [open, onClose, duration]);

  if (!open || !latest) return null;

  // Use the same design as Toast
  return (
    <>
      <div
        className={`fixed bottom-20 right-10 md:right-[5%] lg:right-[28%] md:bottom-20 min-w-[250px] max-w-xs p-4 rounded shadow-lg flex items-center gap-3 animate-fadeIn border-l-4 border-teal-500 bg-white text-teal-800 z-50`}
        style={{ animation: "fadeIn 0.4s" }}
      >
        <div className="flex-1 break-words">
          <span className="font-semibold text-teal-600 mr-2">
            {latest.type}
          </span>
          {latest.data &&
          typeof latest.data === "object" &&
          "message" in latest.data
            ? (latest.data as any).message
            : "No details"}
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="Close"
          style={{ background: "rgba(0,0,0,0.03)" }}
        >
          <FaTimesCircle className="w-5 h-5" />
        </button>
        {!latest.read && (
          <button
            className="ml-2 text-xs text-white bg-teal-500 rounded px-3 py-1 hover:bg-teal-600 transition"
            onClick={() => {
              dispatch(markAsRead(latest.id));
              onClose();
            }}
          >
            Mark as read
          </button>
        )}
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </>
  );
};

export default NotificationToast;
