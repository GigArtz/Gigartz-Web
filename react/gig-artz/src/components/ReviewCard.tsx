import React, { useEffect, memo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import EventGallery from "./EventGallery";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProfiles } from "../../store/profileSlice";
import { RootState, AppDispatch } from "../../store/store";
import ReviewActions from "./ReviewActions";

interface User {
  uid?: string;
  name?: string;
  userName?: string;
  profilePicUrl?: string;
}

export interface Review {
  id: string;
  text: string;
  reviewText?: string; // For compatibility with different backends
  createdAt: string;
  date?: string; // For compatibility with different backends
  user: User;
  rating: number;
  imageUrls?: string[]; // Multiple images
  videoUrl?: string; // Single video
  userId?: string; // Add userId for compatibility
}

interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const navigate = useNavigate();

  const { userList, loading, error } = useSelector(
    (state: RootState) => state.profile
  );
  const dispatch = useDispatch<AppDispatch>();

  // Track if we've already attempted to fetch to prevent infinite loops
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch once and avoid during errors to prevent infinite loops
    if (!hasFetchedRef.current && !error?.includes("fetch_error")) {
      // fetchAllProfiles now uses cache by default, only fetches if cache is invalid
      dispatch(fetchAllProfiles());
      hasFetchedRef.current = true;
    }
  }, [dispatch, error]);

  const handleUserClick = () => {
    if (review.user.uid) {
      navigate(`/people/${review.user.uid}`);
    }
  };

  // Find user reviewing
  const findUser = (uid: string) => {
    return userList?.find((user) => user?.id === uid);
  };

  const user = findUser(review?.user?.uid || review?.userId);

  return (
    <div
      className={`flex w-full items-start p-2 bg-gray-900 shadow-md rounded-2xl border ${
        loading ? "border-gray-700" : "border-gray-800"
      } transition-colors`}
    >
      {/* Review Content */}
      {!loading ? (
        <div className="mx-2 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* User Avatar */}
              <img
                src={user?.profilePicUrl || "/avatar.png"}
                alt="User Avatar"
                className="w-10 h-10 rounded-full border-2 border-teal-400 cursor-pointer"
                onClick={handleUserClick}
                onError={(e) => {
                  e.currentTarget.src = "/avatar.png";
                }}
              />
              <div className="cursor-pointer" onClick={handleUserClick}>
                <h3 className="text-sm font-semibold text-white">
                  {user?.name || "Unknown User"}
                </h3>
                <p className="text-xs text-gray-400">
                  {user?.userName ? `@${user.userName}` : "username"}
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              {review?.createdAt || review?.date
                ? new Date(review?.createdAt || review?.date).toLocaleString()
                : ""}
            </span>
          </div>

          {/* Star Rating */}
          <div className="flex items-center mt-1">
            {Array.from({ length: 5 }, (_, index) => (
              <span
                key={index}
                className={`text-sm ${
                  index < review?.rating ? "text-yellow-400" : "text-gray-500"
                }`}
              >
                ★
              </span>
            ))}
          </div>

          {/* Review Text */}
          <p className="text-sm text-gray-300 mt-1">
            {review?.text || review?.reviewText || ""}
          </p>

          {/* Images and/or Video Section */}
          {(review.imageUrls?.length || review?.videoUrl) && (
            <div className="mt-3 w-full">
              {/* Show all images using EventGallery if images exist */}
              {review.imageUrls?.length > 0 && (
                <EventGallery images={review?.imageUrls} />
              )}
              {/* Show video if present */}
              {review?.videoUrl && (
                <video
                  src={review?.videoUrl}
                  controls
                  className="w-full max-h-64 object-cover rounded-md border border-gray-700 duration-200 delay-150 ease-in-out hover:-translate-y-1 hover:scale-95 mt-2"
                  style={{ aspectRatio: "16/9" }}
                />
              )}
            </div>
          )}

          {/* No media section - only show if content exists */}
          {!review.imageUrls?.length && !review.videoUrl && !loading && (
            <p className="text-gray-500 mt-2 text-xs italic">
              No media attached
            </p>
          )}

          {/* Review Actions - Like, Comment, Share, etc. */}
          <div className="flex flex-row items-center gap-2 mt-2">
            <ReviewActions
              reviewId={review.id}
              userId={review.user?.uid || review.userId || ""}
            />
          </div>
        </div>
      ) : (
        <div className="mx-2 flex-1 animate-pulse">
          {/* Placeholder Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* User Avatar Placeholder */}
              <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-gray-600"></div>
              <div>
                {/* Username Placeholder */}
                <div className="h-4 w-24 bg-gray-700 rounded mb-1.5"></div>
                {/* Handle Placeholder */}
                <div className="h-3 w-16 bg-gray-800 rounded"></div>
              </div>
            </div>
            {/* Date Placeholder */}
            <div className="h-3 w-20 bg-gray-700 rounded"></div>
          </div>

          {/* Star Rating Placeholder */}
          <div className="flex items-center mt-2.5 space-x-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="w-3.5 h-3.5 bg-gray-700 rounded-full"
              ></div>
            ))}
          </div>

          {/* Review Text Placeholder */}
          <div className="space-y-2 mt-3">
            <div className="h-3.5 bg-gray-700 rounded w-full"></div>
            <div className="h-3.5 bg-gray-700 rounded w-full"></div>
            <div className="h-3.5 bg-gray-700 rounded w-3/4"></div>
          </div>

          {/* Media Placeholder - we'll always show it for consistency */}
          <div className="mt-4">
            <div className="h-36 bg-gray-800/50 rounded-md w-full border border-gray-700"></div>
          </div>

          {/* Actions Placeholder */}
          <div className="flex flex-row items-center gap-4 mt-4">
            <div className="h-7 w-14 bg-gray-700 rounded-md"></div>
            <div className="h-7 w-14 bg-gray-700 rounded-md"></div>
            <div className="h-7 w-14 bg-gray-700 rounded-md"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(ReviewCard);
