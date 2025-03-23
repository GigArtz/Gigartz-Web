import { useState } from "react";
import {
  FaCheck,
  FaFacebook,
  FaLink,
  FaTimes,
  FaTimesCircle,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";

const ShareModal = ({ isVisible, onClose, shareUrl }) => {
  const [copied, setCopied] = useState(false);

  if (!isVisible) return null;

  const handleCopyLink = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);

      // Reset "Copied!" text after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check this out!",
          text: "Check out this awesome event!",
          url: shareUrl,
        });
        console.log("Shared successfully!");
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      console.log("Web Share API not supported.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-gray-900 p-6 rounded-lg w-80 shadow-lg relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
        >
          <FaTimesCircle className="w-6 h-6" />
        </button>

        <h3 className="text-lg font-semibold text-white text-center mb-4">
          Share Event
        </h3>

        <hr />

        <div className="p-4">
          <p className="text-white text-center">
            Share this event with your friends!
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-row gap-2 justify-center">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                shareUrl
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 py-2 rounded-full"
            >
              <FaFacebook className="w-5 h-5 mx-2" />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                shareUrl
              )}&text=Check out this event!`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-500 hover:bg-blue-600 py-2 rounded-full"
            >
              <FaTwitter className="w-5 h-5 mx-2" />
            </a>
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `Check out this event! ${shareUrl}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 py-2 rounded-full"
            >
              <FaWhatsapp className="w-5 h-5 mx-2" />
            </a>
          </div>

          {navigator.share ? (
            <button
              onClick={handleNativeShare}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-full"
            >
              Share via Apps
            </button>
          ) : (
            <>
              {/* Fallback Share Buttons */}
              <p>Copy Link</p>
            </>
          )}

          <div className="flex justify-center">
            <button
              onClick={handleCopyLink}
              className="bg-gray-700 hover:bg-gray-800 py-2 px-4 rounded-full flex items-center text-white font-medium transition"
            >
              {copied ? (
                <>
                  <FaCheck className="w-5 h-5 mr-2 text-green-400" />
                  Copied!
                </>
              ) : (
                <>
                  <FaLink className="w-5 h-5 mr-2" />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
