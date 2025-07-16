import React, { useEffect, useState } from "react";
import { FaTimesCircle } from "react-icons/fa";

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
  type?: "success" | "error" | "info";
  action?: {
    label: string;
    onClick: () => void;
  };
}

const Toast: React.FC<ToastProps> = ({
  message,
  onClose,
  duration = 3000,
  type = "info",
  action,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!action) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Small delay for fade-out effect
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [onClose, duration, action]);

  const getToastTypeStyles = () => {
    switch (type) {
      case "success":
        return "border-l-4 border-green-400 bg-green-800 text-white";
      case "error":
        return "border-l-4 border-red-400 bg-red-800 text-white";
      case "info":
        return "border-l-4 border-teal-400 bg-teal-800 text-white";
      default:
        return "border-l-4 border-gray-400 bg-gray-800 text-white";
    }
  };

  if (!isVisible) return null; // Don't render when not visible

  return (
    <>
      <div
        className={`fixed bottom-20 right-10 md:right-[5%] lg:right-[28%] md:bottom-20 min-w-[250px] max-w-xs p-4 rounded-lg shadow-xl flex items-center gap-3 animate-fadeIn ${getToastTypeStyles()} z-50`}
        style={{ animation: "fadeIn 0.4s" }}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex-1 break-words">{message}</div>
        {action && (
          <button
            onClick={action.onClick}
            className="ml-2 text-xs text-white bg-teal-600 rounded px-3 py-1 hover:bg-teal-700 transition"
            tabIndex={0}
            aria-label={action.label}
          >
            {action.label}
          </button>
        )}
        <button
          onClick={() => setIsVisible(false)}
          className="rounded-full p-1 text-gray-300 hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
          aria-label="Close"
          style={{ background: "rgba(255,255,255,0.1)" }}
        >
          <FaTimesCircle className="w-5 h-5" />
        </button>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </>
  );
};

export default Toast;
