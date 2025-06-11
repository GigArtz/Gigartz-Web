import React, { useState } from "react";
import {
  FaBookmark,
  FaEllipsisV,
  FaExclamationTriangle,
  FaHeart,
  FaRetweet,
  FaSave,
  FaShareAlt,
  FaThumbsUp,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import EventGallery from "./EventGallery";

interface User {
  uid?: string;
  name?: string;
  userName?: string;
  profilePicUrl?: string;
}

export interface Review {
  id: string;
  text: string;
  createdAt: string;
  user: User;
  rating: number;
  imageUrls?: string[]; // Multiple images
  videoUrl?: string; // Single video
}

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const navigate = useNavigate();

  const handleUserClick = () => {
    if (review.user.uid) {
      navigate(`/people/${review.user.uid}`);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Toggles the "More" modal
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  // Handle Report action
  const handleReport = () => {
    console.log("Event reported!");
    setIsModalOpen(false); // Close modal after action
  };

  const [liked, setLiked] = useState(false);

  function handleLike(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    event.preventDefault();
    setLiked((prev) => !prev);
    // Optionally, trigger API call to like/unlike the review here
  }

  function handleSave(event: MouseEvent<HTMLButtonElement, MouseEvent>): void {
    throw new Error("Function not implemented.");
  }

  function handleRepost(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
    event.preventDefault();
    // Optionally, trigger API call to repost the review here
    console.log("Repost clicked!");
  }

  function shareEvent(event: MouseEvent<HTMLButtonElement, MouseEvent>): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="flex w-full items-start p-2 bg-gray-900 shadow-md rounded-2xl border border-gray-800 transition-colors ">
      {/* Review Content */}
      <div className="m-2 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* User Avatar */}
            <img
              src={review.user.profilePicUrl || "/avatar.png"}
              alt="User Avatar"
              className="w-10 h-10 rounded-full border-2 border-teal-400 cursor-pointer"
              onClick={handleUserClick}
            />
            <div className="cursor-pointer" onClick={handleUserClick}>
              <h3 className="text-sm font-semibold text-white">
                {review.user.name || "Anonymous"}
              </h3>
              <p className="text-xs text-gray-400">
                @{review.user.userName || "username"}
              </p>
            </div>
          </div>
          <span className="text-xs text-gray-500">
            {new Date(review.createdAt).toLocaleString()}
          </span>
        </div>

        {/* Star Rating */}
        <div className="flex items-center mt-1">
          {Array.from({ length: 5 }, (_, index) => (
            <span
              key={index}
              className={`text-sm ${
                index < review.rating ? "text-yellow-400" : "text-gray-500"
              }`}
            >
              ★
            </span>
          ))}
        </div>

        {/* Review Text */}
        <p className="text-sm text-gray-300 mt-1">{review.text}</p>

        {/* Images and/or Video Section */}
        {(review.imageUrls?.length || review.videoUrl) && (
          <div className="mt-3 w-full">
            {/* Show all images using EventGallery if images exist */}
            {review.imageUrls?.length > 0 && (
              <EventGallery images={review.imageUrls} />
            )}
            {/* Show video if present */}
            {review.videoUrl && (
              <video
                src={review.videoUrl}
                controls
                className="w-full max-h-64 object-cover rounded-md border border-gray-700 duration-200 delay-150 ease-in-out hover:-translate-y-1 hover:scale-95 mt-2"
                style={{ aspectRatio: "16/9" }}
              />
            )}
          </div>
        )}

        {/* No media section */}
        {!review.imageUrls?.length && !review.videoUrl && (
          <p className="text-gray-500 mt-2">No media attached.</p>
        )}

        {/* Like or share review */}
        <div className="mt-3 flex flex-wrap gap-1 md:gap-2 border-t p-2 border-gray-700 pt-2 px-4 justify-between">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className="flex items-center text-gray-500 hover:text-red-400 transition-colors"
          >
            <FaHeart className="mr-1 w-3 h-3 md:w-4 md:h-4" />
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="flex items-center text-gray-500 hover:text-teal-400 transition-colors text-sm"
          >
            <FaBookmark className="mr-1 w-3 h-3 md:w-4 md:h-4" />
          </button>

          {/* Repost Button */}
          <button
            onClick={handleRepost}
            className="flex items-center text-gray-500 hover:text-teal-400 transition-colors text-sm"
          >
            <FaRetweet className="mr-1 w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Share Button */}
          <button
            onClick={shareEvent}
            className="flex items-center text-gray-500 hover:text-teal-400 transition-colors text-sm"
          >
            <FaShareAlt className="mr-1 w-3 h-3 md:w-4 md:h-4" />
          </button>

         

          {/* More Button (Three dots) */}
          <button
            onClick={toggleModal}
            className="flex w-3 h-3 md:w-4 md:h-4 items-center text-gray-500 hover:text-teal-400 transition-colors text-sm"
          >
            <FaEllipsisV />
          </button>

          {/* Modal for Report */}
          {isModalOpen && (
            <div
              className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50"
              onClick={() => setIsModalOpen(false)}
            >
              <div
                className="bg-dark rounded-lg p-4 w-1/3 max-w-sm"
                onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
              >
                <h3 className="text-lg font-semibold mb-4">More Options</h3>
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={handleReport}
                    className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Report Event
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
