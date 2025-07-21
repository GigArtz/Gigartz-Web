import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import BaseModal from "./BaseModal";
import { FaInfoCircle } from "react-icons/fa";
import BookingsComponent from "./BookingsComponent";

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
        <ul className="flex flex-nowrap justify-between overflow-x-auto custom-scrollbar gap-x-4 -mb-px px-4">
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
                <BookingsComponent compact={true} />
              </div>
            )}

            {/* --- Event Revenue Tab --- */}
            {activeTab === "events" && (
              <div className="text-white space-y-4">
                {userEventProfit &&
                Array.isArray(userEventProfit) &&
                userEventProfit.length > 0 ? (
                  <div className="overflow-x-auto">
                    <div className="space-y-4">
                      {(userEventProfit as any[]).map((event: any) => (
                        <div
                          key={event.id}
                          className="bg-gray-800 rounded-lg p-4 shadow-md hover:shadow-lg transition"
                        >
                          <h3 className="text-white font-semibold text-lg mb-2">
                            {event.eventInfo?.title || "Unknown Event"}
                          </h3>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 text-sm text-gray-300">
                            <div className="flex justify-between">
                              <span>Total Sales</span>
                              <span className="text-green-400">
                                R
                                {event.totalSales
                                  ? event.totalSales.toFixed(2)
                                  : "0.00"}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span>Your Revenue</span>
                              <span className="text-teal-400">
                                R
                                {event.totalRevenue
                                  ? event.totalRevenue.toFixed(2)
                                  : "0.00"}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span>Platform Fee</span>
                              <span className="text-red-400">
                                R
                                {event.totalPlatformRevenue
                                  ? event.totalPlatformRevenue.toFixed(2)
                                  : "0.00"}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span>Tickets Sold</span>
                              <span>
                                {(event.vipTicketCount || 0) +
                                  (event.generalTicketCount || 0)}
                                {event.vipTicketCount > 0 && (
                                  <span className="text-yellow-400 text-xs ml-1">
                                    ({event.vipTicketCount} VIP)
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Summary Stats */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-1">
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
