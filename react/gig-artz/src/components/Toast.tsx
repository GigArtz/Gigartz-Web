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
        return "bg-green-500 text-white";
      case "error":
        return "bg-red-500 text-white";
      case "info":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div
      className={`fixed bottom-20 p-4 right-10 md:right-[5%]  lg:right-[28%] md:bottom-20 rounded shadow-lg ${getTypeStyles()} z-50`}
    >
      {message}
      <button
        onClick={onClose}
        className="ml-4 text-white hover:text-gray-200 font-bold"
      >
        <FaTimesCircle className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
