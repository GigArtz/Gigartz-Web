import React, { useEffect, memo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import EventGallery from "./EventGallery";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProfiles } from "../../store/profileSlice";
import { RootState, AppDispatch } from "../../store/store";
import ReviewActions from "./ReviewActions";
import { FaAt, FaLocationArrow, FaMapMarked } from "react-icons/fa";

// Update User interface to include uid and userId
interface User {
  uid?: string;
  userId?: string;
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
  // Additional fields for compatibility with different API responses
  reviewerId?: string;
  reviewedUserId?: string;
  image?: string; // Single image field
  video?: string; // Alternative video field
  title?: string;
  tags?: string[];
  taggedUsers?: string[]; // Array of user IDs for tagged users
  eventId?: string; // ID of the reviewed event
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
      dispatch(fetchAllProfiles());
      hasFetchedRef.current = true;
    }
  }, [dispatch, error]);

  const handleUserClick = () => {
    if (review.user?.uid || review.userId || review.reviewerId) {
      navigate(
        `/people/${review.user?.uid || review.userId || review.reviewerId}`
      );
    }
  };

  // Refactor findUser to avoid using 'any' and ensure compatibility with UserProfile
  const findUser = (uid: string): User | null => {
    if (!uid) return null;
    return (
      userList?.find((user: User) => {
        return user.uid === uid || user.userId === uid || user.id === uid; // Added user.id for matching
      }) || null
    );
  };

  // Look up user using various possible IDs from the review
  const author = findUser(
    review?.user?.uid || review?.userId || review?.reviewerId
  );

  // Add tagged users and reviewed user display
  const taggedUsers = Array.isArray(review?.taggedUsers)
    ? review.taggedUsers.map((taggedUserId) => findUser(taggedUserId))
    : [];
  const reviewedUser = findUser(review.reviewedUserId);

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
                  src={author?.profilePicUrl || "/avatar.png"}
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
                  {author?.name || "Unknown User"}
                </h3>
                <p className="text-xs text-gray-400">
                  {author?.userName ? `@${author.userName}` : "username"}
                </p>

                {/* Link to reviewed event */}
                {review.eventId && (
                  <div className="items-center mt-1">
                    <span
                      className="text-xs text-teal-400 bg-gray-800 px-2 py-1 rounded-full cursor-pointer hover:underline"
                      onClick={() =>
                        navigate(`/events/?eventId=${review.eventId}`)
                      }
                    >
                      <FaMapMarked className="inline mr-1 mb-0.5" />
                      View Event
                    </span>
                  </div>
                )}
              </div>
            </div>
            <span className="text-xs hidden sm:block text-gray-400 px-2 py-1 rounded bg-gray-800/60">
              {review?.createdAt || review?.date
                ? new Date(
                    review?.createdAt || review?.date
                  ).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "2-digit",
                  })
                : ""}
            </span>
          </div>

          {/* Star Rating */}
          <div className="flex items-center mt-2 gap-1" aria-label="Rating">
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

          <div>
            {/* Review Text */}
            <p className="text-[15px] text-gray-200 mt-2 leading-relaxed">
              {review?.text || review?.reviewText || ""}
            </p>
          </div>

          {/* Images and/or Video Section */}
          {(review.imageUrls?.length > 0 ||
            review.image ||
            review.videoUrl) && (
            <div className="mt-4 w-full">
              {(() => {
                const images =
                  review.imageUrls?.length > 0
                    ? review.imageUrls
                    : review.image
                    ? [review.image]
                    : [];

                const hasVideo = !!review.videoUrl;
                const totalMedia = images.length + (hasVideo ? 1 : 0);

                // === Single media item: fullscreen layout ===
                if (totalMedia === 1) {
                  return (
                    <div className="rounded-lg overflow-hidden shadow-sm">
                      {images.length === 1 ? (
                        <div style={{ height: "300px" }}>
                          <EventGallery images={images} />
                        </div>
                      ) : (
                        <video
                          src={review.videoUrl}
                          controls
                          className="w-full object-cover rounded-md duration-200 delay-150 ease-in-out hover:-translate-y-1 hover:scale-95"
                          style={{ aspectRatio: "16/9", height: "300px" }}
                        />
                      )}
                    </div>
                  );
                }

                // === Multiple media items: grid layout ===
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-lg overflow-hidden">
                    {/* Images via EventGallery */}
                    <div
                      className="w-full object-cover rounded-md duration-200 delay-150 ease-in-out hover:-translate-y-1 hover:scale-95"
                      style={{ height: "300px" }}
                    >
                      <EventGallery images={images} />
                    </div>

                    {/* Video section */}
                    {hasVideo && (
                      <div className="w-full rounded-lg overflow-hidden shadow-sm">
                        <video
                          src={review.videoUrl}
                          controls
                          className="w-full object-cover rounded-md duration-200 delay-150 ease-in-out hover:-translate-y-1 hover:scale-95"
                          style={{ aspectRatio: "16/9", height: "300px" }}
                        />
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
          {/* Display reviewed user */}
          {reviewedUser && (
            <div className="flex items-center mt-1">
              <p
                className="text-xs text-teal-400 bg-gray-800 px-2 py-1 rounded-full cursor-pointer hover:underline"
                onClick={() =>
                  navigate(
                    `/people/${reviewedUser?.uid || reviewedUser?.userId}`
                  )
                }
              >
                <FaAt className="inline mr-1 mb-0.5" />
                {reviewedUser?.name || reviewedUser?.userName || "Unknown User"}
              </p>
            </div>
          )}

          {/* Display tagged users */}
          {taggedUsers?.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2 mt-1">
                <p className="text-sm text-gray-400">with:</p>
                {taggedUsers.map((user, index) => (
                  <span
                    key={index}
                    className="text-xs text-teal-400 bg-gray-800 px-2 py-1 rounded-full cursor-pointer hover:underline"
                    onClick={() =>
                      navigate(`/people/${user?.uid || user?.userId}`)
                    }
                  >
                    <FaAt className="inline mr-1 mb-0.5" />
                    {user?.name || user?.userName || "Unknown User"}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Review Actions - Like, Comment, Share, etc. */}
          <div className="flex flex-row items-center gap-3 mt-1.5">
            <ReviewActions
              review={review} // Pass the entire review object
              author={author} // Pass the author details
              taggedUsers={taggedUsers} // Pass tagged users
              reviewedUser={reviewedUser} // Pass reviewed user
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

          <ReviewActions
            review={review} // Pass the entire review object
            author={author} // Pass the author details
            taggedUsers={taggedUsers} // Pass tagged users
            reviewedUser={reviewedUser} // Pass reviewed user
          />
        </div>
      )}
    </div>
  );
};

// Card animation styles
if (
  typeof document !== "undefined" &&
  !document.head.querySelector("style[data-card-animate]")
) {
  const style = document.createElement("style");
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
  style.setAttribute("data-card-animate", "true");
  document.head.appendChild(style);
}

export default memo(ReviewCard);
