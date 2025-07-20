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

  // Group bookings by event title
  const groupBookingsByEvent = (bookings: any[]) => {
    const grouped = bookings.reduce((acc, booking) => {
      const eventTitle = booking.title;
      if (!acc[eventTitle]) {
        acc[eventTitle] = [];
      }
      acc[eventTitle].push(booking);
      return acc;
    }, {});
    return grouped;
  };

  const groupedConfirmedBookings = React.useMemo(
    () => groupBookingsByEvent(confirmedBookings),
    [confirmedBookings]
  );
  const groupedPendingBookings = React.useMemo(
    () => groupBookingsByEvent(pendingBookings),
    [pendingBookings]
  );

  // Modal state for booking actions
  const [selectedBooking, setSelectedBooking] = useState(null);
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
              <div className="space-y-6">
                {/* Compact Summary Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gradient-to-r from-green-600 to-green-700 p-3 rounded-lg text-center">
                    <p className="text-lg font-bold text-white">
                      {confirmedBookings.length}
                    </p>
                    <p className="text-xs text-white opacity-90">Confirmed</p>
                  </div>
                  <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 p-3 rounded-lg text-center">
                    <p className="text-lg font-bold text-white">
                      {pendingBookings.length}
                    </p>
                    <p className="text-xs text-white opacity-90">Pending</p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 rounded-lg text-center">
                    <p className="text-lg font-bold text-white">
                      {confirmedBookings.length + pendingBookings.length}
                    </p>
                    <p className="text-xs text-white opacity-90">Total</p>
                  </div>
                </div>

                {/* Confirmed Bookings - Compact */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Confirmed
                    </h3>
                    {Object.keys(groupedConfirmedBookings).length > 0 && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                        {confirmedBookings.length}
                      </span>
                    )}
                  </div>

                  {Object.keys(groupedConfirmedBookings).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(groupedConfirmedBookings).map(
                        ([eventTitle, bookings]) => (
                          <div key={eventTitle} className="space-y-2">
                            {/* Event Group Header */}
                            <div
                              className="bg-gray-900 p-3 rounded-lg border border-green-400/30 cursor-pointer hover:bg-gray-800 transition-colors"
                              onClick={() =>
                                toggleGroup(`confirmed-${eventTitle}`)
                              }
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="text-md font-semibold text-green-300 flex items-center gap-2">
                                  <svg
                                    className={`w-4 h-4 transition-transform ${
                                      collapsedGroups.has(
                                        `confirmed-${eventTitle}`
                                      )
                                        ? "rotate-0"
                                        : "rotate-90"
                                    }`}
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
                                    className="w-4 h-4"
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
                                  {eventTitle}
                                </h4>
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                                  {(bookings as any[]).length} booking
                                  {(bookings as any[]).length !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                <span>
                                  📍 {(bookings as any[])[0].location}
                                </span>
                                <span>📅 {(bookings as any[])[0].date}</span>
                              </div>
                            </div>

                            {/* Individual Bookings - Collapsible */}
                            {!collapsedGroups.has(
                              `confirmed-${eventTitle}`
                            ) && (
                              <div className="space-y-2">
                                {(bookings as any[]).map((booking) => (
                                  <div
                                    key={booking.id}
                                    className="bg-gray-800 border border-gray-700 hover:border-green-500 transition-all duration-200 p-3 rounded-lg cursor-pointer group ml-4"
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
                    <div className="bg-gray-800 border-2 border-dashed border-gray-600 p-4 rounded-lg text-center">
                      <svg
                        className="w-8 h-8 mx-auto mb-2 text-gray-400"
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
                      <p className="text-gray-400 text-sm">
                        No confirmed bookings
                      </p>
                    </div>
                  )}
                </div>

                {/* Pending Bookings - Compact */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      Pending
                    </h3>
                    {Object.keys(groupedPendingBookings).length > 0 && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                        {pendingBookings.length}
                      </span>
                    )}
                  </div>

                  {Object.keys(groupedPendingBookings).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(groupedPendingBookings).map(
                        ([eventTitle, bookings]) => (
                          <div key={eventTitle} className="space-y-2">
                            {/* Event Group Header */}
                            <div
                              className="bg-gray-900 p-3 rounded-lg border border-yellow-400/30 cursor-pointer hover:bg-gray-800 transition-colors"
                              onClick={() =>
                                toggleGroup(`pending-${eventTitle}`)
                              }
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="text-md font-semibold text-yellow-300 flex items-center gap-2">
                                  <svg
                                    className={`w-4 h-4 transition-transform ${
                                      collapsedGroups.has(
                                        `pending-${eventTitle}`
                                      )
                                        ? "rotate-0"
                                        : "rotate-90"
                                    }`}
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
                                    className="w-4 h-4"
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
                                  {eventTitle}
                                </h4>
                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                                  {(bookings as any[]).length} booking
                                  {(bookings as any[]).length !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                <span>
                                  📍 {(bookings as any[])[0].location}
                                </span>
                                <span>📅 {(bookings as any[])[0].date}</span>
                              </div>
                            </div>

                            {/* Individual Bookings - Collapsible */}
                            {!collapsedGroups.has(`pending-${eventTitle}`) && (
                              <div className="space-y-2">
                                {(bookings as any[]).map((booking) => (
                                  <div
                                    key={booking.id}
                                    className="bg-gray-800 border border-gray-700 hover:border-yellow-500 transition-all duration-200 p-3 rounded-lg cursor-pointer group ml-4"
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

                                          {/* Compact Action Buttons */}
                                          <div className="flex gap-1">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedBooking(booking);
                                                handleAccept();
                                              }}
                                              className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs transition-colors"
                                            >
                                              ✓
                                            </button>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedBooking(booking);
                                                handleDecline();
                                              }}
                                              className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs transition-colors"
                                            >
                                              ✕
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
                    <div className="bg-gray-800 border-2 border-dashed border-gray-600 p-4 rounded-lg text-center">
                      <svg
                        className="w-8 h-8 mx-auto mb-2 text-gray-400"
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
                      <p className="text-gray-400 text-sm">
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
                            <h4 className="font-semibold text-white">
                              Event Title
                            </h4>
                          </div>
                          <p className="text-gray-300">
                            {selectedBooking.title}
                          </p>
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
                            <h4 className="font-semibold text-white">
                              Location
                            </h4>
                          </div>
                          <p className="text-gray-300">
                            {selectedBooking.location}
                          </p>
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
                          <p className="text-gray-300">
                            {selectedBooking.date}
                          </p>
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
                            <h4 className="font-semibold text-white">
                              Guests Info
                            </h4>
                          </div>
                          <p className="text-gray-300">
                            {selectedBooking.guests}
                          </p>
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
