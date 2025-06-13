import React from "react";
import { Link } from "react-router-dom";
import image from "../assets/blue.jpg"; // Default fallback image
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import EventActions from "./EventActions";

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

  // Placeholder functions
  const shareEvent = (): void => {};
  const showComments = (): void => {};
  const handleLike = (): void => {};

  return (
    <div className="w-full h-full flex flex-col min-w-0 rounded-xl shadow-lg border border-gray-800 bg-gray-900 cursor-pointer transition-transform ">
      <Link
        to={`/events/?eventId=${event?.eventId || event?.id}`}
        className="block w-full h-58 sm:h-full transition delay-150 duration-300 ease-in-out hover:-translate-y-1"
      >
        {/* Image */}

        <img
          className={`w-full object-cover object-top rounded-t-xl hover:scale-95 hover:rounded-xl ${
            cardSize === "sm"
              ? "h-30 sm:h-40"
              : cardSize === "md"
              ? "h-40 md:h-56 p-0 rounded-t-2xl "
              : "h-64"
          }`}
          src={event?.gallery?.length ? event.gallery[0] : image} // Ensures array check
          alt={event?.title || "Event Image"}
        />
      </Link>

      <div className="p-5 flex flex-col flex-1">
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

        {cardSize === "lg" && (
          <div className="flex border-t border-gray-800 pt-2 px-2 gap-2">
            <EventActions
              event={event}
              profile={profile}
              uid={profile?.id}
              showComments={showComments}
              shareEvent={shareEvent}
              handleLike={handleLike}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
