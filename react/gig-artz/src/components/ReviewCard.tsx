import React from "react";
import { useNavigate } from "react-router-dom";

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
    <div className="flex w-full items-start p-4 bg-[#060512] shadow-md border-b border-gray-800 transition-colors duration-200">
      {/* User Avatar */}
      <img
        src={review.user.profilePicUrl || "/avatar.png"}
        alt="User Avatar"
        className="w-10 h-10 rounded-full border-2 border-teal-400 cursor-pointer"
        onClick={handleUserClick}
      />

      {/* Review Content */}
      <div className="ml-3 flex-1">
        <div className="flex items-center justify-between">
          <div className="cursor-pointer" onClick={handleUserClick}>
            <h3 className="text-sm font-semibold text-white">
              {review.user.name || "Anonymous"}
            </h3>
            <p className="text-xs text-gray-400">
              @{review.user.userName || "username"}
            </p>
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
            {/* Single image or video fills card */}
            {((review.imageUrls?.length === 1 && !review.videoUrl) ||
              (!review.imageUrls?.length && review.videoUrl)) && (
              <>
                {review.imageUrls?.length === 1 && (
                  <img
                    src={review.imageUrls[0]}
                    alt="Review Media"
                    className="w-full max-h-64 object-cover rounded-md border border-gray-700"
                    style={{ aspectRatio: "16/9" }}
                  />
                )}
                {!review.imageUrls?.length && review.videoUrl && (
                  <video
                    src={review.videoUrl}
                    controls
                    className="w-full max-h-64 object-cover rounded-md border border-gray-700"
                    style={{ aspectRatio: "16/9" }}
                  />
                )}
              </>
            )}

            {/* Multiple images and/or video: grid */}
            {((review.imageUrls?.length && review.imageUrls.length > 1) ||
              (review.imageUrls?.length && review.videoUrl)) && (
              <div className="grid grid-cols-2 gap-2">
                {review.imageUrls?.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Review Media ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-md border border-gray-700"
                    style={{ aspectRatio: "16/9" }}
                  />
                ))}
                {review.videoUrl && (
                  <video
                    src={review.videoUrl}
                    controls
                    className="w-full h-32 object-cover rounded-md border border-gray-700"
                    style={{ aspectRatio: "16/9" }}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;
