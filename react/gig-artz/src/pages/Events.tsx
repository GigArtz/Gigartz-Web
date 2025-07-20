import EventGalleryCarousel from "../components/EventGalleryCarousel";
import { RootState } from "../../store/store";
import { useEffect, useState } from "react";
import {
  FaCalendar,
  FaClock,
  FaLocationArrow,
  FaRandom,
  FaUserAlt,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { addLike, buyTicket, fetchAllEvents } from "../../store/eventsSlice";
import React from "react";
import CommentsModal from "../components/CommentsModal";
import ShareModal from "../components/ShareModal";
import EventActions from "../components/EventActions";
import Payment from "../components/Payment";
import EventGallery from "../components/EventGallery";
import Header from "../components/Header";

interface ResaleTicket {
  ticketType: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  daysUntilEvent: number;
  resaleId: string;
  price: number;
  sellerId: string;
}

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
  resaleTickets?: ResaleTicket[];
}

const EventDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");
  const [event, setEvent] = useState<Event | null>(null);
  const [ticketQuantities, setTicketQuantities] = useState<
    Record<string, number>
  >({});
  const [resaleTicketQuantities, setResaleTicketQuantities] = useState<
    Record<string, number>
  >({});
  const eventData: Event[] = useSelector(
    (state: RootState) => state.events.events
  );
  const dispatch = useDispatch();
  const { uid } = useSelector((state: RootState) => state.auth);
  const { profile } = useSelector((state: RootState) => state.profile);

  // Reviews Modal
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);

  // Share Modal
  const [isShareVisible, setIsShareVisible] = useState(false);

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

      // Initialize resale ticket quantities
      if (foundEvent.resaleTickets) {
        const initialResaleQuantities = foundEvent.resaleTickets.reduce(
          (acc, ticket) => {
            acc[ticket.resaleId] = 0;
            return acc;
          },
          {} as Record<string, number>
        );
        setResaleTicketQuantities(initialResaleQuantities);
      }
    }

    console.log(foundEvent);
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

  const handleResaleQuantityChange = (resaleId: string, delta: number) => {
    setResaleTicketQuantities((prevQuantities) => {
      const newQuantity = Math.max(0, (prevQuantities[resaleId] || 0) + delta);
      return { ...prevQuantities, [resaleId]: newQuantity };
    });
  };

  const totalTicketPrice = Object.entries(ticketQuantities).reduce(
    (total, [type, quantity]) => {
      const ticketPrice = event?.ticketsAvailable[type].price || 0;
      return total + ticketPrice * quantity;
    },
    0
  );

  const totalResaleTicketPrice = Object.entries(resaleTicketQuantities).reduce(
    (total, [resaleId, quantity]) => {
      const resaleTicket = event?.resaleTickets?.find(
        (t) => t.resaleId === resaleId
      );
      const ticketPrice = resaleTicket?.price || 0;
      return total + ticketPrice * quantity;
    },
    0
  );

  const grandTotal = totalTicketPrice + totalResaleTicketPrice;

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
          isResale: false,
        }));

      const resaleTicketTypes = Object.entries(resaleTicketQuantities)
        .filter(([_, quantity]) => quantity > 0)
        .map(([resaleId, quantity]) => {
          const resaleTicket = event?.resaleTickets?.find(
            (t) => t.resaleId === resaleId
          );
          return {
            ticketType: resaleTicket?.ticketType || "",
            price: resaleTicket?.price || 0,
            quantity,
            isResale: true,
            resaleId,
            sellerId: resaleTicket?.sellerId,
          };
        });

      const allTickets = [...ticketTypes, ...resaleTicketTypes];

      if (allTickets.length === 0) {
        alert("Please select at least one ticket.");
        return;
      }

      const ticketDetails = {
        eventId,
        customerUid: profile?.id || uid,
        customerName: profile?.name,
        customerEmail: profile?.emailAddress,
        ticketTypes: allTickets,
        location: event.venue || "Unknown",
        eventName: event.title,
        eventDate: event.date,
        image: event.gallery[0] || "Unknown",
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

  return (
    <div className="main-content px-4 md:px-8 mb-3">
      <Header title={event?.title} />

      {/* Modals rendered outside main content to prevent animation interference */}
      {/* Reviews Modal */}
      {isCommentsVisible && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in">
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in">
          <ShareModal
            isVisible={isShareVisible}
            shareUrl={window.location.href}
            onClose={() => setIsShareVisible(false)}
          />
        </div>
      )}

      {/* Payment Modal */}
      <Payment
        isOpen={isPaymentVisible}
        type="ticket"
        amount={grandTotal}
        ticketDetails={{
          eventId,
          customerUid: profile?.id || uid,
          ticketTypes: [
            ...Object.entries(ticketQuantities).map(([type, quantity]) => ({
              ticketType: type,
              price: event?.ticketsAvailable[type].price || 0,
              quantity,
              isResale: false,
            })),
            ...Object.entries(resaleTicketQuantities).map(
              ([resaleId, quantity]) => {
                const resaleTicket = event?.resaleTickets?.find(
                  (t) => t.resaleId === resaleId
                );
                return {
                  ticketType: resaleTicket?.ticketType || "",
                  price: resaleTicket?.price || 0,
                  quantity,
                  isResale: true,
                  resaleId,
                  sellerId: resaleTicket?.sellerId,
                };
              }
            ),
          ],
        }}
        onSuccess={handlePaymentSuccess}
        onFailure={handlePaymentFailure}
        onClose={() => setIsPaymentVisible(false)}
      />

      {/* Hero Section with Enhanced Media Display */}
      <div className="my-4 mb-8 md:mx-0 relative shadow-2xl rounded-xl overflow-hidden group">
        {event.eventVideo ? (
          <div className="relative">
            <video
              autoPlay
              loop
              muted
              className="w-full rounded-t-xl transition-all duration-500 ease-out group-hover:scale-105"
            >
              <source src={event.eventVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {/* Video Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        ) : (
          <div className="relative overflow-hidden">
            <EventGalleryCarousel event={event} />
          </div>
        )}

        {/* Enhanced Actions Section */}
        <div className="flex bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-b-xl p-4 gap-4 text-gray-400 text-sm md:text-base border-t border-gray-700 transition-all duration-300 group-hover:border-teal-500/30">
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

      {/* Enhanced Event Header Section */}
      <div className="flex flex-col justify-between items-start gap-4 mt-6 mb-6 p-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-lg">
        <div className="flex-1">
          <h1 className="text-2xl md:text-4xl font-bold mb-3">
        <span className="bg-gradient-to-r from-teal-300 via-white to-teal-300 bg-clip-text text-transparent">
          {event.title}
        </span>
          </h1>
          <button
        onClick={viewHostProfile}
        className="group text-gray-400 flex items-center transition-all duration-300 hover:text-teal-300 hover:translate-x-1"
          >
        <FaUserAlt className="w-4 h-4 text-teal-400 mr-2 transition-all duration-300 group-hover:scale-110" />
        <span className="font-medium">{event.hostName}</span>
          </button>
        </div>
        <div className="flex-1">
          <p className="text-lg leading-relaxed text-gray-300">
        {event.description}
          </p>
        </div>
      </div>

      {/* Enhanced Event Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div className="group flex items-center p-4 bg-gray-900 rounded-xl border border-gray-700 transition-all duration-300 hover:border-teal-500/30 hover:shadow-lg">
            <FaCalendar className="w-5 h-5 text-teal-400 mr-3 transition-all duration-300 group-hover:scale-110" />
            <div>
              <p className="text-sm text-gray-400">Event Date</p>
              <p className="text-white font-medium">
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="group flex items-center p-4 bg-gray-900 rounded-xl border border-gray-700 transition-all duration-300 hover:border-teal-500/30 hover:shadow-lg">
            <FaLocationArrow className="w-5 h-5 text-teal-400 mr-3 transition-all duration-300 group-hover:scale-110" />
            <div>
              <p className="text-sm text-gray-400">Venue</p>
              <p className="text-white font-medium">{event.venue}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="group flex items-center p-4 bg-gray-900 rounded-xl border border-gray-700 transition-all duration-300 hover:border-teal-500/30 hover:shadow-lg">
            <FaClock className="w-5 h-5 text-teal-400 mr-3 transition-all duration-300 group-hover:scale-110" />
            <div>
              <p className="text-sm text-gray-400">Time</p>
              <p className="text-white font-medium">{event.time}</p>
            </div>
          </div>

          <div className="group flex items-center p-4 bg-gray-900 rounded-xl border border-gray-700 transition-all duration-300 hover:border-teal-500/30 hover:shadow-lg">
            <FaRandom className="w-5 h-5 text-teal-400 mr-3 transition-all duration-300 group-hover:scale-110" />
            <div>
              <p className="text-sm text-gray-400">Category</p>
              <p className="text-white font-medium">{event.category}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="mt-4 border-teal-800/30 border-2" />

      {/* Enhanced Tickets Section */}
      <div className="mt-8 mb-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white">
          Get Your Tickets
        </h2>

        {/* Original Tickets */}
        {Object.entries(event.ticketsAvailable).map(([type, ticket]) => (
          <div
            key={type}
            className="bg-gray-900 border border-teal-500 p-4 rounded-lg flex flex-row justify-between items-center mt-2"
          >
            <div className="text-left">
              <p className="text-lg font-bold capitalize">{type} Ticket</p>
              <p className="text-gray-300">R {ticket.price}</p>
              <p className="text-xs text-gray-500">Official</p>
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

        {/* Resale Tickets */}
        {event.resaleTickets && event.resaleTickets.length > 0 && (
          <>
            <h3 className="text-lg font-bold mt-6 mb-2">Resale Tickets</h3>
            {event.resaleTickets.map((resaleTicket) => (
              <div
                key={resaleTicket.resaleId}
                className="bg-gray-900 border border-orange-500 p-4 rounded-lg flex flex-row justify-between items-center mt-2"
              >
                <div className="text-left">
                  <p className="text-lg font-bold capitalize">
                    {resaleTicket.ticketType} Ticket
                  </p>
                  <p className="text-gray-300">R {resaleTicket.price}</p>
                  <p className="text-xs text-orange-400">
                    Resale • {resaleTicket.daysUntilEvent} days until event
                  </p>
                </div>
                <div className="flex items-center mt-2 sm:mt-0">
                  <button
                    className="bg-orange-500 px-3 py-1 rounded-lg hover:bg-orange-600 disabled:bg-gray-600"
                    onClick={() =>
                      handleResaleQuantityChange(resaleTicket.resaleId, -1)
                    }
                    disabled={
                      resaleTicketQuantities[resaleTicket.resaleId] <= 0
                    }
                  >
                    -
                  </button>
                  <p className="px-4">
                    {resaleTicketQuantities[resaleTicket.resaleId] || 0}
                  </p>
                  <button
                    className="bg-orange-500 px-3 py-1 rounded-lg hover:bg-orange-600 disabled:bg-gray-600"
                    onClick={() =>
                      handleResaleQuantityChange(resaleTicket.resaleId, 1)
                    }
                    disabled={
                      resaleTicketQuantities[resaleTicket.resaleId] >= 1
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {(totalTicketPrice > 0 || totalResaleTicketPrice > 0) && (
          <div className="bg-gray-800 p-4 rounded-lg flex flex-row justify-between items-center my-4">
            <div className="text-left">
              {totalTicketPrice > 0 && (
                <p className="text-sm text-gray-400">
                  Official tickets: R {totalTicketPrice}
                </p>
              )}
              {totalResaleTicketPrice > 0 && (
                <p className="text-sm text-gray-400">
                  Resale tickets: R {totalResaleTicketPrice}
                </p>
              )}
              <p className="text-lg font-bold">Total: R {grandTotal}</p>
            </div>
            <button
              onClick={handlePurchase}
              className="btn-primary-sm px-4 py-2"
              disabled={grandTotal === 0}
            >
              Get Tickets
            </button>
          </div>
        )}
      </div>

      <hr className="mt-4 border-teal-800" />

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
