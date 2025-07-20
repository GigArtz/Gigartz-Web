import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import BaseModal from "./BaseModal";
import { FaInfoCircle } from "react-icons/fa";

function WalletTabs() {
  // Use RootState for type safety
  const {
    loading,
    error,
    userBookings,
    userBookingsRequests,
    userEventProfit,
    userTickets,
    userFollowing,
  } = useSelector((state: RootState) => state.profile);

  // State to track active tab
  const [activeTab, setActiveTab] = useState("walletOverview");

  // Note: Using 'any' types here due to lack of proper TypeScript interfaces for profile data
  // In a production app, these should be replaced with proper interface definitions

  // Calculate wallet data from user profile and tickets
  const calculateWalletData = () => {
    // Calculate total earnings from tickets
    const totalTicketEarnings = ((userTickets as any[]) || []).reduce(
      (total, ticket: any) => {
        const amount =
          typeof ticket?.amount === "string"
            ? parseFloat(ticket.amount)
            : ticket?.amount || 0;
        return total + amount;
      },
      0
    );

    // Calculate total tips received
    const totalTipsReceived = ((userFollowing as any[]) || []).reduce(
      (total, user: any) => {
        return total + (user?.totalTipsReceived || 0);
      },
      0
    );

    // Calculate total earnings from userEventProfit
    const eventEarnings = ((userEventProfit as any[]) || []).reduce(
      (total, event: any) => {
        return total + (event?.totalRevenue || 0);
      },
      0
    );

    // Calculate platform revenue (what the platform takes)
    const platformRevenue = ((userEventProfit as any[]) || []).reduce(
      (total, event: any) => {
        return total + (event?.totalPlatformRevenue || 0);
      },
      0
    );

    // Total wallet balance (assuming this is what the user actually gets)
    const totalBalance = eventEarnings + totalTipsReceived;

    return {
      totalBalance,
      totalTicketEarnings,
      totalTipsReceived,
      eventEarnings,
      platformRevenue,
      totalSales: ((userEventProfit as any[]) || []).reduce(
        (total, event: any) => total + (event?.totalSales || 0),
        0
      ),
    };
  };

  const walletData = calculateWalletData();

  // Generate recent transactions from various sources
  const getRecentTransactions = () => {
    const transactions: Array<{
      id: string;
      type: string;
      amount: string;
      eventTitle?: string;
      from?: string;
    }> = [];

    // Add event earnings
    ((userEventProfit as any[]) || []).slice(0, 3).forEach((event: any) => {
      if (event?.totalRevenue > 0) {
        transactions.push({
          id: event.id,
          type: "Event Earnings",
          amount: `R${event.totalRevenue.toFixed(2)}`,
          eventTitle: event.eventInfo?.title || "Event",
        });
      }
    });

    // Add tips from followers (if any)
    ((userFollowing as any[]) || []).forEach((user: any) => {
      if (user?.totalTipsReceived > 0) {
        transactions.push({
          id: user.id,
          type: "Tips Received",
          amount: `R${user.totalTipsReceived.toFixed(2)}`,
          from: user.name || user.userName,
        });
      }
    });

    // Add recent ticket purchases (as booking fees if user is event host)
    ((userTickets as any[]) || []).slice(0, 2).forEach((ticket: any) => {
      const amount =
        typeof ticket?.amount === "string"
          ? parseFloat(ticket.amount)
          : ticket?.amount || 0;
      transactions.push({
        id: ticket.id,
        type: "Ticket Sale",
        amount: `R${amount.toFixed(2)}`,
        eventTitle: ticket.eventName,
      });
    });

    return transactions.slice(0, 5); // Return only the 5 most recent
  };

  const recentTransactions = getRecentTransactions();

  // Bookings data from Redux (same as Bookings page)
  const confirmedBookings = ((userBookings as any[]) || []).map(
    (booking: any) => ({
      id: booking.id,
      title: booking.eventDetails || "No Title",
      location: booking.venue || "No Venue",
      date:
        booking.date && typeof booking.date === "object" && booking.date.seconds
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
    })
  );
  const pendingBookings = ((userBookingsRequests as any[]) || []).map(
    (booking: any) => ({
      id: booking.id,
      title: booking.eventDetails || "No Title",
      location: booking.venue || "No Venue",
      date:
        booking.date && typeof booking.date === "object" && booking.date.seconds
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
    })
  );

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
            // --- New tab for Event Revenue ---
            { key: "events", label: "Events" },
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
                  <p className="text-2xl font-bold mt-2">
                    R {(walletData.totalBalance || 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Total Earnings: R{" "}
                    {(walletData.eventEarnings || 0).toFixed(2)} | Tips: R{" "}
                    {(walletData.totalTipsReceived || 0).toFixed(2)}
                  </p>
                  <button className="mt-3 w-36 btn-primary rounded-3xl">
                    Withdraw Funds
                  </button>
                </div>

                {/* Recent Transactions */}
                <div className="bg-gray-800 p-4 rounded-md">
                  <h3 className="text-lg font-semibold">Recent Transactions</h3>
                  <ul className="mt-2 space-y-2">
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map((txn) => (
                        <li
                          key={txn.id}
                          className="flex justify-between text-gray-300"
                        >
                          <span>
                            {txn.type} {txn.eventTitle && `- ${txn.eventTitle}`}
                          </span>
                          <span className="text-teal-400">{txn.amount}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-400">No recent transactions</li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* Earnings */}
            {activeTab === "earnings" && (
              <div className="text-white space-y-4">
                <h3 className="text-lg font-semibold">Earnings Breakdown</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between text-gray-300">
                    <span>Event Revenue</span>
                    <span className="text-teal-400">
                      R{(walletData.eventEarnings || 0).toFixed(2)}
                    </span>
                  </li>
                  <li className="flex justify-between text-gray-300">
                    <span>Tips Received</span>
                    <span className="text-teal-400">
                      R{(walletData.totalTipsReceived || 0).toFixed(2)}
                    </span>
                  </li>
                  <li className="flex justify-between text-gray-300">
                    <span>Ticket Sales</span>
                    <span className="text-teal-400">
                      R{(walletData.totalTicketEarnings || 0).toFixed(2)}
                    </span>
                  </li>
                  <li className="flex justify-between text-gray-300 border-t pt-2 mt-2">
                    <span className="font-semibold">Total Earnings</span>
                    <span className="text-teal-400 font-semibold">
                      R{(walletData.totalBalance || 0).toFixed(2)}
                    </span>
                  </li>
                </ul>
                <div className="bg-gray-800 p-3 rounded-md">
                  <p className="text-sm text-gray-400">
                    Platform Revenue: R
                    {(walletData.platformRevenue || 0).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400">
                    Total Sales: R{(walletData.totalSales || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            )}

            {/* Payout Requests */}
            {activeTab === "payouts" && (
              <div className="text-white space-y-4">
                <h3 className="text-lg font-semibold">Payout Requests</h3>
                <div className="bg-gray-800 p-4 rounded-md">
                  <p className="text-gray-400">No pending payout requests.</p>
                  <div className="mt-4">
                    <p className="text-sm text-gray-300 mb-2">
                      Available for withdrawal: R
                      {(walletData.totalBalance || 0).toFixed(2)}
                    </p>
                    <button
                      className="w-36 btn-primary rounded-3xl"
                      disabled={(walletData.totalBalance || 0) <= 0}
                    >
                      Request Payout
                    </button>
                  </div>
                </div>
                {/* Payout History - could be expanded with actual data */}
                <div className="bg-gray-800 p-4 rounded-md">
                  <h4 className="text-md font-medium mb-2">Payout History</h4>
                  <p className="text-gray-400 text-sm">
                    No previous payouts found.
                  </p>
                </div>
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
                <BaseModal
                  isOpen={selectedBooking !== null}
                  onClose={closeModal}
                  title="Booking Details"
                  icon={<FaInfoCircle />}
                  maxWidth="md:max-w-md"
                >
                  {selectedBooking && (
                    <div className="space-y-4">
                      <img
                        src={selectedBooking.image}
                        alt={selectedBooking.title}
                        className="w-full rounded-lg mb-3"
                      />
                      <div className="space-y-2">
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
                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          onClick={handleDecline}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                          Decline
                        </button>
                        <button
                          onClick={handleAccept}
                          className="bg-teal-500 text-white px-4 py-2 rounded hover:bg-teal-600"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  )}
                </BaseModal>
              </div>
            )}

            {/* --- Event Revenue Tab --- */}
            {activeTab === "events" && (
              <div className="text-white space-y-4">
                <h3 className="text-lg font-semibold mb-4">Event Revenue</h3>
                {userEventProfit &&
                Array.isArray(userEventProfit) &&
                userEventProfit.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-gray-800 rounded-lg">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left">Event</th>
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-left">Venue</th>
                          <th className="px-4 py-2 text-left">Total Sales</th>
                          <th className="px-4 py-2 text-left">Your Revenue</th>
                          <th className="px-4 py-2 text-left">Platform Fee</th>
                          <th className="px-4 py-2 text-left">Tickets Sold</th>
                          <th className="px-4 py-2 text-left">Gallery</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(userEventProfit as any[]).map((event: any) => (
                          <tr
                            key={event.id}
                            className="border-b border-gray-700"
                          >
                            <td className="px-4 py-2">
                              {event.eventInfo?.title || "Unknown Event"}
                            </td>
                            <td className="px-4 py-2">
                              {event.eventInfo?.date
                                ? new Date(
                                    event.eventInfo.date
                                  ).toLocaleDateString()
                                : "N/A"}
                            </td>
                            <td className="px-4 py-2">
                              {event.eventInfo?.venue || "N/A"}
                            </td>
                            <td className="px-4 py-2 text-green-400">
                              R
                              {event.totalSales
                                ? event.totalSales.toFixed(2)
                                : "0.00"}
                            </td>
                            <td className="px-4 py-2 text-teal-400">
                              R
                              {event.totalRevenue
                                ? event.totalRevenue.toFixed(2)
                                : "0.00"}
                            </td>
                            <td className="px-4 py-2 text-red-400">
                              R
                              {event.totalPlatformRevenue
                                ? event.totalPlatformRevenue.toFixed(2)
                                : "0.00"}
                            </td>
                            <td className="px-4 py-2">
                              {(event.vipTicketCount || 0) +
                                (event.generalTicketCount || 0) || 0}
                              {event.vipTicketCount && (
                                <span className="text-yellow-400 text-xs ml-1">
                                  ({event.vipTicketCount} VIP)
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2">
                              {event.eventInfo?.gallery &&
                              event.eventInfo.gallery.length > 0 ? (
                                <div className="flex gap-1">
                                  {event.eventInfo.gallery
                                    .slice(0, 2)
                                    .map((img: string, idx: number) => (
                                      <img
                                        key={idx}
                                        src={img}
                                        alt="gallery"
                                        className="w-10 h-10 object-cover rounded"
                                        onError={(e) => {
                                          (
                                            e.target as HTMLImageElement
                                          ).style.display = "none";
                                        }}
                                      />
                                    ))}
                                  {event.eventInfo.gallery.length > 2 && (
                                    <span className="text-gray-400 text-xs">
                                      +{event.eventInfo.gallery.length - 2}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">No images</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Summary Stats */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-700 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-teal-400">
                          R{(walletData.totalSales || 0).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-300">Total Sales</p>
                      </div>
                      <div className="bg-gray-700 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-400">
                          R{(walletData.eventEarnings || 0).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-300">Your Revenue</p>
                      </div>
                      <div className="bg-gray-700 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-red-400">
                          R{(walletData.platformRevenue || 0).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-300">Platform Fees</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-800 p-6 rounded-lg text-center">
                    <p className="text-gray-400">
                      No event revenue data available.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Revenue will appear here once you start hosting paid
                      events.
                    </p>
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
