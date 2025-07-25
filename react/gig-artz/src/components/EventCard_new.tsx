import React, { useEffect, useState, memo, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import image from "../assets/blue.jpg"; // Default fallback image
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import EventActions from "./EventActions";
import ShareModal from "./ShareModal";
import CommentsModal from "./CommentsModal";
import Toast from "./Toast";
import { addLike } from "../../store/eventsSlice";
import { useRenderLogger } from "../hooks/usePerformanceMonitor";
import {
  FaHeart,
  FaShare,
  FaComment,
  FaCalendarAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

interface EventCardEvent {
  id: string;
  eventId?: string;
  title: string;
  date: string;
  gallery?: string[];
  comments?: unknown[];
  likes?: unknown[];
}

interface EventCardProps {
  event: EventCardEvent;
  cardSize?: "sm" | "md" | "lg";
  loading?: boolean;
  error?: string | null;
}

const EventCard: React.FC<EventCardProps> = memo(
  ({ event, cardSize, loading, error }) => {
    // Monitor re-renders in development
    useRenderLogger("EventCard", { eventId: event.id });

    // Optimized selectors with shallow equality
    const profile = useSelector(
      (state: RootState) => state.profile.profile,
      shallowEqual
    );

    // Per-event loading/error from Redux if not passed as prop
    const reduxLoading = useSelector(
      (state: RootState) => state.events.loadingByEventId?.[event.id]
    );
    const reduxError = useSelector(
      (state: RootState) => state.events.errorByEventId?.[event.id]
    );

    // Clear errors when component ID changes (i.e., navigating to different event)
    useEffect(() => {
      setErrorShown(false);
      setToast(null);
    }, [event.id]);

    const isLoading = loading !== undefined ? loading : reduxLoading;

    const [isCommentsVisible, setIsCommentsVisible] = useState(false);
    const [isShareVisible, setIsShareVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likeAnimation, setLikeAnimation] = useState(false);
    const [toast, setToast] = useState<{
      visible: boolean;
      message: string;
      type: "success" | "error" | "info";
      action?: { label: string; onClick: () => void };
    } | null>(null);
    const [errorShown, setErrorShown] = useState(false); // Track if error was already shown
    const navigate = useNavigate();

    const dispatch = useDispatch<AppDispatch>();

    const { uid } = useSelector((state: RootState) => state.auth);

    // Memoize liked events calculation to prevent unnecessary re-computations
    const likedEventIds = useMemo(() => {
      return profile?.likedEvents?.map((event) => event?.eventId) || [];
    }, [profile?.likedEvents]);

    // Handle users liked events - Initialize with current liked events
    const [likedEvents, setLikedEvents] = useState<string[]>(likedEventIds);

    // Memoized navigation redirect check
    const shouldRedirect = useMemo(() => !profile, [profile]);

    useEffect(() => {
      if (shouldRedirect) {
        navigate("/"); // Redirect to login page
        return;
      }
    }, [shouldRedirect, navigate]);

    // Update liked events when profile changes
    useEffect(() => {
      setLikedEvents(likedEventIds);
    }, [likedEventIds]);

    // Clear toast notifications when component unmounts
    useEffect(() => {
      return () => {
        // Reset everything when component unmounts
        setToast(null);
        setErrorShown(false);
      };
    }, []);

    // Handle errors with a much simpler approach - only show once per mount
    useEffect(() => {
      // Don't show errors if we've already shown one for this component instance
      if ((error || reduxError) && !errorShown) {
        // Mark this error as shown
        setErrorShown(true);

        // Show toast only once
        setToast({
          visible: true,
          message: error || reduxError || "Failed to buy ticket",
          type: "error",
          action: {
            label: "View Event",
            onClick: () => {
              navigate(`/events/?eventId=${event?.eventId || event?.id}`);
              setToast(null);
            },
          },
        });
      }
    }, [error, reduxError, event?.id, event?.eventId, navigate, errorShown]);

    // Simple toast notification function
    const showToast = useCallback(
      (
        message: string,
        type: "success" | "error" | "info",
        action?: { label: string; onClick: () => void }
      ) => {
        // Just set the toast state directly
        setToast({
          visible: true,
          message,
          type,
          action: action
            ? {
                ...action,
                onClick: () => {
                  if (action.onClick) {
                    action.onClick();
                  }
                  setToast(null); // Close toast after action
                },
              }
            : undefined,
        });
      },
      []
    );

    // Memoized handle like function with animation
    const handleLike = useCallback(
      (eventId: string, uid: string) => {
        if (!likedEvents.includes(eventId)) {
          try {
            // Trigger like animation
            setLikeAnimation(true);
            setIsLiked(true);
            setTimeout(() => setLikeAnimation(false), 600);

            dispatch(addLike(eventId, uid));
            setLikedEvents((prevLikedEvents) => [...prevLikedEvents, eventId]);
            showToast("Event liked successfully", "success");
          } catch {
            setIsLiked(false);
            showToast("Failed to like event", "error");
          }
        } else {
          showToast("Event already liked", "info");
        }
      },
      [likedEvents, dispatch, showToast]
    );

    // Memoized modal handlers
    const showComments = useCallback(() => {
      console.log("show comments");
      setIsCommentsVisible(true);
    }, []);

    const shareEvent = useCallback(() => {
      console.log("Show comments", event?.eventId);
      setIsShareVisible(true);
    }, [event?.eventId]);

    const closeComments = useCallback(() => {
      setIsCommentsVisible(false);
    }, []);

    const closeShare = useCallback(() => {
      setIsShareVisible(false);
    }, []);

    // Handle hover effects
    const handleMouseEnter = useCallback(() => {
      setIsHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
      setIsHovered(false);
    }, []);

    // Handle image loading
    const handleImageLoad = useCallback(() => {
      setIsImageLoaded(true);
    }, []);

    // Initialize liked state
    useEffect(() => {
      setIsLiked(likedEvents.includes(event.id || event.eventId || ""));
    }, [likedEvents, event.id, event.eventId]);

    // Memoized image source
    const imageSrc = useMemo(() => {
      return event?.gallery?.length ? event.gallery[0] : image;
    }, [event?.gallery]);

    // Memoized formatted date
    const formattedDate = useMemo(() => {
      return new Date(event?.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }, [event?.date]);

    // Memoized CSS classes
    const imageClasses = useMemo(() => {
      const baseClasses = "w-full object-cover object-top rounded-t-xl";
      const sizeClasses =
        cardSize === "sm"
          ? "h-30 sm:h-40"
          : cardSize === "md"
          ? "h-40 md:h-56 p-0 rounded-t-2xl"
          : "h-64";
      return `${baseClasses} ${sizeClasses}`;
    }, [cardSize]);

    const titleClasses = useMemo(() => {
      const baseClasses = "mb-2 font-bold text-white text-wrap line-clamp-1";
      const sizeClasses =
        cardSize === "sm"
          ? "w-40 text-base md:text-2xl"
          : cardSize === "md"
          ? "text-sm md:text-sm"
          : "text-lg text-base md:text-2xl";
      return `${baseClasses} ${sizeClasses}`;
    }, [cardSize]);

    // Loader UI
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-40">
          <span className="animate-spin text-teal-500 text-3xl">⏳</span>
        </div>
      );
    }
    // Error handling moved to Toast component - the event is always accessible

    return (
      <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        {/* Reviews Modal */}
        <CommentsModal
          user={profile}
          event={{
            ...event,
            comments: event.comments || [],
          }}
          isCommentsVisible={isCommentsVisible}
          onClose={closeComments}
        />

        {/* Share Modal */}
        <ShareModal
          isVisible={isShareVisible}
          shareUrl={window.location.href} // Gets the current URL
          onClose={closeShare}
        />

        {/* Toast Notification - simple implementation */}
        {toast && toast.visible && (
          <div className="animate-in slide-in-from-top-4 fade-in-0 duration-300 ease-out">
            <Toast
              key={`toast-${event.id}-${Date.now()}`} // Key prevents stale renders
              message={toast.message}
              type={toast.type}
              action={toast.action}
              onClose={() => {
                // Just set toast to null
                setToast(null);
              }}
              duration={3000}
            />
          </div>
        )}

        <div
          className="w-full h-full flex flex-col min-w-0 rounded-xl shadow-lg border border-gray-800 bg-gray-900 cursor-pointer overflow-hidden group transform transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-500/20 hover:border-teal-500/30 active:scale-[0.98]"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Link
            to={`/events/?eventId=${event?.eventId || event?.id}`}
            className="block w-full h-58 sm:h-full relative overflow-hidden"
          >
            {/* Image Container with Loading State */}
            <div className="relative w-full h-full">
              {/* Loading skeleton */}
              {!isImageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse rounded-t-xl" />
              )}

              {/* Main Image */}
              <img
                className={`${imageClasses} transition-all duration-500 group-hover:scale-110 ${
                  isImageLoaded ? "opacity-100" : "opacity-0"
                }`}
                src={imageSrc}
                alt={event?.title || "Event Image"}
                onLoad={handleImageLoad}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Quick Action Buttons */}
              <div
                className={`absolute top-4 right-4 flex gap-2 transition-all duration-300 ${
                  isHovered
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-2"
                }`}
              >
                <button
                  className={`p-2 rounded-full backdrop-blur-sm border transition-all duration-300 transform hover:scale-110 active:scale-90 ${
                    isLiked
                      ? "bg-red-500/80 text-white border-red-500"
                      : "bg-black/40 text-white border-white/20 hover:bg-red-500/80 hover:border-red-500"
                  } ${likeAnimation ? "animate-pulse" : ""}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLike(event?.eventId || event?.id || "", uid);
                  }}
                >
                  <FaHeart
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isLiked ? "text-white scale-110" : ""
                    }`}
                  />
                </button>

                <button
                  className="p-2 rounded-full bg-black/40 text-white border border-white/20 hover:bg-teal-500/80 hover:border-teal-500 backdrop-blur-sm transition-all duration-300 transform hover:scale-110 active:scale-90"
                  onClick={(e) => {
                    e.preventDefault();
                    shareEvent();
                  }}
                >
                  <FaShare className="w-4 h-4" />
                </button>

                <button
                  className="p-2 rounded-full bg-black/40 text-white border border-white/20 hover:bg-blue-500/80 hover:border-blue-500 backdrop-blur-sm transition-all duration-300 transform hover:scale-110 active:scale-90"
                  onClick={(e) => {
                    e.preventDefault();
                    showComments();
                  }}
                >
                  <FaComment className="w-4 h-4" />
                </button>
              </div>

              {/* Event Badge */}
              <div className="absolute top-4 left-4 bg-teal-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm animate-in slide-in-from-left-4 fade-in-0 duration-500 delay-200">
                Live Event
              </div>
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-1 animate-in fade-in-0 slide-in-from-bottom-2 duration-400 delay-100">
              <div className="flex justify-between items-start">
                <h5
                  className={`${titleClasses} group-hover:text-teal-400 transition-colors duration-300 animate-in fade-in-0 duration-400 delay-200`}
                >
                  {event.title}
                </h5>
              </div>

              {/* Date with icon */}
              <div className="flex items-center gap-2 text-gray-400 text-xs md:text-sm mt-2 animate-in fade-in-0 duration-400 delay-300">
                <FaCalendarAlt className="w-3 h-3 text-teal-500" />
                <span>{formattedDate}</span>
              </div>

              {/* Additional hover content */}
              <div
                className={`mt-3 transition-all duration-300 overflow-hidden ${
                  isHovered ? "opacity-100 max-h-20" : "opacity-0 max-h-0"
                }`}
              >
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                  <FaMapMarkerAlt className="w-3 h-3 text-teal-500" />
                  <span>View Location</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded-full text-gray-300 transition-colors duration-200 hover:bg-gray-700">
                    {Array.isArray(event.comments) ? event.comments.length : 0}{" "}
                    comments
                  </span>
                  <span className="text-xs bg-gray-800 px-2 py-1 rounded-full text-gray-300 transition-colors duration-200 hover:bg-gray-700">
                    {Array.isArray(event.likes)
                      ? event.likes.length
                      : event.likes || 0}{" "}
                    likes
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {cardSize === "lg" && (
            <div className="p-5 flex flex-col flex-1 animate-in fade-in-0 duration-400 delay-400">
              <div className="flex border-t border-gray-800 pt-2 px-2 gap-2">
                <EventActions
                  event={{
                    ...event,
                    comments: event.comments || [],
                    likes: Array.isArray(event.likes)
                      ? event.likes.length
                      : event.likes || 0,
                  }}
                  uid={uid}
                  showComments={showComments}
                  shareEvent={shareEvent}
                  handleLike={handleLike}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

// Custom comparison function for memo optimization
const areEqual = (prevProps: EventCardProps, nextProps: EventCardProps) => {
  // Compare event object deeply for relevant properties
  const eventEqual =
    prevProps.event.id === nextProps.event.id &&
    prevProps.event.eventId === nextProps.event.eventId &&
    prevProps.event.title === nextProps.event.title &&
    prevProps.event.date === nextProps.event.date &&
    JSON.stringify(prevProps.event.gallery) ===
      JSON.stringify(nextProps.event.gallery);

  // Compare other props
  const propsEqual =
    prevProps.cardSize === nextProps.cardSize &&
    prevProps.loading === nextProps.loading &&
    prevProps.error === nextProps.error;

  return eventEqual && propsEqual;
};

EventCard.displayName = "EventCard";

export default memo(EventCard, areEqual);
