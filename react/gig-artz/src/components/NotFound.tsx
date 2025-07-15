import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-dark">
    <h1 className="text-6xl font-bold text-teal-600 mb-4">404</h1>
    <h2 className="text-2xl font-semibold mb-2 text-white">Page Not Found</h2>
    <p className="mb-6 text-white">
      Sorry, the page you are looking for does not exist.
    </p>
    <Link
      to="/"
      className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition"
    >
      Go Home
    </Link>
  </div>
);

export default NotFound;
