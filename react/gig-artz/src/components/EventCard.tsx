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
import { FaCalendarAlt } from "react-icons/fa";

interface EventCardEvent {
  id: string;
  eventId?: string;
  title: string;
  date: string;
  gallery?: string[];
  comments?: unknown[];
  likes?: unknown[];
  category?: string | string[];
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

    // Use eventId for cached events in eventsSlice
    const eventKey = event.eventId || event.id;
    const reduxLoading = useSelector(
      (state: RootState) => state.events.loadingByEventId?.[eventKey]
    );
    const reduxError = useSelector(
      (state: RootState) => state.events.errorByEventId?.[eventKey]
    );

    // Clear errors when component ID changes (i.e., navigating to different event)
    useEffect(() => {
      setErrorShown(false);
      setToast(null);
    }, [event.id]);

    const isLoading = loading !== undefined ? loading : reduxLoading;

    const [isCommentsVisible, setIsCommentsVisible] = useState(false);
    const [isShareVisible, setIsShareVisible] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
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
            dispatch(addLike(eventId, uid));
            setLikedEvents((prevLikedEvents) => [...prevLikedEvents, eventId]);
            showToast("Event liked successfully", "success");
          } catch {
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

    // Handle image loading
    const handleImageLoad = useCallback(() => {
      setIsImageLoaded(true);
    }, []);

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
        <div className="flex justify-center items-center h-40 animate-pulse">
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
              <div
                className="absolute inset-0 w-8 h-8 border-4 border-transparent border-r-teal-300/50 rounded-full animate-spin animate-reverse"
                style={{ animationDelay: "0.1s" }}
              ></div>
            </div>
            <div className="text-gray-400 text-sm animate-pulse">
              Loading event...
            </div>
          </div>
        </div>
      );
    }
    // Error handling moved to Toast component - the event is always accessible

    return (
      <div className="animate-in fade-in-0 duration-300 transform transition-all">
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
          className="w-full h-full flex flex-col min-w-0 rounded-xl border border-gray-800 bg-gray-900 
                       cursor-pointer overflow-hidden group relative
                       transform transition-all duration-300 ease-out 
                        hover:border-teal-500/50 hover:shadow-lg hover:shadow-teal-500/10
                       active:scale-[0.98] active:shadow-lg
                       animate-in fade-in-0 slide-in-from-bottom-4 
                       before:absolute before:inset-0 before:bg-gradient-to-t before:from-transparent before:to-transparent
                       hover:before:from-teal-500/5 hover:before:to-transparent before:transition-all before:duration-300
                       after:absolute after:inset-0 after:bg-gradient-to-br after:from-white/5 after:to-transparent after:opacity-0
                       hover:after:opacity-100 after:transition-all after:duration-300 after:pointer-events-none
                       focus-within:ring-2 focus-within:ring-teal-500/30 focus-within:border-teal-500/70"
          style={{
            animationDuration: "0.6s",
            animationDelay: "0.1s",
            animationFillMode: "both",
          }}
        >
          <Link
            to={`/events/?eventId=${event?.eventId || event?.id}`}
            className="block w-full h-58 sm:h-full relative overflow-hidden group-hover:transform group-hover:scale-[1.01] transition-transform duration-300"
          >
            {/* Image Container with Loading State */}
            <div className="relative w-full h-full overflow-hidden group">
              {/* Loading skeleton */}
              {!isImageLoaded && (
                <div
                  className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 
                               animate-pulse rounded-t-xl
                               before:absolute before:inset-0 before:bg-gradient-to-r 
                               before:from-transparent before:via-white/10 before:to-transparent
                               before:animate-shimmer"
                />
              )}

              {/* Main Image */}
              <img
                className={`${imageClasses} transition-all duration-500 
                           group-hover:scale-110 group-hover:brightness-110 group-hover:contrast-105
                           ${isImageLoaded ? "opacity-100" : "opacity-0"}`}
                src={imageSrc}
                alt={event?.title || "Event Image"}
                onLoad={handleImageLoad}
              />

              {/* Hover overlay */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />

              {/* Event Badges */}
              {Array.isArray(event?.category) ? (
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 animate-in slide-in-from-top-2 fade-in-0 duration-500 delay-200">
                  {event.category
                    .slice(0, 2)
                    .map((cat: string, idx: number) => (
                      <span
                        key={idx}
                        className="bg-teal-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm 
                                     transform transition-all duration-200 ease-out hover:bg-teal-400/95 hover:scale-105 
                                     hover:shadow-lg hover:shadow-teal-500/25 active:scale-95 cursor-pointer"
                        style={{
                          animationDelay: `${idx * 100 + 300}ms`,
                          animation: "slideInFromLeft 0.7s ease-out forwards",
                        }}
                      >
                        {cat}
                      </span>
                    ))}
                </div>
              ) : typeof event?.category === "string" ? (
                <div
                  className="absolute top-4 left-4 bg-teal-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm
                                  transform transition-all duration-200 ease-out hover:bg-teal-400/95 hover:scale-105 
                                  hover:shadow-lg hover:shadow-teal-500/25 active:scale-95 cursor-pointer"
                  style={{
                    animation: "slideInFromTop 0.5s ease-out 0.2s forwards",
                    opacity: 0,
                  }}
                >
                  {event.category || "Live Event"}
                </div>
              ) : null}
            </div>

            {/* Content Section */}
            <div
              className="p-4 flex flex-col flex-1 relative z-10 
                           transform transition-all duration-300 ease-out
                           group-hover:translate-y-[-2px]"
            >
              <div className="flex justify-between items-start">
                <h5
                  className={`${titleClasses} transition-all duration-300 
                             group-hover:text-teal-100 group-hover:transform group-hover:scale-[1.02]`}
                >
                  {event.title}
                </h5>
              </div>

              {/* Date with icon */}
              <div
                className="flex items-center gap-2 text-gray-400 text-xs md:text-sm mt-2
                            transition-all duration-300 group-hover:text-gray-300"
              >
                <FaCalendarAlt
                  className="w-3 h-3 text-teal-500 transition-all duration-300 
                                       group-hover:text-teal-400 group-hover:scale-110"
                />
                <span className="transition-all duration-300 group-hover:tracking-wide">
                  {formattedDate}
                </span>
              </div>
            </div>
          </Link>

          {cardSize === "lg" && (
            <div
              className="p-5 flex flex-col flex-1 relative z-10
                           transform transition-all duration-300 ease-out
                           group-hover:translate-y-[-1px]"
            >
              <div
                className="flex border-t border-gray-800 pt-2 px-2 gap-2
                            transition-colors duration-300 group-hover:border-gray-700"
              >
                <EventActions
                  event={{
                    ...event,
                    comments: event.comments || [],
                    likes: Array.isArray(event.likes)
                      ? event.likes.length
                      : event.likes || 0,
                    category: Array.isArray(event.category)
                      ? event.category[0] // Use first category for EventActions
                      : event.category,
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
