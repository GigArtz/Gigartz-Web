import React from "react";
import { Link } from "react-router-dom";
import image from "../assets/blue.jpg"; // Default fallback image
import { FaHeart, FaComment } from "react-icons/fa";
import { useSelector } from "react-redux";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    venue: string;
    date: string;
    time: string;
    price: string;
    likes?: number;
    comments?: string[];
    gallery?: string[];
  };
  cardSize?: "sm" | "md" | "lg";
}

const EventCard: React.FC<EventCardProps> = ({ event, cardSize }) => {
  

  return (
    <Link to={`/events/?eventId=${event.id}`} className="block w-full h-full">
      <div className="w-[100%] h-full flex flex-col flex-1 min-w-0 rounded-xl shadow-lg border border-gray-800 cursor-pointer transition-transform">
        {/* Image */}
        <img
          className={`w-full object-cover object-top rounded-t-xl ${
            cardSize === "sm"
              ? "h-32"
              : cardSize === "md"
              ? "h-32 md:h-56 p-0 rounded-t-2xl "
              : "h-64"
          }`}
          src={event.gallery?.[0] || image} // Fallback image
          alt={event.title}
        />

        <div className="p-5 flex flex-col flex-1">
          <div className="flex justify-between">
            <h5 className={`mb-2 text-base md:text-2xl font-bold text-white text-wrap line-clamp-1 ${
            cardSize === "sm"
              ? "w-40"
              : cardSize === "md"
              ? "text-sm md:text-sm"
              : "text-lg"
          }`}>
              {event.title}

            </h5>

            {cardSize === "lg" && (
              <div className="flex gap-2">
                {/* Comments */}
                <p className="text-gray-400 flex items-center text-sm">
                  <FaComment className="w-4 h-4 text-gray-500 mr-2" />
                  <button>{event.comments?.length || 0}</button>
                </p>
                {/* Likes */}
                <p className="text-gray-400 flex items-center text-sm">
                  <FaHeart className="w-4 h-4 text-gray-500 mr-2 hover:text-red-500" />
                  {event.likes || 0}
                </p>
              </div>
            )}
          </div>

          {/* Date */}
          <p className="mb-3 text-gray-400 flex items-center text-xs md:text-sm">
            {new Date(event.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
