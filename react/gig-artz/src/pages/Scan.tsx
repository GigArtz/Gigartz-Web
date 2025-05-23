import Header from "../components/Header";
import React from "react";

function Scanner() {
  return (
    <div className="main-content">
      <Header title="Scanner" />
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-2xl font-bold text-center mb-4">
          Download the App to Scan QR Codes
        </h1>
        <p className="text-center mb-4 text-gray-600 max-w-md">
          QR code scanning is only available in our mobile app. Please download
          the app to use this feature.
        </p>
        <button>
          <a
            href="https://your-app-download-link.com" // TODO: Replace with actual app store link
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 px-6 py-3 text-white rounded-3xl shadow-lg btn-primary transition-colors font-semibold"
          >
            Download App
          </a>
        </button>
      </div>
    </div>
  );
}

export default Scanner;
