import React, { useEffect, useState, memo, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import image from "../assets/blue.jpg"; // Default fallback image
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { RootState } from "../../store/store";
import EventActions from "./EventActions";
import ShareModal from "./ShareModal";
import CommentsModal from "./CommentsModal";
import { addLike } from "../../store/eventsSlice";
import { useRenderLogger } from "../hooks/usePerformanceMonitor";

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

    const isLoading = loading !== undefined ? loading : reduxLoading;
    const errorMsg = error !== undefined ? error : reduxError;

    const [isCommentsVisible, setIsCommentsVisible] = useState(false);
    const [isShareVisible, setIsShareVisible] = useState(false);
    const navigate = useNavigate();

    const dispatch = useDispatch();

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

    // Memoized handle like function
    const handleLike = useCallback(
      (eventId: string, uid: string) => {
        if (!likedEvents.includes(eventId)) {
          console.log(uid);
          (dispatch as any)(addLike(eventId, uid));
          setLikedEvents((prevLikedEvents) => [...prevLikedEvents, eventId]);
        } else {
          console.log("Event already liked");
        }
      },
      [likedEvents, dispatch]
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

    // Loader/Error UI
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-40">
          <span className="animate-spin text-teal-500 text-3xl">⏳</span>
        </div>
      );
    }
    if (errorMsg) {
      return (
        <div className="flex flex-col items-center justify-center h-40">
          <span className="text-red-500">{errorMsg}</span>
        </div>
      );
    }

    return (
      <div>
        {/* Reviews Modal */}
        {isCommentsVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <CommentsModal
              user={profile}
              event={{
                ...event,
                comments: event.comments || [],
              }}
              isCommentsVisible={isCommentsVisible}
              onClose={closeComments}
            />
          </div>
        )}

        {/* Share Modal */}
        {isShareVisible && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <ShareModal
              isVisible={isShareVisible}
              shareUrl={window.location.href} // Gets the current URL
              onClose={closeShare}
            />
          </div>
        )}

        <div className="w-full h-full flex flex-col min-w-0 rounded-xl shadow-lg border border-gray-800 bg-gray-900 cursor-pointer transition-transform hover:scale-95 hover:rounded-xl">
          <Link
            to={`/events/?eventId=${event?.eventId || event?.id}`}
            className="block w-full h-58 sm:h-full transition delay-150 duration-300 ease-in-out hover:-translate-y-1 "
          >
            {/* Image */}
            <img
              className={imageClasses}
              src={imageSrc}
              alt={event?.title || "Event Image"}
            />
            <div className="p-2 flex flex-col flex-1">
              <div className="flex justify-between">
                <h5 className={titleClasses}>{event.title}</h5>
              </div>
              {/* Date */}
              <p className="mb-3 text-gray-400 flex items-center text-xs md:text-sm">
                {formattedDate}
              </p>
            </div>
          </Link>

          {cardSize === "lg" && (
            <div className="p-5 flex flex-col flex-1">
              <div className="flex border-t border-gray-800 pt-2 px-2 gap-2">
                <EventActions
                  event={{
                    ...event,
                    comments: event.comments || [],
                    likes: event.likes || [],
                  }}
                  profile={profile}
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
