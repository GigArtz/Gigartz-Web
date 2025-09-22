import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

const ErrorMessage = ({ error }) => {
  if (!error) return null;
  return (
    <div className="flex items-center text-red-400 text-sm mt-1">
      <FaExclamationTriangle className="mr-1" />
      {error}
    </div>
  );
};

export default ErrorMessage;
