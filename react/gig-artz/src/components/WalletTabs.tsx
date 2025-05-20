import React, { useState } from "react";
import EventCard from "./EventCard";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

function WalletTabs({ uid }) {
  // Use RootState for type safety
  const { loading, error, userBookings, userBookingsRequests } = useSelector(
    (state: RootState) => state.profile
  );

  // State to track active tab
  const [activeTab, setActiveTab] = useState("walletOverview");

  // Bookings data from Redux (same as Bookings page)
  const confirmedBookings = (userBookings || []).map((booking) => ({
    id: booking.id,
    title: booking.eventDetails || "No Title",
    location: booking.venue || "No Venue",
    date:
      booking.date && booking.date.seconds
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
  }));
  const pendingBookings = (userBookingsRequests || []).map((booking) => ({
    id: booking.id,
    title: booking.eventDetails || "No Title",
    location: booking.venue || "No Venue",
    date:
      booking.date && booking.date.seconds
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
  }));

  // Modal state for booking actions
  const [selectedBooking, setSelectedBooking] = useState(null);

  const openModal = (booking) => setSelectedBooking(booking);
  const closeModal = () => setSelectedBooking(null);
  const handleAccept = () => {
    if (selectedBooking) {
      // TODO: Add accept logic here
      console.log(`Accepted booking: ${selectedBooking.title}`);
      closeModal();
    }
  };
  const handleDecline = () => {
    if (selectedBooking) {
      // TODO: Add decline logic here
      console.log(`Declined booking: ${selectedBooking.title}`);
      closeModal();
    }
  };

  return (
    <div className=" rounded-lg shadow-md">
      {/* Tabs */}
      <div className="tabs">
        <ul className="flex flex-nowrap justify-between overflow-x-auto hide-scrollbar gap-x-4 -mb-px px-4">
          {[
            { key: "walletOverview", label: "Overview" },
            { key: "earnings", label: "Earnings" },
            { key: "payouts", label: "Payouts" },
            { key: "bookings", label: "Bookings" },
          ].map(({ key, label }) => (
            <li key={key}>
              <button
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-t-lg transition-all duration-200 ${
                  activeTab === key
                    ? " border-teal-500 text-lg text-white bg-teal-900"
                    : "border-transparent hover:text-gray-400 hover:border-gray-400 dark:hover:text-gray-300"
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {/* Spinner */}
        {loading && (
          <div className="flex justify-center">
            <div className="animate-spin h-7 w-7 border-4 border-teal-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {error && <p className="text-red-500">Error: {error}</p>}

        {!loading && !error && (
          <>
            {/* Wallet Overview */}
            {activeTab === "walletOverview" && (
              <div className="text-white space-y-4">
                <div className="bg-gray-800 p-4 rounded-md">
                  <h3 className="text-lg font-semibold">Wallet Balance</h3>
                  <p className="text-2xl font-bold mt-2">R 2,340.50</p>
                  <button className="mt-3 w-36 btn-primary rounded-3xl">
                    Withdraw Funds
                  </button>
                </div>

                {/* Recent Transactions */}
                <div className="bg-gray-800 p-4 rounded-md">
                  <h3 className="text-lg font-semibold">Recent Transactions</h3>
                  <ul className="mt-2 space-y-2">
                    {[
                      { id: 1, type: "Event Earnings", amount: "R450.00" },
                      { id: 2, type: "Tips", amount: "R20.00" },
                      { id: 3, type: "Booking Fee", amount: "R75.00" },
                    ].map((txn) => (
                      <li
                        key={txn.id}
                        className="flex justify-between text-gray-300"
                      >
                        <span>{txn.type}</span>
                        <span className="text-teal-400">{txn.amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Earnings */}
            {activeTab === "earnings" && (
              <div className="text-white space-y-4">
                <h3 className="text-lg font-semibold">Earnings Breakdown</h3>
                <ul className="space-y-2">
                  {[
                    { label: "Event Revenue", amount: "R1,200.00" },
                    { label: "Tips Received", amount: "R320.00" },
                    { label: "Booking Fees", amount: "R820.00" },
                  ].map((earning) => (
                    <li
                      key={earning.label}
                      className="flex justify-between text-gray-300"
                    >
                      <span>{earning.label}</span>
                      <span className="text-teal-400">{earning.amount}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Payout Requests */}
            {activeTab === "payouts" && (
              <div className="text-white space-y-4">
                <h3 className="text-lg font-semibold">Payout Requests</h3>
                <p className="text-gray-400">No pending payout requests.</p>
                <button className="w-36 btn-primary rounded-3xl">
                  Request Payout
                </button>
              </div>
            )}

            {/* Bookings */}
            {activeTab === "bookings" && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Confirmed Bookings
                  </h3>
                  {confirmedBookings.length > 0 ? (
                    confirmedBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-gray-900 p-4 rounded-lg shadow-md w-full flex items-center gap-4 mb-2 cursor-pointer"
                        onClick={() => openModal(booking)}
                      >
                        <img
                          src={booking.image}
                          alt={booking.title}
                          className="w-16 h-16 rounded-md border-2 border-teal-400"
                        />
                        <div className="flex-grow">
                          <h2 className="text-lg font-semibold text-white line-clamp-1">
                            {booking.title}
                          </h2>
                          <p className="text-sm text-gray-400">
                            {booking.location}
                          </p>
                          <p className="text-xs text-gray-300">
                            {booking.date}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center mt-4">
                      No confirmed bookings.
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2 mt-4">
                    Pending Bookings
                  </h3>
                  {pendingBookings.length > 0 ? (
                    pendingBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-gray-800 p-4 rounded-lg shadow-md w-full flex items-center gap-4 mb-2 cursor-pointer"
                        onClick={() => openModal(booking)}
                      >
                        <img
                          src={booking.image}
                          alt={booking.title}
                          className="w-16 h-16 rounded-md border-2 border-teal-400"
                        />
                        <div className="flex-grow">
                          <h2 className="text-lg font-semibold text-white line-clamp-1">
                            {booking.title}
                          </h2>
                          <p className="text-sm text-gray-400">
                            {booking.location}
                          </p>
                          <p className="text-xs text-gray-300">
                            {booking.date}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center mt-4">
                      No pending bookings.
                    </p>
                  )}
                </div>
                {/* Modal for Booking Details */}
                {selectedBooking && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
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
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default WalletTabs;
