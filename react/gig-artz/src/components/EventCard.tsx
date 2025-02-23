import React from "react";
import { Link } from "react-router-dom";
import image from "../assets/blue.jpg"; // Default fallback image
import {
  FaLocationArrow,
  FaDollarSign,
  FaCalendarAlt,
  FaClock,
  FaHeart,
  FaBitcoin,
  FaComment,
} from "react-icons/fa"; // Import icons for location, price, date, and time

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    venue: string;
    date: string;
    time: string;
    price: string;
    gallery?: string[]; // Optional gallery with images
  };
  cardSize?: "sm" | "md" | "lg"; // Accepts "sm", "md", or "lg" for small, medium, or large cards
}

const EventCard: React.FC<EventCardProps> = ({ event, cardSize = "md" }) => {
  // Set different max-widths based on the `cardSize` prop
  const cardWidth =
    cardSize === "sm"
      ? "w-[20rem]"
      : cardSize === "lg"
      ? "md:w-[48rem] lg:w-[48] w-[22.5rem]"
      : "max-w-sm";

  return (
    <Link to={`/events/?eventId=${event.id}`} className="block">
      <div
        className={`${cardWidth}  border rounded-xl shadow-lg bg-gray-800 border-gray-700 cursor-pointer flex-shrink-0 transition-transform `}
      >
        {/* Clickable Image */}
        <img
          className="rounded-t-lg w-full h-56 object-cover sm:h-48 md:h-56 lg:h-64"
          src={event.gallery?.[0] || image} // Fallback to static image if event does not have an image field
          alt={event.title}
        />

        <div className="p-5">
          <div className="flex justify-between">
            <div>
              {/* Clickable Title */}
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-wrap text-white">
                {event.title}
              </h5>
            </div>

            {cardSize === "lg" && (
              <div className="flex gap-2">
                {/* Comments */}
                <p className="mb-3 font-normal text-gray-400 flex items-center text-sm sm:text-base">
                  <FaComment className="w-5 h-5 text-gray-500 mr-2" />
                  <button>{event.comments.length}</button>
                </p>
                {/* Likes */}
                <p className="mb-3 font-normal text-gray-400 flex items-center text-sm sm:text-base">
                  <FaHeart className="w-5 h-5 text-red-500 mr-2" />
                  {event.likes}
                </p>
              </div>
            )}
          </div>

          {/* Date with Calendar Icon */}
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400 flex items-center text-sm sm:text-base text-wrap">
            {event.date}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
