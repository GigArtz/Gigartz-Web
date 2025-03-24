import EventGalleryCarousel from "../components/EventGalleryCarousel";
import { RootState } from "../store/store";
import { useEffect, useState } from "react";
import {
  FaCalendar,
  FaClock,
  FaComment,
  FaEllipsisV,
  FaHeart,
  FaLocationArrow,
  FaRandom,
  FaShareAlt,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addLike, buyTicket } from "../store/eventsSlice";
import React from "react";
import CommentsModal from "../components/CommentsModal";
import ShareModal from "../components/ShareModal";
import CRUDModal from "../components/CRUDModal";
import EditEventModal from "../components/EditEventModal";
import EventActions from "../components/EventActions";

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
  const { uid } = useSelector((state: RootState) => state.auth);
  const { profile } = useSelector((state: RootState) => state.profile);

  // Comments Modal
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);

  // Share Modal
  const [isShareVisible, setIsShareVisible] = useState(false);

  // CRUD Modal
  const [isCRUDVisible, setIsCRUDVisible] = useState(false);

  // Edit Event Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);

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

  // Handle users liked events
  const [likedEvents, setLikedEvents] = useState<string[]>([]);
  useEffect(() => {
    if (profile) {
      const likedEventIds =
        profile?.likedEvents?.map((event) => event.eventId) || [];
      setLikedEvents(likedEventIds); // Extract eventId from likedEvents and set it
    }
  }, [profile]);

  useEffect(() => {
    if (eventId && !likedEvents.includes(eventId)) {
      const isLiked = profile?.likedEvents?.some(
        (event) => event.eventId === eventId
      );
      if (isLiked) {
        setLikedEvents((prevLikedEvents) => [...prevLikedEvents, eventId]);
      }
    }
  }, [eventId, profile, likedEvents]);

  // Handle like
  const handleLike = (uid: string, eventId: string) => {
    if (!likedEvents.includes(eventId)) {
      dispatch(addLike(eventId, profile?.id || uid));
      setLikedEvents((prevLikedEvents) => [...prevLikedEvents, eventId]);
    } else {
      console.log("Event already liked");
    }
  };

  // Update likes after click
  useEffect(() => {
    if (eventId) {
      const updatedEvent = eventData.find((e) => e.id === eventId);
      if (updatedEvent) {
        setEvent(updatedEvent);
      }
    }
  }, [eventData, eventId]);

  // Show comments
  const showComments = () => {
    console.log("show comments");
    setIsCommentsVisible(true);
  };

  // Show comments
  const shareEvent = () => {
    console.log("Show comments", eventId);
    setIsShareVisible(true);
  };

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
      const ticketTypes = Object.entries(ticketQuantities)
        .filter(([_, quantity]) => quantity > 0)
        .map(([type, quantity]) => ({
          ticketType: type,
          price: event?.ticketsAvailable[type].price || 0,
          quantity,
        }));

      const ticketDetails = {
        eventId,
        customerUid: profile?.id, // replace with actual customer UID
        customerName: profile?.name, // replace with actual customer name
        customerEmail: profile?.emailAddress, // replace with actual customer email
        ticketTypes,
        location: event.venue,
        eventName: event.title,
        eventDate: event.date,
        image: event.gallery[0], // replace with actual image if available
      };


      console.log(ticketDetails);

      dispatch(buyTicket(ticketDetails));
    }
  };

  const viewHostProfile = () => {
    navigate(`/people/${event.promoterId}`);
  };

  const handleCRUD = () => {
    setIsCRUDVisible(true);
  };

  const handleEditEvent = (event: Event) => {
    setEventToEdit(event);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEventToEdit(null);
  };

  return (
    <div className="main-content px-4 md:px-8 mb-3">
      {/* Edit Event Modal */}
      {isEditModalOpen && (
        <EditEventModal
          isModalOpen={isEditModalOpen}
          closeModal={closeEditModal}
          event={eventToEdit}
        />
      )}

      {/* CRUD Modal */}
      {isCRUDVisible && (
        <CRUDModal
          setIsCRUDVisible={setIsCRUDVisible}
          onEdit={handleEditEvent}
          onDelete={() => {
            console.log("Delete event");
            setIsCRUDVisible(false); // Close modal after deleting
          }}
          event={event}
        />
      )}

      {/* Comments Modal */}
      {isCommentsVisible && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex justify-center items-center">
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
        <ShareModal
          isVisible={isShareVisible}
          shareUrl={window.location.href} // Gets the current URL
          onClose={() => setIsShareVisible(false)}
        />
      )}

      <div className="">
        {uid === event?.promoterId && (
          <div className="z-20 rounded-full bg-gray-500 hover:bg-teal-500 p-2 w-6 h-6 flex justify-center items-center absolute top-5 right-10">
            <FaEllipsisV
              onClick={handleCRUD}
              className="z-10 w-4 h-4 text-white"
            />
          </div>
        )}

        <EventGalleryCarousel event={event} />
      </div>

      <div className="flex flex-row md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">{event.title}</h1>
          <button onClick={viewHostProfile} className="text-gray-400 mt-2">
            {event.hostName}
          </button>
        </div>

        <div className="flex gap-4 text-gray-400 text-sm md:text-base">
          <EventActions
            event={event}
            profile={profile}
            uid={profile.id}
            showComments={showComments}
            shareEvent={shareEvent}
            handleLike={handleLike}
          />
          {/* <p className="flex items-center" onClick={showComments}>
            <FaComment className="w-4 h-4 hover:text-teal-500 mr-2" />{" "}
            {event.comments.length}
          </p>
          <p className="flex items-center">
            <FaHeart
              onClick={() => handleLike(profile?.id || uid, event.id)}
              className={`w-4 h-4 mr-2 cursor-pointer ${
                likedEvents.includes(event.id)
                  ? "text-red-500"
                  : "hover:text-red-500"
              }`}
            />
            {event.likes}
          </p>

          <p className="flex items-center">
            <FaShareAlt
              onClick={shareEvent}
              className="w-4 h-4 hover:text-teal-500  mr-2"
            />
          </p> */}
        </div>
      </div>

      <hr className="mt-4" />

      <h2 className="text-2xl font-bold">Description</h2>
      <p className="mt-4 text-lg">{event.description}</p>

      <hr className="mt-4" />

      <div className="mt-4 mb-4 grid grid-cols-2 gap-4 sticky top-3">
        <div>
          <p className="flex items-center">
            <FaCalendar className="w-5 h-5 text-white mr-2" />{" "}
            {new Date(event.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className="flex items-center">
            <FaLocationArrow className="w-5 h-5 text-white mr-2 mt-2" />{" "}
            {event.venue}
          </p>
        </div>
        <div className="">
          <p className="flex items-center">
            <FaClock className="w-5 h-5 text-white mr-2" /> {event.time}
          </p>
          <p className="flex items-center">
            <FaRandom className="w-5 h-5 text-white mr-2 mt-2" />{" "}
            {event.category}
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
            className="bg-gray-900 p-4 rounded-lg flex flex-row justify-between items-center mt-2"
          >
            <div className="text-left">
              <p className="text-lg font-bold capitalize">{type} Ticket</p>
              <p className="text-gray-300">R {ticket.price}</p>
            </div>
            <div className="flex items-center mt-2 sm:mt-0">
              <button
                className="bg-teal-500 px-3 py-1 rounded-lg hover:bg-teal-600 disabled:bg-gray-600"
                onClick={() => handleQuantityChange(type, -1)}
                disabled={ticketQuantities[type] <= 0}
              >
                -
              </button>
              <p className="px-4">{ticketQuantities[type]}</p>
              <button
                className="bg-teal-500 px-3 py-1 rounded-lg hover:bg-teal-600 disabled:bg-gray-600"
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
          <button
            onClick={handlePurchase}
            className="bg-teal-500 px-4 py-2 rounded-lg hover:bg-teal-600 mt-2 sm:mt-0"
          >
            Get Tickets
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
