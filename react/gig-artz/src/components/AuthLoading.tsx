import React from "react";
import Loader from "./Loader";

interface AuthLoadingProps {
  message?: string;
}

const AuthLoading: React.FC<AuthLoadingProps> = ({
  message = "Checking authentication...",
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark">
      <Loader />
      <p className="mt-4 text-gray-300 text-sm animate-pulse">{message}</p>
    </div>
  );
};

export default AuthLoading;
