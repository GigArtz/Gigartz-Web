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
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { buyTicket } from "../store/eventsSlice";

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
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketQuantities, setTicketQuantities] = useState<
    Record<string, number>
  >({});
  const eventData: Event[] = useSelector(
    (state: RootState) => state.events.events
  );
  const dispatch = useDispatch();

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

  // Buy ticket
  const handlePurchase = () => {
    if (eventId) {
      const ticketDetails = {
        customerUid: "exampleUid", // replace with actual customer UID
        customerName: "exampleName", // replace with actual customer name
        customerEmail: "exampleEmail", // replace with actual customer email
        amount: totalTicketPrice,
        ticketType: "exampleType", // replace with actual ticket type
        location: event.venue,
        eventName: event.title,
        eventDate: event.date,
        description: event.description,
        image: event.gallery[0], // replace with actual image if available
      };
      dispatch(buyTicket(ticketDetails));
    }
  };

  const viewHostProfile = () => {
    navigate(`/people/${event.promoterId}`);
  };

  return (
    <div className="main-content px-4 md:px-8 mb-3">
      <EventGalleryCarousel event={event} />

      <div className="flex flex-row md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{event.title}</h1>
          <button onClick={viewHostProfile} className="text-gray-400 mt-2">
            {event.hostName}
          </button>
        </div>

        <div className="flex gap-4 text-gray-400 text-sm md:text-base">
          <p className="flex items-center">
            <FaComment className="w-5 h-5 mr-2" /> {event.comments.length}
          </p>
          <p className="flex items-center">
            <FaHeart className="w-5 h-5 text-red-500 mr-2" /> {event.likes}
          </p>
          <p className="flex items-center">
            <FaShare className="w-5 h-5 mr-2" />
          </p>
        </div>
      </div>

      <hr className="mt-4" />

      <h2 className="text-2xl font-bold">Description</h2>
      <p className="mt-4 text-lg">{event.description}</p>

      <hr className="mt-4" />

      <div className="mt-4 mb-4 grid grid-cols-2 gap-4 sticky top-3">
        <div>
          <p className="flex items-center">
            <FaCalendar className="w-5 h-5 text-white mr-2" /> {event.date}
          </p>
          <p className="flex items-center">
            <FaLocationArrow className="w-5 h-5 text-white mr-2" />{" "}
            {event.venue}
          </p>
        </div>
        <div>
          <p className="flex items-center">
            <FaClock className="w-5 h-5 text-white mr-2" /> {event.time}
          </p>
          <p className="flex items-center">
            <FaClock className="w-5 h-5 text-white mr-2" /> {event.category}
          </p>
        </div>
      </div>

      {event.eventVideo && (
        <div className="mt-4">
          <video controls className="w-full rounded-lg">
            <source src={event.eventVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      <hr className="mt-4" />

      <div className="mt-6 mb-20">
        <h2 className="text-2xl font-bold">Tickets</h2>
        {Object.entries(event.ticketsAvailable).map(([type, ticket]) => (
          <div
            key={type}
            className="bg-gray-800 p-4 rounded-lg flex flex-row justify-between items-center mt-2"
          >
            <div className="text-left">
              <p className="text-lg font-bold capitalize">{type} Ticket</p>
              <p className="text-gray-300">R {ticket.price}</p>
            </div>
            <div className="flex items-center mt-2 sm:mt-0">
              <button
                className="bg-blue-500 px-3 py-1 rounded-lg hover:bg-blue-600 disabled:bg-gray-600"
                onClick={() => handleQuantityChange(type, -1)}
                disabled={ticketQuantities[type] <= 0}
              >
                -
              </button>
              <p className="px-4">{ticketQuantities[type]}</p>
              <button
                className="bg-blue-500 px-3 py-1 rounded-lg hover:bg-blue-600 disabled:bg-gray-600"
                onClick={() => handleQuantityChange(type, 1)}
                disabled={ticketQuantities[type] >= ticket.quantity}
              >
                +
              </button>
            </div>
          </div>
        ))}

        <div className="bg-gray-800 p-4 rounded-lg flex flex-row justify-between items-center my-4">
          <p className="text-lg font-bold">Total: R {totalTicketPrice}</p>
          <button onClick={handlePurchase} className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 mt-2 sm:mt-0">
            Get Tickets
          </button>
        </div>
      </div>

     
    </div>
  );
};

export default EventDetails;
