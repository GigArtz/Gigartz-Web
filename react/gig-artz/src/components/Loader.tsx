import React from "react";

const Loader = ({ message }: { message?: string }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 backdrop-blur-md z-50">
      {/* Spinner */}
      <div className="animate-spin h-12 w-12 border-4 border-gray-200 border-t-transparent rounded-full"></div>

      {/* Loading Message */}
      <p className="mt-4 text-white text-lg font-semibold">
        {message || "Loading..."}
      </p>
    </div>
  );
};

export default Loader;
