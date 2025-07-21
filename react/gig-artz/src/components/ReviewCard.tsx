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
      className={`flex w-full items-start px-2 pt-3 bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 shadow-lg rounded-3xl border ${
        loading ? "border-gray-700" : "border-gray-800"
      } transition-colors duration-200 hover:shadow-xl group`}
      style={{ minHeight: 180 }}
    >
      {/* Review Content */}
      {!loading ? (
        <div className="mx-2 flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center sm:gap-4 gap-2">
              {/* User Avatar */}
              <div className="relative">
                <img
                  src={user?.profilePicUrl || "/avatar.png"}
                  alt="User Avatar"
                  className="object-cover w-10 h-10 min:w-10 min:h-10 max:w-10 max:h-10 rounded-full border-2 border-teal-400 cursor-pointer transition-transform duration-200 group-hover:scale-105 group-hover:border-teal-300 shadow-md"
                  onClick={handleUserClick}
                  onError={(e) => {
                    e.currentTarget.src = "/avatar.png";
                  }}
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-gray-900 rounded-full"></span>
              </div>
              <div className="cursor-pointer" onClick={handleUserClick}>
                <h3 className="text-base font-bold text-white leading-tight hover:underline">
                  {user?.name || "Unknown User"}
                </h3>
                <p className="text-xs text-gray-400">
                  {user?.userName ? `@${user.userName}` : "username"}
                </p>
              </div>
            </div>
            <span className="text-xs hidden sm:block text-gray-400 px-2 py-1 rounded bg-gray-800/60">
              {review?.createdAt || review?.date
                ? new Date(review?.createdAt || review?.date).toLocaleString()
                : ""}
            </span>
          </div>

          {/* Star Rating */}
          <div className="flex items-center mt-1 gap-1" aria-label="Rating">
            {Array.from({ length: 5 }, (_, index) => (
              <span
                key={index}
                title={
                  index < review?.rating
                    ? `Rated ${review?.rating} out of 5`
                    : ""
                }
                className={`text-lg transition-colors duration-150 ${
                  index < review?.rating
                    ? "text-yellow-400 drop-shadow-md hover:text-yellow-300"
                    : "text-gray-700 hover:text-gray-500"
                } cursor-pointer`}
              >
                ★
              </span>
            ))}
           
          </div>

          {/* Review Text */}
          <p className="text-[15px] text-gray-200 mt-2 leading-relaxed">
            {review?.text || review?.reviewText || ""}
          </p>

          {/* Images and/or Video Section */}
          {(review.imageUrls?.length || review?.videoUrl) && (
            <div className="mt-4 w-full flex flex-col gap-2">
              {/* Show all images using EventGallery if images exist */}
              {review.imageUrls?.length > 0 && (
                <div className="rounded-lg overflow-hidden border border-gray-800 shadow-sm">
                  <EventGallery images={review?.imageUrls} />
                </div>
              )}
              {/* Show video if present */}
              {review?.videoUrl && (
                <div className="rounded-lg overflow-hidden border border-gray-800 shadow-sm">
                  <video
                    src={review?.videoUrl}
                    controls
                    className="w-full max-h-64 object-cover rounded-md duration-200 delay-150 ease-in-out hover:-translate-y-1 hover:scale-95"
                    style={{ aspectRatio: "16/9" }}
                  />
                </div>
              )}
            </div>
          )}

          

          {/* Review Actions - Like, Comment, Share, etc. */}
          <div className="flex flex-row items-center gap-3 mt-4">
            <ReviewActions
              reviewId={review.id}
              userId={review.user?.uid || review.userId || ""}
            />
          </div>
        </div>
      ) : (
        <div className="mx-2 flex-1 animate-pulse">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-700 border-2 border-gray-600"></div>
              <div>
                <div className="h-4 w-24 bg-gray-700 rounded mb-1.5"></div>
                <div className="h-3 w-16 bg-gray-800 rounded"></div>
              </div>
            </div>
            <div className="h-3 w-20 bg-gray-700 rounded"></div>
          </div>

          <div className="flex items-center mt-2.5 gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-700 rounded-full"></div>
            ))}
            <div className="ml-2 h-3 w-8 bg-gray-800 rounded"></div>
          </div>

          <div className="space-y-2 mt-4">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          </div>

          <div className="mt-4">
            <div className="h-36 bg-gray-800/50 rounded-lg w-full border border-gray-700"></div>
          </div>

          <div className="flex flex-row items-center gap-4 mt-6">
            <div className="h-7 w-14 bg-gray-700 rounded-md"></div>
            <div className="h-7 w-14 bg-gray-700 rounded-md"></div>
            <div className="h-7 w-14 bg-gray-700 rounded-md"></div>
          </div>
        </div>
      )}
    </div>
  );
}

// Card animation styles
if (typeof document !== 'undefined' && !document.head.querySelector('style[data-card-animate]')) {
  const style = document.createElement('style');
  style.innerHTML = `
    .card-animate {
      opacity: 0;
      transform: translateY(30px) scale(0.98);
      animation: cardFadeIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }
    @keyframes cardFadeIn {
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .card-animate:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 8px 32px 0 rgba(0,0,0,0.25);
    }
  `;
  style.setAttribute('data-card-animate', 'true');
  document.head.appendChild(style);
}

export default memo(ReviewCard);
