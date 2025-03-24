import React from "react";
import { FaSpinner } from "react-icons/fa";

const Loader = ({ message }: { message?: string }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-dark backdrop-blur-md z-50">
      {/* Spinner */}
      <FaSpinner className="text-teal-500 text-4xl animate-spin" />

      {/* Loading Message */}
      <p className="mt-4 text-white text-lg font-semibold">
        {message || "Loading..."}
      </p>
    </div>
  );
};

export default Loader;
