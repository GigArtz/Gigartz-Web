import React, { useEffect } from "react";
import { FaTimesCircle } from "react-icons/fa";

const Toast = ({ message, onClose, duration = 3000, type = "info" }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "border-l-4 border-green-500 bg-white text-green-800";
      case "error":
        return "border-l-4 border-red-500 bg-red-50 text-red-700";
      case "info":
        return "border-l-4 border-blue-500 bg-white text-blue-800";
      default:
        return "border-l-4 border-gray-400 bg-white text-gray-800";
    }
  };

  return (
    <>
      <div
        className={`fixed bottom-20 right-10 md:right-[5%] lg:right-[28%] md:bottom-20 min-w-[250px] max-w-xs p-4 rounded shadow-lg flex items-center gap-3 animate-fadeIn ${getTypeStyles()} z-50`}
        style={{ animation: "fadeIn 0.4s" }}
      >
        <div className="flex-1 break-words">{message}</div>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="Close"
          style={{ background: "rgba(0,0,0,0.03)" }}
        >
          <FaTimesCircle className="w-5 h-5" />
        </button>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </>
  );
};

export default Toast;
