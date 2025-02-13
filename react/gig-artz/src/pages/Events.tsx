import EventGalleryCarousel from "../components/EventGalleryCarousel";
import { RootState } from "../store/store";
import { useEffect, useState } from "react";
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
}

const EventDetails = () => {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");
  const [event, setEvent] = useState<Event | null>(null);
  const eventData: Event[] = useSelector(
    (state: RootState) => state.events.events
  );

  useEffect(() => {
    const foundEvent = eventData.find((e) => e.id === eventId);
    if (foundEvent) setEvent(foundEvent);
  }, [eventId]);

  if (!event) {
    return (
      <div className="text-white flex justify-center items-center h-screen">
        <p>Event not found.</p>
      </div>
    );
  }

  return (
    <div className="main-content">
      {/* Event Gallery Coursel */}
      <EventGalleryCarousel event={event} />

      {/* Event Title */}
      <h1 className="text-3xl font-bold text-blue-400">{event.title}</h1>

      {/* Event Metadata */}
      <p className="text-gray-300 mt-2">
        📅 {new Date(event.date).toLocaleDateString()} | ⏰{" "}
        {event.time || event.eventStartTime} - {event.eventEndTime}
      </p>
      <p className="text-gray-300">📍 {event.venue}</p>
      <p className="text-gray-400 mt-2">🎤 Hosted by {event.hostName}</p>

      <hr className="mt-4" />

      {/* Event Description */}
      <h2 className="text-2xl font-bold">Description</h2>
      <p className="mt-4 text-lg">{event.description}</p>

      {/* Artist Lineup */}
      <div className="mt-4">
        <h2 className="text-2xl font-bold">Artist Lineup</h2>
        <ul className="list-disc pl-5">
          {event.artistLineUp.map((artist, index) => (
            <li key={index} className="text-gray-300">
              {artist}
            </li>
          ))}
        </ul>
      </div>

      {/* Tickets Section */}
      <hr className="mt-4" />
      <div className="mt-6">
        <h2 className="text-2xl font-bold">Buy Tickets</h2>
        {Object.entries(event.ticketsAvailable).map(([type, ticket]) => (
          <div
            key={type}
            className="bg-gray-800 p-4 rounded-lg flex justify-between items-center mt-2"
          >
            <div>
              <p className="text-lg font-bold capitalize">{type} Ticket</p>
              <p className="text-gray-300">
                R {ticket.price} | {ticket.quantity} Available
              </p>
            </div>
            <button className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600">
              Buy Now
            </button>
          </div>
        ))}
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
    </div>
  );
};

export default EventDetails;
