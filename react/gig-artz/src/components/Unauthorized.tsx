import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark">
      <div className="text-center max-w-md mx-auto px-4">
        {/* Error Code */}
        <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>

        {/* Error Message */}
        <h2 className="text-2xl font-semibold mb-4 text-white">
          Access Denied
        </h2>

        <p className="mb-6 text-gray-300 leading-relaxed">
          {isAuthenticated
            ? "You don't have permission to access this resource. Please contact an administrator if you believe this is an error."
            : "You need to be logged in to access this page."}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoBack}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            Go Back
          </button>

          {isAuthenticated ? (
            <Link
              to="/home"
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 text-center"
            >
              Go to Home
            </Link>
          ) : (
            <Link
              to="/"
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 text-center"
            >
              Login
            </Link>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Need Help?</h3>
          <p className="text-xs text-gray-400">
            If you believe you should have access to this resource, please
            contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
