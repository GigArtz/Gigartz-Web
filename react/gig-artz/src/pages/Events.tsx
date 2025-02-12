import { useEffect, useState } from "react";
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

const eventData: Event[] = [
  {
    id: "3HyQxliHlmPXKQp7zyjP",
    title: "Event Test",
    date: "2025-01-31T09:26:00.000Z",
    eventStartTime: "2025-01-28T10:30:00.000Z",
    eventEndTime: "2025-01-28T04:30:00.000Z",
    venue: "Kimberley",
    description: "Testing of Event",
    artistLineUp: ["Kabelo"],
    gallery: [
      "file:///data/user/0/com.gigartz.gig/cache/ImagePicker/05d24dab-ae9b-4e97-a45b-c6cbe2eab365.jpeg",
      "file:///data/user/0/com.gigartz.gig/cache/ImagePicker/4dd0f16f-3b2d-43c8-b52b-77b2745e4282.jpeg",
    ],
    eventVideo: "",
    ticketsAvailable: {
      General: { price: 150, quantity: 300 },
    },
    category: "Jazz, comedy",
    hostName: "Vuyo Test",
  },
  {
    id: "p7iDr9AuJfCLGpAnbf3v",
    title: "Diamonds & Dorings",
    date: "2024-12-25",
    time: "19:00",
    eventStartTime: "18:00",
    eventEndTime: "23:00",
    venue: "Jazz Hall",
    description: "Enjoy live jazz music by renowned artists.",
    artistLineUp: ["Jazz Band A", "Jazz Band B"],
    gallery: [
      "https://firebasestorage.googleapis.com/v0/b/test-1c2c1.appspot.com/o/profilePics%2FeventsTest%2FDiamond%20and%20dorings.jpg?alt=media&token=c46e4eca-74b5-4c70-8e04-83b539a3ff3a",
      "https://firebasestorage.googleapis.com/v0/b/test-1c2c1.appspot.com/o/profilePics%2FeventsTest%2FWhatsApp%20Image%202024-07-17%20at%2018.49.54.jpeg?alt=media&token=8420d8ad-111e-4e10-a8bb-4b534ba5fc3c",
    ],
    eventVideo:
      "https://firebasestorage.googleapis.com/v0/b/test-1c2c1.appspot.com/o/eventVideos%2F1737972762857_eventVideo.mp4?alt=media&token=f5dc313c-eba2-40dc-8751-b91669cda271",
    ticketsAvailable: {
      vip: { price: 300, quantity: 20 },
      general: { price: 100, quantity: 100 },
    },
    category: "Music",
    hostName: "Kabelo12345",
  },
];

const EventDetails = () => {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");
  const [event, setEvent] = useState<Event | null>(null);

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
    <div className="w-full min-h-screen text-white p-4 md:px-16 lg:px-32">
      {/* Event Title */}
      <h1 className="text-3xl font-bold text-blue-400">{event.title}</h1>

      {/* Event Metadata */}
      <p className="text-gray-300 mt-2">
        📅 {new Date(event.date).toLocaleDateString()} | ⏰ {event.time || event.eventStartTime} - {event.eventEndTime}
      </p>
      <p className="text-gray-300">📍 {event.venue}</p>
      <p className="text-gray-400 mt-2">🎤 Hosted by {event.hostName}</p>

      {/* Event Gallery */}
      <div className="flex space-x-4 overflow-x-auto mt-4">
        {event.gallery.map((img, index) => (
          <img
            key={index}
            src={img}
            alt="Event Image"
            className="h-48 rounded-lg object-cover"
          />
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

      {/* Event Description */}
      <p className="mt-4 text-lg">{event.description}</p>

      {/* Artist Lineup */}
      <div className="mt-4">
        <h2 className="text-2xl font-bold">🎶 Artist Lineup</h2>
        <ul className="list-disc pl-5">
          {event.artistLineUp.map((artist, index) => (
            <li key={index} className="text-gray-300">{artist}</li>
          ))}
        </ul>
      </div>

      {/* Tickets Section */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold text-blue-400">🎟 Buy Tickets</h2>
        {Object.entries(event.ticketsAvailable).map(([type, ticket]) => (
          <div
            key={type}
            className="bg-gray-800 p-4 rounded-lg flex justify-between items-center mt-2"
          >
            <div>
              <p className="text-lg font-bold capitalize">{type} Ticket</p>
              <p className="text-gray-300">R {ticket.price} | {ticket.quantity} Available</p>
            </div>
            <button className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600">
              Buy Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventDetails;
