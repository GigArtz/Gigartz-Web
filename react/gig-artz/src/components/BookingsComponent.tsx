import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import {
  updateBookingStatus,
  setBookingExtras,
} from "../../store/profileSlice";
import BaseModal from "./BaseModal";
import { FaInfoCircle } from "react-icons/fa";
import "../styles/bookings-animations.css";

interface Booking {
  id: string;
  title: string;
  location: string;
  date: string;
  guests: string;
  price: string;
  status: string;
  image: string;
}

interface BookingsComponentProps {
  showHeader?: boolean;
  showStats?: boolean;
  compact?: boolean;
}

const BookingsComponent: React.FC<BookingsComponentProps> = ({
  showHeader = true,
  showStats = true,
  compact = false,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { userBookings, userBookingsRequests, profile } = useSelector(
    (state: RootState) => state.profile
  );

  // Transform bookings data
  const confirmedBookings: Booking[] = useMemo(
    () =>
      ((userBookings as any[]) || []).map((booking: any) => ({
        id: booking.id,
        title: booking.eventDetails || "No Title",
        location: booking.venue || "No Venue",
        date:
          booking.date &&
          typeof booking.date === "object" &&
          booking.date.seconds
            ? new Date(booking.date.seconds * 1000).toLocaleDateString()
            : typeof booking.date === "string"
            ? booking.date
            : "N/A",
        guests: booking.additionalInfo || "N/A",
        price: "N/A",
        status: booking.status,
        image:
          typeof booking.image === "string"
            ? booking.image
            : "https://placehold.co/150x150?text=No+Image",
      })),
    [userBookings]
  );

  const pendingBookings: Booking[] = useMemo(
    () =>
      ((userBookingsRequests as any[]) || []).map((booking: any) => ({
        id: booking.id,
        title: booking.eventDetails || "No Title",
        location: booking.venue || "No Venue",
        date:
          booking.date &&
          typeof booking.date === "object" &&
          booking.date.seconds
            ? new Date(booking.date.seconds * 1000).toLocaleDateString()
            : typeof booking.date === "string"
            ? booking.date
            : "N/A",
        guests: booking.additionalInfo || "N/A",
        price: "N/A",
        status: booking.status,
        image:
          typeof booking.image === "string"
            ? booking.image
            : "https://placehold.co/150x150?text=No+Image",
      })),
    [userBookingsRequests]
  );

  // Group bookings by event title
  const groupBookingsByEvent = (bookings: Booking[]) => {
    const grouped = bookings.reduce((acc, booking) => {
      const eventTitle = booking.title;
      if (!acc[eventTitle]) {
        acc[eventTitle] = [];
      }
      acc[eventTitle].push(booking);
      return acc;
    }, {} as Record<string, Booking[]>);
    return grouped;
  };

  const groupedConfirmedBookings = useMemo(
    () => groupBookingsByEvent(confirmedBookings),
    [confirmedBookings]
  );
  const groupedPendingBookings = useMemo(
    () => groupBookingsByEvent(pendingBookings),
    [pendingBookings]
  );

  // State management
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isExtrasModalOpen, setIsExtrasModalOpen] = useState(false);
  const [extrasForm, setExtrasForm] = useState({
    additionalCosts: "",
    depositPercent: "",
  });
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set()
  );

  // Set all groups as collapsed by default only when bookings data changes
  React.useEffect(() => {
    if (confirmedBookings.length > 0 || pendingBookings.length > 0) {
      // Compute groups directly to avoid circular dependency
      const confirmedGroups = groupBookingsByEvent(confirmedBookings);
      const pendingGroups = groupBookingsByEvent(pendingBookings);

      const allGroups = new Set([
        ...Object.keys(confirmedGroups).map((title) => `confirmed-${title}`),
        ...Object.keys(pendingGroups).map((title) => `pending-${title}`),
      ]);
      setCollapsedGroups(allGroups);
    }
  }, [
    confirmedBookings.length,
    pendingBookings.length,
    JSON.stringify(confirmedBookings.map((b) => b.id + b.title)),
    JSON.stringify(pendingBookings.map((b) => b.id + b.title)),
  ]);

  // Helper functions
  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  const openModal = (booking) => setSelectedBooking(booking);
  const closeModal = () => setSelectedBooking(null);
  const handleAccept = () => {
    if (selectedBooking) {
      dispatch(
        updateBookingStatus({
          freelancerId: selectedBooking?.freelancerId,
          bookingId: selectedBooking.id,
          status: "Confirmed",
        })
      );
      closeModal();
    }
  };

  const handleDecline = () => {
    if (selectedBooking) {
      dispatch(
        updateBookingStatus({
          freelancerId: selectedBooking.freelancerId,
          bookingId: selectedBooking.id,
          status: "Declined", // Or "Declined" if supported
        })
      );
      closeModal();
    }
  };

  const handleOpenExtras = (booking) => {
    setSelectedBooking(booking);
    setExtrasForm({
      additionalCosts: booking.additionalCosts || "",
      depositPercent: booking.depositPercent || "",
    });
    setIsExtrasModalOpen(true);
  };

  const handleExtrasChange = (e) => {
    const { name, value } = e.target;
    setExtrasForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitExtras = async () => {
    if (!selectedBooking) return;
    const bookingId = selectedBooking.id;
    const extrasPayload = {
      bookingId,
      extras: {
        additionalCosts: Number(extrasForm.additionalCosts) || 0,
        depositPercent: Number(extrasForm.depositPercent) || 0,
      },
    };
    try {
      await dispatch(setBookingExtras(extrasPayload) as any);
      // Optionally update status in case backend doesn't
      dispatch(
        updateBookingStatus({ bookingId, newStatus: "ExtrasAdded" }) as any
      );
      setIsExtrasModalOpen(false);
      setSelectedBooking(null);
    } catch (err) {
      console.error("Failed to submit extras", err);
      setIsExtrasModalOpen(false);
    }
  };

  if (compact) {
    // Compact version for Wallet tabs
    return (
      <div className="space-y-6">
        {/* Compact Summary Stats with Enhanced Animations */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-3 rounded-lg text-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 animate-fade-in-up">
            <p className="text-lg font-bold text-white animate-bounce-in">
              {confirmedBookings.length}
            </p>
            <p className="text-xs text-white opacity-90">Confirmed</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 p-3 rounded-lg text-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/25 animate-fade-in-up animation-delay-100">
            <p className="text-lg font-bold text-white animate-bounce-in animation-delay-150">
              {pendingBookings.length}
            </p>
            <p className="text-xs text-white opacity-90">Pending</p>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-lg text-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 animate-fade-in-up animation-delay-200">
            <p className="text-lg font-bold text-white animate-bounce-in animation-delay-300">
              {confirmedBookings.length + pendingBookings.length}
            </p>
            <p className="text-xs text-white opacity-90">Total</p>
          </div>
        </div>

        {/* Confirmed Bookings - Compact with Enhanced Animations */}
        <div className="space-y-3 animate-fade-in-left">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 animate-slide-in-left">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Confirmed
            </h3>
            {Object.keys(groupedConfirmedBookings).length > 0 && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full animate-bounce-in animation-delay-500">
                {confirmedBookings.length}
              </span>
            )}
          </div>

          {Object.keys(groupedConfirmedBookings).length > 0 ? (
            <div className="space-y-4 animate-fade-in">
              {Object.entries(groupedConfirmedBookings).map(
                ([eventTitle, bookings], index) => (
                  <div
                    key={eventTitle}
                    className="space-y-2 animate-slide-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Event Group Header with Enhanced Animations */}
                    <div
                      className="bg-gray-900 p-3 rounded-lg border border-green-400/30 cursor-pointer hover:bg-gray-800 hover:border-green-400/60 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1"
                      onClick={() => toggleGroup(`confirmed-${eventTitle}`)}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-md font-semibold text-green-300 flex items-center gap-2 group-hover:text-green-200">
                          <svg
                            className={`w-4 h-4 transition-all duration-300 transform ${
                              collapsedGroups.has(`confirmed-${eventTitle}`)
                                ? "rotate-0 text-green-400"
                                : "rotate-90 text-green-300"
                            } hover:scale-110`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                          <svg
                            className="w-4 h-4 animate-pulse"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4z"
                            />
                          </svg>
                          <span className="animate-fade-in text">
                            {eventTitle}
                          </span>
                        </h4>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 text-nowrap rounded-full transform hover:scale-105 transition-transform duration-200 animate-bounce-in">
                          {bookings.length} booking
                          {bookings.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 animate-fade-in animation-delay-200">
                        <span className="hover:text-gray-300 transition-colors duration-200">
                          📍 {bookings[0].location}
                        </span>
                        <span className="hover:text-gray-300 transition-colors duration-200">
                          📅 {bookings[0].date}
                        </span>
                      </div>
                    </div>

                    {/* Individual Bookings - Collapsible with Stagger Animation */}
                    {!collapsedGroups.has(`confirmed-${eventTitle}`) && (
                      <div className="space-y-2 animate-slide-down">
                        {bookings.map((booking, bookingIndex) => (
                          <div
                            key={booking.id}
                            className="bg-gray-800 border border-gray-700 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 p-3 rounded-lg cursor-pointer group ml-4 transform hover:scale-[1.02] hover:-translate-y-1 animate-fade-in-up"
                            style={{
                              animationDelay: `${bookingIndex * 100}ms`,
                            }}
                            onClick={() => openModal(booking)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <img
                                  src={booking.image}
                                  alt={booking.title}
                                  className="w-10 h-10 rounded-lg object-cover border border-green-400"
                                />
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                              </div>

                              <div className="flex-grow min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h5 className="text-sm text-gray-300 truncate group-hover:text-green-300">
                                    Booking #{booking.id.slice(-6)}
                                  </h5>
                                  <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded-full ml-2">
                                    ✓
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <svg
                                      className="w-3 h-3"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                      />
                                    </svg>
                                    {booking.guests}
                                  </span>
                                  <span className="text-green-400 font-medium">
                                    {booking.status}
                                  </span>
                                </div>
                              </div>

                              <svg
                                className="w-4 h-4 text-gray-400 group-hover:text-green-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="bg-gray-800 border-2 border-dashed border-gray-600 p-4 rounded-lg text-center animate-fade-in transform hover:scale-105 transition-transform duration-300">
              <svg
                className="w-8 h-8 mx-auto mb-2 text-gray-400 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-400 text-sm animate-fade-in animation-delay-200">
                No confirmed bookings
              </p>
            </div>
          )}
        </div>

        {/* Pending Bookings - Compact with Enhanced Animations */}
        <div className="space-y-3 animate-fade-in-right">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 animate-slide-in-right">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              Pending
            </h3>
            {Object.keys(groupedPendingBookings).length > 0 && (
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full animate-bounce-in animation-delay-500">
                {pendingBookings.length}
              </span>
            )}
          </div>

          {Object.keys(groupedPendingBookings).length > 0 ? (
            <div className="space-y-4 animate-fade-in">
              {Object.entries(groupedPendingBookings).map(
                ([eventTitle, bookings], index) => (
                  <div
                    key={eventTitle}
                    className="space-y-2 animate-slide-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Event Group Header with Enhanced Animations */}
                    <div
                      className="bg-gray-900 p-3 rounded-lg border border-yellow-400/30 cursor-pointer hover:bg-gray-800 hover:border-yellow-400/60 hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1"
                      onClick={() => toggleGroup(`pending-${eventTitle}`)}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-md font-semibold text-yellow-300 flex items-center gap-2 group-hover:text-yellow-200">
                          <svg
                            className={`w-4 h-4 transition-all duration-300 transform ${
                              collapsedGroups.has(`pending-${eventTitle}`)
                                ? "rotate-0 text-yellow-400"
                                : "rotate-90 text-yellow-300"
                            } hover:scale-110`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                          <svg
                            className="w-4 h-4 animate-spin"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="animate-fade-in">{eventTitle}</span>
                        </h4>
                        <span className="bg-yellow-100 text-nowrap text-yellow-800 text-xs px-2 py-0.5 rounded-full transform hover:scale-105 transition-transform duration-200 animate-bounce-in">
                          {bookings.length} booking
                          {bookings.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 animate-fade-in animation-delay-200">
                        <span className="hover:text-gray-300 transition-colors duration-200">
                          📍 {bookings[0].location}
                        </span>
                        <span className="hover:text-gray-300 transition-colors duration-200">
                          📅 {bookings[0].date}
                        </span>
                      </div>
                    </div>

                    {/* Individual Bookings - Collapsible with Enhanced Animations */}
                    {!collapsedGroups.has(`pending-${eventTitle}`) && (
                      <div className="space-y-2 animate-slide-down">
                        {bookings.map((booking, bookingIndex) => (
                          <div
                            key={booking.id}
                            className="bg-gray-800 border border-gray-700 hover:border-yellow-500 hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300 p-3 rounded-lg cursor-pointer group ml-4 transform hover:scale-[1.02] hover:-translate-y-1 animate-fade-in-up"
                            style={{
                              animationDelay: `${bookingIndex * 100}ms`,
                            }}
                            onClick={() => openModal(booking)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <img
                                  src={booking.image}
                                  alt={booking.title}
                                  className="w-10 h-10 rounded-lg object-cover border border-yellow-400"
                                />
                                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                              </div>

                              <div className="flex-grow min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <h5 className="text-sm text-gray-300 truncate group-hover:text-yellow-300">
                                    Booking #{booking.id.slice(-6)}
                                  </h5>
                                  <span className="bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5 rounded-full ml-2">
                                    ⏳
                                  </span>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                        />
                                      </svg>
                                      {booking.guests}
                                    </span>
                                    <span className="text-yellow-400 font-medium">
                                      {booking.status}
                                    </span>
                                  </div>

                                  {/* Compact Action Buttons with Enhanced Animations */}
                                  <div className="flex gap-1 animate-fade-in animation-delay-300">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedBooking(booking);
                                        handleAccept();
                                      }}
                                      className="bg-green-600 hover:bg-green-700 hover:shadow-lg hover:shadow-green-500/50 text-white px-2 py-1 rounded text-xs transition-all duration-300 transform hover:scale-110 hover:-translate-y-0.5 animate-bounce-in animation-delay-400"
                                    >
                                      ✓
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedBooking(booking);
                                        handleDecline();
                                      }}
                                      className="bg-red-600 hover:bg-red-700 hover:shadow-lg hover:shadow-red-500/50 text-white px-2 py-1 rounded text-xs transition-all duration-300 transform hover:scale-110 hover:-translate-y-0.5 animate-bounce-in animation-delay-500"
                                    >
                                      ✕
                                    </button>
                                    {/* Add Extras button shown to freelancer (profile owner) */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenExtras(booking);
                                      }}
                                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-xs transition-all duration-300 transform hover:scale-110 hover:-translate-y-0.5"
                                    >
                                      +Extras
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="bg-gray-800 border-2 border-dashed border-gray-600 p-4 rounded-lg text-center animate-fade-in transform hover:scale-105 transition-transform duration-300">
              <svg
                className="w-8 h-8 mx-auto mb-2 text-gray-400 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                {/* Extras Modal */}
                <BaseModal
                  isOpen={isExtrasModalOpen}
                  onClose={() => setIsExtrasModalOpen(false)}
                  title="Add Extras & Deposit"
                  icon={<FaInfoCircle />}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-300">
                        Additional Costs (USD)
                      </label>
                      <input
                        name="additionalCosts"
                        value={extrasForm.additionalCosts}
                        onChange={handleExtrasChange}
                        className="w-full mt-1 p-2 bg-gray-900 border border-gray-700 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300">
                        Deposit Percent (%)
                      </label>
                      <input
                        name="depositPercent"
                        value={extrasForm.depositPercent}
                        onChange={handleExtrasChange}
                        className="w-full mt-1 p-2 bg-gray-900 border border-gray-700 rounded"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setIsExtrasModalOpen(false)}
                        className="px-4 py-2 bg-gray-700 rounded text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmitExtras}
                        className="px-4 py-2 bg-indigo-600 rounded text-sm text-white"
                      >
                        Save Extras
                      </button>
                    </div>
                  </div>
                </BaseModal>
              </svg>
              <p className="text-gray-400 text-sm animate-fade-in animation-delay-200">
                No pending bookings
              </p>
            </div>
          )}
        </div>
        {/* Enhanced Modal for Booking Details */}
        <BaseModal
          isOpen={selectedBooking !== null}
          onClose={closeModal}
          title="Booking Details"
          icon={<FaInfoCircle />}
          maxWidth="md:max-w-2xl"
        >
          {selectedBooking && (
            <div className="space-y-6">
              {/* Header with image and status */}
              <div className="relative">
                <img
                  src={selectedBooking.image}
                  alt={selectedBooking.title}
                  className="w-full h-48 rounded-xl object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedBooking.status === "Confirmed"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {selectedBooking.status}
                  </span>
                </div>
              </div>

              {/* Booking Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className="w-5 h-5 text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4z"
                      />
                    </svg>
                    <h4 className="font-semibold text-white">Event Title</h4>
                  </div>
                  <p className="text-gray-300">{selectedBooking.title}</p>
                </div>

                <div className="bg-gray-800 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className="w-5 h-5 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <h4 className="font-semibold text-white">Location</h4>
                  </div>
                  <p className="text-gray-300">{selectedBooking.location}</p>
                </div>

                <div className="bg-gray-800 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className="w-5 h-5 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <h4 className="font-semibold text-white">Date</h4>
                  </div>
                  <p className="text-gray-300">{selectedBooking.date}</p>
                </div>

                <div className="bg-gray-800 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <svg
                      className="w-5 h-5 text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <h4 className="font-semibold text-white">Guests Info</h4>
                  </div>
                  <p className="text-gray-300">{selectedBooking.guests}</p>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedBooking.status === "Pending" && (
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
                  <button
                    onClick={handleDecline}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    Decline Booking
                  </button>
                  <button
                    onClick={handleAccept}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Accept Booking
                  </button>
                </div>
              )}

              {selectedBooking.status === "Confirmed" && (
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-green-800 font-medium">
                      This booking is confirmed and ready to go!
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </BaseModal>
      </div>
    );
  }

  // Full version for dedicated Bookings page
  return (
    <div className="space-y-6">
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up">
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 rounded-lg text-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 animate-slide-in-left">
            <p className="text-2xl font-bold text-white animate-bounce-in">
              {confirmedBookings.length}
            </p>
            <p className="text-sm text-white opacity-90">Confirmed Bookings</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 p-4 rounded-lg text-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/25 animate-fade-in-up animation-delay-100">
            <p className="text-2xl font-bold text-white animate-bounce-in animation-delay-150">
              {pendingBookings.length}
            </p>
            <p className="text-sm text-white opacity-90">Pending Bookings</p>
          </div>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-lg text-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 animate-slide-in-right animation-delay-200">
            <p className="text-2xl font-bold text-white animate-bounce-in animation-delay-300">
              {confirmedBookings.length + pendingBookings.length}
            </p>
            <p className="text-sm text-white opacity-90">Total Bookings</p>
          </div>
        </div>
      )}

      {/* Confirmed Bookings Section with Enhanced Animations */}
      <div className="animate-fade-in-left">
        <h2 className="text-xl text-white font-semibold mb-4 flex items-center gap-2 animate-slide-in-left">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          Confirmed Bookings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {confirmedBookings.length > 0 ? (
            confirmedBookings.map((booking, index) => (
              <div
                key={booking.id}
                className="bg-gray-900 p-4 rounded-lg shadow-md hover:bg-gray-800 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 cursor-pointer border border-green-500/20 hover:border-green-500/40 transform hover:scale-[1.02] hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => openModal(booking)}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={booking.image}
                    alt={booking.title}
                    className="w-16 h-16 rounded-md border-2 border-green-400 object-cover transform hover:scale-110 transition-transform duration-300"
                  />
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-white group-hover:text-green-300 transition-colors duration-300">
                      {booking.title}
                    </h3>
                    <p className="text-sm text-gray-400 animate-fade-in animation-delay-100">
                      {booking.location}
                    </p>
                    <p className="text-xs text-gray-300 animate-fade-in animation-delay-200">
                      {booking.date}
                    </p>
                    <div className="flex items-center justify-between mt-2 animate-fade-in animation-delay-300">
                      <span className="text-xs text-gray-400">
                        👥 {booking.guests}
                      </span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full animate-pulse">
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-gray-800 border-2 border-dashed border-gray-600 p-8 rounded-lg text-center animate-fade-in transform hover:scale-105 transition-transform duration-300">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-400 animate-fade-in animation-delay-200">
                No confirmed bookings.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pending Bookings Section with Enhanced Animations */}
      <div className="animate-fade-in-right">
        <h2 className="text-xl text-white font-semibold mb-4 flex items-center gap-2 animate-slide-in-right">
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
          Pending Bookings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingBookings.length > 0 ? (
            pendingBookings.map((booking, index) => (
              <div
                key={booking.id}
                className="bg-gray-800 p-4 rounded-lg shadow-md hover:bg-gray-700 hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300 cursor-pointer border border-yellow-500/20 hover:border-yellow-500/40 transform hover:scale-[1.02] hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => openModal(booking)}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={booking.image}
                    alt={booking.title}
                    className="w-16 h-16 rounded-md border-2 border-yellow-400 object-cover transform hover:scale-110 transition-transform duration-300"
                  />
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-white group-hover:text-yellow-300 transition-colors duration-300">
                      {booking.title}
                    </h3>
                    <p className="text-sm text-gray-400 animate-fade-in animation-delay-100">
                      {booking.location}
                    </p>
                    <p className="text-xs text-gray-300 animate-fade-in animation-delay-200">
                      {booking.date}
                    </p>
                    <div className="flex items-center justify-between mt-2 animate-fade-in animation-delay-300">
                      <span className="text-xs text-gray-400">
                        👥 {booking.guests}
                      </span>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full animate-pulse">
                        {booking.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-gray-800 border-2 border-dashed border-gray-600 p-8 rounded-lg text-center animate-fade-in transform hover:scale-105 transition-transform duration-300">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-400 animate-fade-in animation-delay-200">
                No pending bookings.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for booking details */}
      {selectedBooking && (
        <BaseModal
          isOpen={!!selectedBooking}
          onClose={closeModal}
          title="Booking Details"
          icon={<FaInfoCircle />}
          maxWidth="md:max-w-lg"
          minWidth="min-w-96"
        >
          <div className="space-y-4">
            <img
              src={selectedBooking.image}
              alt={selectedBooking.title}
              className="w-full rounded-lg mb-3"
            />
            <div className="space-y-3">
              <p className="text-gray-300">
                <strong>Title:</strong> {selectedBooking.title}
              </p>
              <p className="text-gray-300">
                <strong>Location:</strong> {selectedBooking.location}
              </p>
              <p className="text-gray-300">
                <strong>Date:</strong> {selectedBooking.date}
              </p>
              <p className="text-gray-300">
                <strong>Guests:</strong> {selectedBooking.guests}
              </p>
              <p className="text-gray-300">
                <strong>Status:</strong> {selectedBooking.status}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={closeModal}
              className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              Close
            </button>
            {selectedBooking.status === "pending" && (
              <>
                <button
                  onClick={handleDecline}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Decline
                </button>
                <button
                  onClick={handleAccept}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  Accept
                </button>
              </>
            )}
          </div>
        </BaseModal>
      )}
    </div>
  );
};

export default BookingsComponent;
