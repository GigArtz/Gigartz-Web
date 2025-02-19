import EventGalleryCarousel from "../components/EventGalleryCarousel";
import { RootState } from "../store/store";
import { useEffect, useState } from "react";
import {
  FaCalendar,
  FaClock,
  FaComment,
  FaHeart,
  FaLocationArrow,
  FaShare,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  venue: string;
  description: string;
  artistLineUp: string[];
  gallery: string[];
  eventVideo?: string;
  ticketsAvailable: Record<string, { price: number; quantity: number }>;
  category: string;
  hostName: string;
  comments: string[];
  likes: number;
}

const EventDetails = () => {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketQuantities, setTicketQuantities] = useState<
    Record<string, number>
  >({});
  const eventData: Event[] = useSelector(
    (state: RootState) => state.events.events
  );

  useEffect(() => {
    const foundEvent = eventData.find((e) => e.id === eventId);
    if (foundEvent) {
      setEvent(foundEvent);
      const initialQuantities = Object.keys(foundEvent.ticketsAvailable).reduce(
        (acc, type) => {
          acc[type] = 0;
          return acc;
        },
        {} as Record<string, number>
      );
      setTicketQuantities(initialQuantities);
    }
  }, [eventId, eventData]);

  const handleQuantityChange = (type: string, delta: number) => {
    setTicketQuantities((prevQuantities) => {
      const newQuantity = Math.max(0, (prevQuantities[type] || 0) + delta);
      return { ...prevQuantities, [type]: newQuantity };
    });
  };

  const totalTicketPrice = Object.entries(ticketQuantities).reduce(
    (total, [type, quantity]) => {
      const ticketPrice = event?.ticketsAvailable[type].price || 0;
      return total + ticketPrice * quantity;
    },
    0
  );

  if (!event) {
    return (
      <div className="text-white flex justify-center items-center h-screen">
        <p>Event not found.</p>
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* Event Gallery Carousel */}
      <EventGalleryCarousel event={event} />

      <div className="flex justify-between">
        <div>
          {/* Event Title */}
          <h1 className="text-3xl font-bold text-white">{event.title}</h1>
          <p className="text-gray-400 mt-2">{event.hostName}</p>
        </div>

        <div className="flex gap-2">
          {/* Comments */}
          <p className="mb-3 font-normal text-gray-700 dark:text-gray-400 flex items-center text-sm sm:text-base">
            <FaComment className="w-5 h-5 text-gray-500 mr-2" />
            {event.comments.length}
          </p>
          {/* Likes */}
          <p className="mb-3 font-normal text-gray-400 flex items-center text-sm sm:text-base">
            <FaHeart className="w-5 h-5 text-red-500 mr-2" />
            {event.likes}
          </p>
          {/* Share */}
          <p className="mb-3 font-normal text-gray-400 flex items-center text-sm sm:text-base">
            <FaShare className="w-5 h-5 text-gray-500 mr-2" />
          </p>
        </div>
      </div>

      {/* Event Metadata */}
      <hr className="mt-4" />

      {/* Event Description */}
      <h2 className="text-2xl font-bold">Description</h2>
      <p className="mt-4 text-lg">{event.description}</p>

      <hr className="mt-4" />

      {/* Event Info */}
      <div className="mt-4 mb-4">
        <h2 className="text-2xl font-bold">Info.</h2>
        <div className="flex gap-52">
          <div>
            <p className="mb-3 font-normal text-gray-400 flex items-center text-sm sm:text-base">
              <FaCalendar className="w-5 h-5 text-white mr-2" />
              {event.date}
            </p>
            <p className="mb-3 font-normal text-gray-400 flex items-center text-sm sm:text-base">
              <FaLocationArrow className="w-5 h-5 text-white mr-2" />
              {event.venue}
            </p>
          </div>
          <div>
            <p className="mb-3 font-normal text-gray-400 flex items-center text-sm sm:text-base">
              <FaClock className="w-5 h-5 text-white mr-2" />
              {event.time}
            </p>
            <p className="mb-3 font-normal text-gray-400 flex items-center text-sm sm:text-base">
              <FaClock className="w-5 h-5 text-white mr-2" />
              {event.category}
            </p>
          </div>
        </div>
      </div>

      {/* Event Video */}
      {event.eventVideo && (
        <div className="mt-4">
          <video controls className="w-full rounded-lg">
            <source src={event.eventVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Tickets Section */}
      <hr className="mt-4" />
      <div className="mt-6">
        <h2 className="text-2xl font-bold">Tickets</h2>
        {Object.entries(event.ticketsAvailable).map(([type, ticket]) => (
          <div
            key={type}
            className="bg-gray-800 p-4 rounded-lg flex justify-between items-center mt-2"
          >
            <div>
              <p className="text-lg font-bold capitalize">{type} Ticket</p>
              <p className="text-gray-300">R {ticket.price}</p>
            </div>
            <div className="flex items-center">
              <button
                className="bg-blue-500 px-2 py-1 rounded-lg hover:bg-blue-600 disabled:bg-gray-600"
                onClick={() => handleQuantityChange(type, 1)}
                disabled={ticketQuantities[type] >= ticket.quantity} // Prevent exceeding available tickets
              >
                +
              </button>
              <p className="px-2 py-1">{ticketQuantities[type]}</p>
              <button
                className="bg-blue-500 px-2 py-1 rounded-lg hover:bg-blue-600 disabled:bg-gray-600"
                onClick={() => handleQuantityChange(type, -1)}
                disabled={ticketQuantities[type] <= 0} // Prevent negative tickets
              >
                -
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-800 p-4 rounded-lg flex justify-between items-center mt-2">
        <div>
          <p className="text-lg font-bold capitalize">
            Total: R {totalTicketPrice}
          </p>
        </div>
        <div className="flex">
          <button className="bg-blue-500 px-2 py-1 rounded-lg hover:bg-blue-600">
            Get Tickets
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
