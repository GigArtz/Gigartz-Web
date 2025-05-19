import { useSelector } from "react-redux";
import Header from "../components/Header";
import React, { useEffect, useState } from "react";
import { RootState } from "../../store/store";

function Bookings() {
  const [bookingz, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const { profile } = useSelector((state: RootState) => state.profile);

  useEffect(() => {
    if (profile?.myBookings) {
      const mappedBookings = profile.myBookings.map((booking) => ({
        id: booking.id,
        title: booking.eventDetails || "No Title",
        location: booking.venue || "No Venue",
        date: new Date(booking.date.seconds * 1000).toLocaleDateString(),
        guests: booking.additionalInfo || "N/A",
        price: "N/A", // Adjust if price is available
        status: booking.status,
        image: "https://via.placeholder.com/150", // Replace with actual image if available
      }));
      setBookings(mappedBookings);
    }
  }, [profile]);

  const openModal = (booking) => {
    setSelectedBooking(booking);
  };

  const closeModal = () => {
    setSelectedBooking(null);
  };

  const handleAccept = () => {
    console.log(`Accepted booking: ${selectedBooking.title}`);
    closeModal();
  };

  const handleDecline = () => {
    console.log(`Declined booking: ${selectedBooking.title}`);
    closeModal();
  };

  return (
    <div className="main-content p-2">
      <Header title="Bookings" />
      <div className="flex flex-wrap w-full justify-center md:grid md:grid-cols-2 gap-4">
        {bookingz.map((booking) => (
          <div
            key={booking.id}
            className="bg-gray-900 p-4 rounded-lg shadow-md w-full flex items-center gap-4 cursor-pointer"
            onClick={() => openModal(booking)}
          >
            {/* Booking Image */}
            <img
              src={booking.image}
              alt={booking.title}
              className="w-16 h-16 rounded-md border-2 border-teal-400"
            />

            {/* Booking Details */}
            <div className="flex-grow">
              <h2 className="text-lg font-semibold text-white line-clamp-1">
                {booking.title}
              </h2>
              <p className="text-sm text-gray-400">{booking.location}</p>
              <p className="text-xs text-gray-300">{booking.date}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Booking Details */}
      {selectedBooking && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-900 p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-lg font-semibold text-white mb-4">
              Booking Details
            </h2>
            <img
              src={selectedBooking.image}
              alt={selectedBooking.title}
              className="w-full rounded-lg mb-3"
            />
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

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={closeModal}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={handleDecline}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bookings;
