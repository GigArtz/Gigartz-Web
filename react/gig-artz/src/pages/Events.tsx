import EventGalleryCarousel from "../components/EventGalleryCarousel";
import { RootState } from "../../store/store";
import { useEffect, useState } from "react";
import {
  FaCalendar,
  FaClock,
  FaEllipsisV,
  FaLocationArrow,
  FaRandom,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addLike, buyTicket, fetchAllEvents } from "../../store/eventsSlice";
import React from "react";
import CommentsModal from "../components/CommentsModal";
import ShareModal from "../components/ShareModal";
import CRUDModal from "../components/CRUDModal";
import EditEventModal from "../components/EditEventModal";
import EventActions from "../components/EventActions";
import Payment from "../components/Payment";
import EventGallery from "../components/EventGallery";

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

  // Payment Modal
  const [isPaymentVisible, setIsPaymentVisible] = useState(false);

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

  useEffect(() => {
    dispatch(fetchAllEvents());
  }, [dispatch]);

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
    if (!profile) {
      // alert("Invalid user profile. Please log in to continue.");
      navigate("/"); // Redirect to login page
      return;
    }

    const likedEventIds =
      profile?.likedEvents?.map((event) => event.eventId) || [];
    setLikedEvents(likedEventIds); // Extract eventId from likedEvents and set it
  }, [profile, navigate]);

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
    if (!profile) {
      alert("You must be logged in to purchase tickets.");
      navigate("/"); // Redirect to login page
      return;
    }

    if (eventId) {
      const ticketTypes = Object.entries(ticketQuantities)
        .filter(([_, quantity]) => quantity > 0)
        .map(([type, quantity]) => ({
          ticketType: type,
          price: event?.ticketsAvailable[type].price || 0,
          quantity,
        }));

      if (ticketTypes.length === 0) {
        alert("Please select at least one ticket type.");
        return;
      }

      const ticketDetails = {
        eventId,
        customerUid: profile?.id || uid, // replace with actual customer UID
        customerName: profile?.name, // replace with actual customer name
        customerEmail: profile?.emailAddress, // replace with actual customer email
        ticketTypes,
        location: event.venue || "Unknown",
        eventName: event.title,
        eventDate: event.date,
        image: event.gallery[0] || "Unknown", // replace with actual image if available
      };

      setIsPaymentVisible(true);
      dispatch(buyTicket(ticketDetails));
    }
  };

  const handlePaymentSuccess = () => {
    setIsPaymentVisible(false);
    console.log("Payment successful!");
  };

  const handlePaymentFailure = () => {
    setIsPaymentVisible(false);
    console.error("Payment failed!");
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
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
          onClick={() => setIsCRUDVisible(false)} // Close on backdrop click
        >
          <div
            className="bg-white rounded-lg p-6 shadow-lg relative"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <CRUDModal
              setIsCRUDVisible={setIsCRUDVisible}
              onEdit={handleEditEvent}
              onDelete={() => {
                console.log("Delete event");
                setIsCRUDVisible(false); // Close modal after deleting
              }}
              event={event}
            />
          </div>
        </div>
      )}

      {/* Comments Modal */}
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

      {/* Payment Modal */}
      {isPaymentVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <Payment
            amount={totalTicketPrice}
            ticketDetails={{
              eventId,
              customerUid: profile?.id || uid,
              ticketTypes: Object.entries(ticketQuantities).map(
                ([type, quantity]) => ({
                  ticketType: type,
                  price: event?.ticketsAvailable[type].price || 0,
                  quantity,
                })
              ),
            }}
            onSuccess={handlePaymentSuccess}
            onFailure={handlePaymentFailure}
            onClose={() => setIsPaymentVisible(false)}
          />
        </div>
      )}

      <div className="my-4 mb-8 md:mx-0 relative shadow-md shadow-teal-500 rounded-lg">
        {uid === event?.promoterId && (
          <div
            className=" border z-50 rounded-full bg-gray-500 hover:bg-teal-500 p-2 w-6 h-6 flex justify-center items-center absolute top-5 right-10 cursor-pointer"
            onClick={handleCRUD}
          >
            <FaEllipsisV className="w-4 h-4 text-white" />
          </div>
        )}

        {event.eventVideo ? (
          <div className="mt-4">
            <video autoPlay loop muted className="w-full rounded-lg">
              <source src={event.eventVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <EventGalleryCarousel event={event} />
        )}
      </div>

      <div className="flex flex-row md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-lg md:text-3xl font-bold text-white">
            {event.title}
          </h1>
          <button onClick={viewHostProfile} className="text-gray-400 mt-2">
            {event.hostName}
          </button>
        </div>

        <div className="flex gap-4 text-gray-400 text-sm md:text-base">
          <EventActions
            event={event}
            profile={profile}
            uid={uid || profile.id}
            showComments={showComments}
            shareEvent={shareEvent}
            handleLike={handleLike}
          />
        </div>
      </div>

      <hr className="mt-4" />

      <h2 className="text-lg md:text-2xl font-bold">Description</h2>
      <p className="mt-4 text-lg">{event.description}</p>

      <br />

      <div className="mt-4 mb-4 grid grid-cols-2 gap-4">
        <div>
          <p className="flex items-center ">
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

      <hr className="mt-4" />

      <div className="mt-6 mb-10">
        <h2 className="text-lg md:text-2xl font-bold">Tickets</h2>
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

      <hr className="mt-4" />
      <div>
        <h2 className="text-lg md:text-2xl font-bold mt-4">Gallery</h2>

        {event.eventVideo && (
          <div className="mt-4">
            <video controls className="w-full rounded-lg">
              <source src={event.eventVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
        <EventGallery images={event.gallery} />
      </div>
    </div>
  );
};

export default EventDetails;
