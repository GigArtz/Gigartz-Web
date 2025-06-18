import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import image from "../assets/blue.jpg"; // Default fallback image
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store/store";
import EventActions from "./EventActions";
import ShareModal from "./ShareModal";
import CommentsModal from "./CommentsModal";
import { addLike } from "../../store/eventsSlice";

interface Event {
  id: string;
  eventId?: string;
  title: string;
  date: string;
  gallery?: string[];
}

interface EventCardProps {
  event: Event;
  cardSize?: "sm" | "md" | "lg";
}

const EventCard: React.FC<EventCardProps> = ({ event, cardSize }) => {
  const { profile } = useSelector((state: RootState) => state.profile);

  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [isShareVisible, setIsShareVisible] = useState(false);
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const eventData: Event[] = useSelector(
    (state: RootState) => state.events.events
  );

  const { uid } = useSelector((state: RootState) => state.auth);

  // Handle users liked events
  const [likedEvents, setLikedEvents] = useState<string[]>([]);
  useEffect(() => {
    if (!profile) {
      // alert("Invalid user profile. Please log in to continue.");
      navigate("/"); // Redirect to login page
      return;
    }

    const likedEventIds =
      profile?.likedEvents?.map((event) => event?.eventId) || [];
    setLikedEvents(likedEventIds); // Extract eventId from likedEvents and set it
  }, [profile, navigate]);

  useEffect(() => {
    if (event?.eventId && !likedEvents.includes(event?.eventId)) {
      const isLiked = profile?.likedEvents?.some(
        (event) => event.eventId === event?.eventId
      );
      if (isLiked) {
        setLikedEvents((prevLikedEvents) => [
          ...prevLikedEvents,
          event?.eventId,
        ]);
      }
    }
  }, [event?.eventId, profile, likedEvents]);

  // Handle like
  const handleLike = (eventId: string, uid: string) => {
    if (!likedEvents.includes(eventId)) {
      console.log(uid);
      dispatch(addLike(eventId, uid));
      setLikedEvents((prevLikedEvents) => [...prevLikedEvents, eventId]);
    } else {
      console.log("Event already liked");
    }
  };

  // Update likes after click
  useEffect(() => {
    if (event?.eventId) {
      const updatedEvent = eventData.find((e) => e.id === event?.eventId);
      if (updatedEvent) {
        //   setEvent(updatedEvent);
      }
    }
  }, [eventData, event?.eventId]);

  // Show comments
  const showComments = () => {
    console.log("show comments");
    setIsCommentsVisible(true);
  };

  // Show comments
  const shareEvent = () => {
    console.log("Show comments", event?.eventId);
    setIsShareVisible(true);
  };

  return (
    <div>
      {/* Reviews Modal */}
      {isCommentsVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <CommentsModal
            user={profile}
            event={event}
            isCommentsVisible={isCommentsVisible}
            onClose={() => setIsCommentsVisible(false)}
          />
        </div>
      )}

      {/* Share Modal */}
      {isShareVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <ShareModal
            isVisible={isShareVisible}
            shareUrl={window.location.href} // Gets the current URL
            onClose={() => setIsShareVisible(false)}
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
            className={`w-full object-cover object-top rounded-t-xl  ${
              cardSize === "sm"
                ? "h-30 sm:h-40"
                : cardSize === "md"
                ? "h-40 md:h-56 p-0 rounded-t-2xl "
                : "h-64"
            }`}
            src={event?.gallery?.length ? event.gallery[0] : image} // Ensures array check
            alt={event?.title || "Event Image"}
          />
          <div className="px-2 flex flex-col flex-1">
            <div className="flex justify-between">
              <h5
                className={`mb-2 text-base md:text-2xl font-bold text-white text-wrap line-clamp-1 ${
                  cardSize === "sm"
                    ? "w-40"
                    : cardSize === "md"
                    ? "text-sm md:text-sm"
                    : "text-lg"
                }`}
              >
                {event.title}
              </h5>
            </div>
            {/* Date */}
            <p className="mb-3 text-gray-400 flex items-center text-xs md:text-sm">
              {new Date(event?.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </Link>
        <div className="p-5 flex flex-col flex-1">
          {cardSize === "lg" && (
            <div className="flex border-t border-gray-800 pt-2 px-2 gap-2">
              <EventActions
                event={event}
                profile={profile}
                uid={uid}
                showComments={showComments}
                shareEvent={shareEvent}
                handleLike={handleLike}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
