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

  // Uniform Divider Component
  const UniformDivider = ({
    delay = 600,
    slideDirection = "left",
  }: {
    delay?: number;
    slideDirection?: "left" | "right";
  }) => (
    <div
      className={`relative my-8 animate-in fade-in-0 slide-in-from-${slideDirection}-4 duration-600`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <hr className="border-teal-500/30 border-2 transition-all duration-500 hover:border-teal-400/60" />
      <div
        className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 
                     bg-gray-900 px-4 transition-all duration-300 hover:scale-110 animate-pulse"
      >
      </div>
    </div>
  );

  return (
    <div className="main-content px-4 md:px-8 mb-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
      <Header title={"Gigs"} />

      {/* Modals rendered outside main content to prevent animation interference */}
      {/* Reviews Modal */}
      {isCommentsVisible && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center 
                       animate-in fade-in-0 duration-300 ease-out"
        >
          <div className="animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 ease-out">
            <CommentsModal
              user={profile}
              event={event}
              isCommentsVisible={isCommentsVisible}
              onClose={() => setIsCommentsVisible(false)}
            />
          </div>
        </div>
      )}

      {/* Share Modal */}
      {isShareVisible && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center 
                       animate-in fade-in-0 duration-300 ease-out"
        >
          <div className="animate-in slide-in-from-top-4 zoom-in-95 duration-300 ease-out">
            <ShareModal
              isVisible={isShareVisible}
              shareUrl={window.location.href}
              onClose={() => setIsShareVisible(false)}
            />
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <div
        className={`transition-all duration-300 ${
          isPaymentVisible ? "animate-in fade-in-0 zoom-in-95" : ""
        }`}
      >
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
      </div>

      {/* Hero Section with Enhanced Media Display */}
      <div
        className="my-4 mb-8 md:mx-0 relative shadow-2xl rounded-xl overflow-hidden group 
                     animate-in fade-in-0 slide-in-from-left-4 duration-600 delay-200
                     hover:shadow-3xl hover:shadow-teal-500/20 transition-all duration-500"
        style={{ animationFillMode: "both" }}
      >
        {event.eventVideo ? (
          <div className="relative group/video overflow-hidden">
            <video
              autoPlay
              loop
              muted
              className="w-full rounded-t-xl transition-all duration-500 ease-out 
                        group-hover:scale-105 group/video-hover:brightness-110 
                        group/video-hover:contrast-105"
            >
              <source src={event.eventVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {/* Enhanced Video Overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent 
                           opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out"
            ></div>
            {/* Play/Pause indicator */}
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 
                           group-hover:opacity-100 transition-all duration-300 pointer-events-none"
            >
              <div
                className="bg-black/50 backdrop-blur-sm rounded-full p-4 
                             transform scale-75 group-hover:scale-100 transition-transform duration-300"
              >
                <div className="text-white text-2xl">▶</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden group/carousel">
            <div className="transform transition-all duration-500 group/carousel-hover:scale-105">
              <EventGalleryCarousel event={event} />
            </div>
            {/* Carousel overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            ></div>
          </div>
        )}

        {/* Enhanced Actions Section */}
        <div
          className="flex bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-b-xl 
                       p-4 gap-4 text-gray-400 text-sm md:text-base border-t border-gray-700 
                       transition-all duration-300 group-hover:border-teal-500/30 
                       group-hover:from-gray-800 group-hover:via-gray-700 group-hover:to-gray-800
                       transform group-hover:translate-y-[-1px] group-hover:shadow-lg"
        >
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
      <div
        className="flex flex-col justify-between items-start gap-4 mt-6 mb-6 p-6 
                     bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl 
                     border border-gray-700 shadow-lg
                     animate-in fade-in-0 slide-in-from-right-4 duration-600 delay-300
                     hover:shadow-xl hover:border-teal-500/40 hover:shadow-teal-500/10
                     transition-all duration-500 hover:scale-[1.01]"
        style={{ animationFillMode: "both" }}
      >
        <div className="flex-1 transform transition-all duration-300 hover:translate-x-2">
          <h1 className="text-2xl md:text-4xl font-bold mb-3 transition-all duration-300 hover:tracking-wide">
            <span
              className="bg-gradient-to-r from-teal-300 via-white to-teal-300 bg-clip-text text-transparent
                           transition-all duration-300 hover:from-teal-200 hover:via-teal-100 hover:to-teal-200"
            >
              {event.title}
            </span>
          </h1>
          <button
            onClick={viewHostProfile}
            className="group text-gray-400 flex items-center transition-all duration-300 
                      hover:text-teal-300 hover:translate-x-1 active:scale-95"
          >
            <FaUserAlt
              className="w-4 h-4 text-teal-400 mr-2 transition-all duration-300 
                                group-hover:scale-110 group-hover:rotate-3 group-hover:text-teal-300"
            />
            <span className="font-medium transition-all duration-300 group-hover:tracking-wide">
              {event.hostName}
            </span>
          </button>
        </div>
        <div className="flex-1 transform transition-all duration-300 hover:translate-x-1">
          <p
            className="text-lg leading-relaxed text-gray-300 transition-all duration-300 
                       hover:text-gray-200 hover:leading-loose"
          >
            {event.description}
          </p>
        </div>
      </div>

      {/* Enhanced Event Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div
          className="space-y-4 animate-in fade-in-0 slide-in-from-left-4 duration-600 delay-400"
          style={{ animationFillMode: "both" }}
        >
          <div
            className="group flex items-center p-4 bg-gray-900 rounded-xl border border-gray-700 
                         transition-all duration-300 hover:border-teal-500/30 hover:shadow-lg 
                         hover:shadow-teal-500/5 hover:scale-[1.02] hover:translate-x-1 
                         active:scale-[0.98] cursor-pointer"
          >
            <FaCalendar
              className="w-5 h-5 text-teal-400 mr-3 transition-all duration-300 
                                  group-hover:scale-110 group-hover:rotate-6 group-hover:text-teal-300"
            />
            <div className="transition-all duration-300 group-hover:translate-x-1">
              <p className="text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
                Event Date
              </p>
              <p className="text-white font-medium transition-all duration-300 group-hover:tracking-wide">
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div
            className="group flex items-center p-4 bg-gray-900 rounded-xl border border-gray-700 
                         transition-all duration-300 hover:border-teal-500/30 hover:shadow-lg 
                         hover:shadow-teal-500/5 hover:scale-[1.02] hover:translate-x-1 
                         active:scale-[0.98] cursor-pointer"
          >
            <FaLocationArrow
              className="w-5 h-5 text-teal-400 mr-3 transition-all duration-300 
                                      group-hover:scale-110 group-hover:rotate-12 group-hover:text-teal-300"
            />
            <div className="transition-all duration-300 group-hover:translate-x-1">
              <p className="text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
                Venue
              </p>
              <p className="text-white font-medium transition-all duration-300 group-hover:tracking-wide">
                {event.venue}
              </p>
            </div>
          </div>
        </div>

        <div
          className="space-y-4 animate-in fade-in-0 slide-in-from-right-4 duration-600 delay-500"
          style={{ animationFillMode: "both" }}
        >
          <div
            className="group flex items-center p-4 bg-gray-900 rounded-xl border border-gray-700 
                         transition-all duration-300 hover:border-teal-500/30 hover:shadow-lg 
                         hover:shadow-teal-500/5 hover:scale-[1.02] hover:translate-x-1 
                         active:scale-[0.98] cursor-pointer"
          >
            <FaClock
              className="w-5 h-5 text-teal-400 mr-3 transition-all duration-300 
                              group-hover:scale-110 group-hover:rotate-12 group-hover:text-teal-300"
            />
            <div className="transition-all duration-300 group-hover:translate-x-1">
              <p className="text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
                Time
              </p>
              <p className="text-white font-medium transition-all duration-300 group-hover:tracking-wide">
                {event.time}
              </p>
            </div>
          </div>

          <div
            className="group flex items-center p-4 bg-gray-900 rounded-xl border border-gray-700 
                         transition-all duration-300 hover:border-teal-500/30 hover:shadow-lg 
                         hover:shadow-teal-500/5 hover:scale-[1.02] hover:translate-x-1 
                         active:scale-[0.98] cursor-pointer"
          >
            <FaRandom
              className="w-5 h-5 text-teal-400 mr-3 transition-all duration-300 
                                group-hover:scale-110 group-hover:rotate-45 group-hover:text-teal-300"
            />
            <div className="transition-all duration-300 group-hover:translate-x-1">
              <p className="text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
                Category
              </p>
              <p className="text-white font-medium transition-all duration-300 group-hover:tracking-wide">
                {event.category}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Uniform Animated Divider */}
      <UniformDivider delay={600} slideDirection="left" />

      {/* Enhanced Tickets Section */}
      <div
        className="mt-8 mb-10 animate-in fade-in-0 slide-in-from-bottom-4 duration-600 delay-700"
        style={{ animationFillMode: "both" }}
      >
        <h2
          className="text-2xl md:text-3xl font-bold mb-6 text-white transition-all duration-300 
                      hover:tracking-wide hover:text-teal-100"
        >
          Tickets
        </h2>

        {/* Original Tickets */}
        {Object.entries(event.ticketsAvailable).map(([type, ticket], index) => (
          <div
            key={type}
            className="bg-gray-900 border border-teal-500 p-4 rounded-lg flex flex-row justify-between items-center mt-2
                      group hover:bg-gray-800 hover:border-teal-400 hover:shadow-lg hover:shadow-teal-500/10
                      transition-all hover:scale-[1.01] hover:translate-x-1
                      animate-in fade-in-0 slide-in-from-left-4"
            style={{
              animationDelay: `${800 + index * 100}ms`,
              animationDuration: "0.5s",
              animationFillMode: "both",
              transitionDuration: "0.3s",
            }}
          >
            <div className="text-left transform transition-all duration-300 group-hover:translate-x-2">
              <p
                className="text-lg font-bold capitalize transition-all duration-300 
                          group-hover:text-teal-100 group-hover:tracking-wide"
              >
                {type} Ticket
              </p>
              <p className="text-gray-300 transition-all duration-300 group-hover:text-gray-200">
                R {ticket.price}
              </p>
              <p
                className="text-xs text-gray-500 transition-all duration-300 
                          group-hover:text-teal-400 group-hover:font-medium"
              >
                Official
              </p>
            </div>
            <div className="flex items-center mt-2 sm:mt-0 space-x-2">
              <button
                className="bg-teal-500 px-3 py-1 rounded-lg transition-all duration-200
                          hover:bg-teal-400 hover:scale-110 active:scale-95 
                          disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100
                          shadow-md hover:shadow-lg"
                onClick={() => handleQuantityChange(type, -1)}
                disabled={ticketQuantities[type] <= 0}
              >
                <span className="font-bold">-</span>
              </button>
              <p
                className="px-4 font-medium text-white min-w-[2rem] text-center
                          transition-all duration-300 group-hover:scale-110 group-hover:text-teal-100"
              >
                {ticketQuantities[type]}
              </p>
              <button
                className="bg-teal-500 px-3 py-1 rounded-lg transition-all duration-200
                          hover:bg-teal-400 hover:scale-110 active:scale-95 
                          disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100
                          shadow-md hover:shadow-lg"
                onClick={() => handleQuantityChange(type, 1)}
                disabled={ticketQuantities[type] >= ticket.quantity}
              >
                <span className="font-bold">+</span>
              </button>
            </div>
          </div>
        ))}

        {/* Resale Tickets */}
        {event.resaleTickets && event.resaleTickets.length > 0 && (
          <>
            <h3
              className="text-lg font-bold mt-6 mb-2 transition-all 
                          hover:tracking-wide hover:text-orange-300
                          animate-in fade-in-0 slide-in-from-right-4 delay-1000"
              style={{
                animationDuration: "0.5s",
                animationFillMode: "both",
                transitionDuration: "0.3s",
              }}
            >
              Resale Tickets
            </h3>
            {event.resaleTickets.map((resaleTicket, index) => (
              <div
                key={resaleTicket.resaleId}
                className="bg-gray-900 border border-orange-500 p-4 rounded-lg flex flex-row justify-between items-center mt-2
                          group hover:bg-gray-800 hover:border-orange-400 hover:shadow-lg hover:shadow-orange-500/10
                          transition-all hover:scale-[1.01] hover:translate-x-1
                          animate-in fade-in-0 slide-in-from-right-4"
                style={{
                  animationDelay: `${1100 + index * 100}ms`,
                  animationDuration: "0.5s",
                  animationFillMode: "both",
                  transitionDuration: "0.3s",
                }}
              >
                <div className="text-left transform transition-all duration-300 group-hover:translate-x-2">
                  <p
                    className="text-lg font-bold capitalize transition-all duration-300 
                              group-hover:text-orange-100 group-hover:tracking-wide"
                  >
                    {resaleTicket.ticketType} Ticket
                  </p>
                  <p className="text-gray-300 transition-all duration-300 group-hover:text-gray-200">
                    R {resaleTicket.price}
                  </p>
                  <p
                    className="text-xs text-orange-400 transition-all duration-300 
                              group-hover:text-orange-300 group-hover:font-medium"
                  >
                    Resale • {resaleTicket.daysUntilEvent} days until event
                  </p>
                </div>
                <div className="flex items-center mt-2 sm:mt-0 space-x-2">
                  <button
                    className="bg-orange-500 px-3 py-1 rounded-lg transition-all duration-200
                              hover:bg-orange-400 hover:scale-110 active:scale-95 
                              disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100
                              shadow-md hover:shadow-lg"
                    onClick={() =>
                      handleResaleQuantityChange(resaleTicket.resaleId, -1)
                    }
                    disabled={
                      resaleTicketQuantities[resaleTicket.resaleId] <= 0
                    }
                  >
                    <span className="font-bold">-</span>
                  </button>
                  <p
                    className="px-4 font-medium text-white min-w-[2rem] text-center
                              transition-all duration-300 group-hover:scale-110 group-hover:text-orange-100"
                  >
                    {resaleTicketQuantities[resaleTicket.resaleId] || 0}
                  </p>
                  <button
                    className="bg-orange-500 px-3 py-1 rounded-lg transition-all duration-200
                              hover:bg-orange-400 hover:scale-110 active:scale-95 
                              disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100
                              shadow-md hover:shadow-lg"
                    onClick={() =>
                      handleResaleQuantityChange(resaleTicket.resaleId, 1)
                    }
                    disabled={
                      resaleTicketQuantities[resaleTicket.resaleId] >= 1
                    }
                  >
                    <span className="font-bold">+</span>
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {(totalTicketPrice > 0 || totalResaleTicketPrice > 0) && (
          <div
            className="bg-gray-800 p-4 rounded-lg flex flex-row justify-between items-center my-4
                         border border-gray-700 hover:border-teal-500/50 
                         transition-all hover:shadow-lg hover:shadow-teal-500/10
                         hover:scale-[1.01] group
                         animate-in fade-in-0 slide-in-from-bottom-4 delay-1200"
            style={{
              animationDuration: "0.5s",
              animationFillMode: "both",
              transitionDuration: "0.3s",
            }}
          >
            <div className="text-left transform transition-all duration-300 group-hover:translate-x-2">
              {totalTicketPrice > 0 && (
                <p className="text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
                  Official tickets: R {totalTicketPrice}
                </p>
              )}
              {totalResaleTicketPrice > 0 && (
                <p className="text-sm text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
                  Resale tickets: R {totalResaleTicketPrice}
                </p>
              )}
              <p
                className="text-lg font-bold transition-all duration-300 
                          group-hover:text-teal-100 group-hover:tracking-wide group-hover:text-xl"
              >
                Total: R {grandTotal}
              </p>
            </div>
            <button
              onClick={handlePurchase}
              className="btn-primary-sm px-4 py-2 transform transition-all duration-300 
                        hover:scale-105 hover:shadow-lg active:scale-95
                        disabled:cursor-not-allowed disabled:scale-100"
              disabled={grandTotal === 0}
            >
              Get Tickets
            </button>
          </div>
        )}
      </div>

      {/* Uniform Animated Divider */}
      <UniformDivider delay={1300} slideDirection="right" />

      <div
        className="animate-in fade-in-0 slide-in-from-bottom-4 duration-600 delay-1400"
        style={{ animationFillMode: "both" }}
      >
        <h2
          className="text-2xl md:text-3xl font-bold mb-6 text-white transition-all duration-300 
                      hover:tracking-wide hover:text-teal-100"
        >
          Gallery
        </h2>

        {event.eventVideo && (
          <div className="mt-4 group relative overflow-hidden rounded-lg">
            <video
              controls
              className="w-full rounded-lg transition-all duration-300 
                        group-hover:scale-[1.02] group-hover:shadow-lg group-hover:shadow-teal-500/10"
            >
              <source src={event.eventVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            ></div>
          </div>
        )}
        <div className="transform transition-all duration-300 hover:scale-[1.01]">
          <EventGallery images={event.gallery} />
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
