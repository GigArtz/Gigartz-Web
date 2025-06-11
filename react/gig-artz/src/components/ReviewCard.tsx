import React from "react";
import {
  FaBookmark,
  FaEllipsisV,
  FaExclamationTriangle,
  FaHeart,
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

  return (
    <div className="flex w-full items-start p-2 bg-[#060512] shadow-md rounded-2xl border border-gray-800 transition-colors ">
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

        {/* Like or share comment */}
        <div className="mt-3 flex flex-wrap gap-1 md:gap-2 border-t p-2 border-gray-700 pt-2 px-4 justify-between">
          <button className="flex items-center text-gray-500 hover:text-red-400 transition-colors">
            <FaHeart className="mr-1 w-3 h-3" />
             <span className="hidden md:block">Like</span>
          </button>
          <button className="flex items-center text-gray-500 hover:text-teal-400 transition-colors text-sm">
            <FaBookmark className="mr-1 w-3 h-3" />
            <span className="hidden md:block">Save</span>
          </button>
          <button className="flex items-center text-gray-500 hover:text-teal-400 transition-colors text-sm">
            <FaShareAlt className="mr-1 w-3 h-3" />
            <span className="hidden md:block">Share</span>
          </button>
          <button className="flex items-center text-gray-500 hover:text-teal-400 transition-colors text-sm">
            <FaExclamationTriangle className="mr-1 w-3 h-3" />
            <span className="hidden md:block">Report</span>
          </button>
          <button className="flex items-center text-gray-500 hover:text-teal-400 transition-colors text-sm">
            <FaEllipsisV />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
